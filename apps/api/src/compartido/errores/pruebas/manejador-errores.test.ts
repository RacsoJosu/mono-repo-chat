import assert from "node:assert/strict";
import Fastify from "fastify";
import { test } from "vitest";
import { z } from "zod";
import { ErrorAplicacion } from "../error-aplicacion.js";
import { registrarManejadorErrores } from "../manejador-errores.plugin.js";

test("traduce categorías de aplicación a HTTP y conserva el contrato", async () => {
  const aplicacion = Fastify();
  registrarManejadorErrores(aplicacion);
  const casos = [
    ["validacion", 400],
    ["no_autenticado", 401],
    ["no_autorizado", 403],
    ["no_encontrado", 404],
    ["conflicto", 409],
    ["interno", 500],
  ] as const;
  for (const [categoria] of casos) {
    aplicacion.get(`/${categoria}`, async () => {
      throw new ErrorAplicacion("ERROR_PRUEBA", "Mensaje seguro.", categoria);
    });
  }
  try {
    for (const [categoria, estado] of casos) {
      const respuesta = await aplicacion.inject(`/${categoria}`);
      assert.equal(respuesta.statusCode, estado);
      const cuerpo = respuesta.json<{
        error: { code: string; message: string; details: unknown[]; requestId: string };
      }>();
      assert.equal(cuerpo.error.code, "ERROR_PRUEBA");
      assert.equal(cuerpo.error.message, "Mensaje seguro.");
      assert.deepEqual(cuerpo.error.details, []);
      assert.equal(typeof cuerpo.error.requestId, "string");
    }
  } finally {
    await aplicacion.close();
  }
});

test("normaliza Zod sin publicar mensajes ni datos internos del esquema", async () => {
  const aplicacion = Fastify();
  registrarManejadorErrores(aplicacion);
  aplicacion.post("/validacion", async (solicitud) => {
    return z.object({ nombre: z.string().min(3, "detalle interno privado") }).parse(solicitud.body);
  });
  try {
    const respuesta = await aplicacion.inject({
      method: "POST",
      url: "/validacion",
      payload: { nombre: "x" },
    });
    assert.equal(respuesta.statusCode, 400);
    assert.deepEqual(respuesta.json<{ error: { details: unknown[] } }>().error.details, [
      { campo: "nombre", regla: "too_small", mensaje: "El valor del campo no es válido." },
    ]);
    assert.equal(respuesta.body.includes("detalle interno privado"), false);
    assert.equal(respuesta.body.includes("minimum"), false);
  } finally {
    await aplicacion.close();
  }
});

test("oculta errores inesperados y responde con el contrato 404", async () => {
  const aplicacion = Fastify();
  registrarManejadorErrores(aplicacion);
  aplicacion.get("/fallo", async () => {
    throw new Error("secreto-infraestructura");
  });
  try {
    const fallo = await aplicacion.inject("/fallo");
    assert.equal(fallo.statusCode, 500);
    assert.equal(fallo.json<{ error: { code: string } }>().error.code, "ERROR_INTERNO");
    assert.equal(fallo.body.includes("secreto-infraestructura"), false);
    const ausente = await aplicacion.inject("/ausente");
    assert.equal(ausente.statusCode, 404);
    assert.equal(ausente.json<{ error: { code: string } }>().error.code, "NO_ENCONTRADO");
  } finally {
    await aplicacion.close();
  }
});
