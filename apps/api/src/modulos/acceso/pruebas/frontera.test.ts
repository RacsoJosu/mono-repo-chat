import { afterEach, expect, test } from "vitest";
import { crearAplicacionPrueba as crearAplicacion } from "./crear-aplicacion-prueba.js";

const aplicaciones: Awaited<ReturnType<typeof crearAplicacion>>[] = [];
afterEach(async () => {
  await Promise.all(aplicaciones.map((aplicacion) => aplicacion.close()));
  aplicaciones.length = 0;
});
test("el contexto de acceso exige sesión y no acepta identidad declarada en headers", async () => {
  const aplicacion = await crearAplicacion();
  aplicaciones.push(aplicacion);
  const respuesta = await aplicacion.inject({
    url: "/api/acceso/estado",
    headers: { "x-user-id": "administrador", "x-role": "owner" },
  });
  expect(respuesta.statusCode).toBe(401);
});
test("el registro público de cuentas permanece cerrado", async () => {
  const aplicacion = await crearAplicacion();
  aplicaciones.push(aplicacion);
  const respuesta = await aplicacion.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    payload: { email: "intruso@example.com", password: "Clave-intruso-123", name: "Intruso" },
  });
  expect(respuesta.statusCode).toBe(403);
});

test("rechaza credenciales de persona e integración simultáneas", async () => {
  const aplicacion = await crearAplicacion();
  aplicaciones.push(aplicacion);
  const respuesta = await aplicacion.inject({
    url: "/api/acceso/estado",
    headers: { cookie: "better-auth.session_token=sesion", authorization: "Bearer integracion" },
  });
  expect(respuesta.statusCode).toBe(400);
});
test("no expone administración ni recuperación pública de factores", async () => {
  const aplicacion = await crearAplicacion();
  aplicaciones.push(aplicacion);
  for (const ruta of [
    "organization/create",
    "two-factor/disable",
    "request-password-reset",
    "admin/oauth2/create-client",
  ]) {
    const respuesta = await aplicacion.inject({
      method: "POST",
      url: `/api/auth/${ruta}`,
      headers: { origin: "http://localhost:3000" },
      payload: {},
    });
    expect(respuesta.statusCode).toBe(403);
  }
});

test("no permite recordar el dispositivo ni sustituir TOTP por OTP", async () => {
  const aplicacion = await crearAplicacion();
  aplicaciones.push(aplicacion);
  for (const [ruta, payload] of [
    ["verify-totp", { code: "123456", trustDevice: true }],
    ["enable", { password: "Clave-prueba-1234", method: "otp" }],
    ["verify-backup-code", { code: "recuperacion", disableSession: true }],
  ] as const) {
    const respuesta = await aplicacion.inject({
      method: "POST",
      url: `/api/auth/two-factor/${ruta}`,
      headers: { origin: "http://localhost:3000" },
      payload,
    });
    expect(respuesta.statusCode).toBe(400);
  }
});
