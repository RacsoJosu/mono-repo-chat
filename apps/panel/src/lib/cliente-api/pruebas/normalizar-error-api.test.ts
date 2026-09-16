import assert from "node:assert/strict";
import { test } from "vitest";
import { normalizarErrorApi } from "../normalizar-error-api";

test("normaliza 400, 404 y 500 sin publicar mensajes internos", () => {
  for (const estado of [400, 404, 500]) {
    const error = normalizarErrorApi(estado, {
      error: {
        code: "ERROR_PRUEBA",
        message: "SQL secreto",
        details: [{ campo: "nombre", regla: "required", mensaje: "stack privado" }],
        requestId: "solicitud-123",
      },
    });
    assert.equal(error.estadoHttp, estado);
    assert.equal(error.identificadorSolicitud, "solicitud-123");
    assert.equal(error.message.includes("SQL"), false);
    assert.deepEqual(error.detalles, [
      { campo: "nombre", regla: "required", mensaje: "Revisa el valor de este campo." },
    ]);
  }
  const inesperado = normalizarErrorApi(500, { stack: "secreto" });
  assert.equal(inesperado.codigo, "RESPUESTA_INESPERADA");
  assert.equal(inesperado.identificadorSolicitud, undefined);
  assert.equal(
    normalizarErrorApi(500, { error: { requestId: "solicitud-456" } }).identificadorSolicitud,
    "solicitud-456",
  );
});
