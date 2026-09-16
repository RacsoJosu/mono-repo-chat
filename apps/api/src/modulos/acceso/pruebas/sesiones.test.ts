import { randomUUID } from "node:crypto";
import { base32 } from "@better-auth/utils/base32";
import { createOTP } from "@better-auth/utils/otp";
import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";
import { afterAll, expect, test } from "vitest";
import { crearAplicacionPrueba } from "./crear-aplicacion-prueba.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const suite = test.skipIf(!url);
const conexiones = new Pool({ connectionString: url });
afterAll(async () => {
  await conexiones.end();
});

suite(
  "exige cambio de clave y TOTP, rechaza CSRF y revoca sesiones en servidor",
  async () => {
    const destino = new URL(url ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(destino.hostname) ||
      !destino.pathname.endsWith("_pruebas")
    )
      throw new Error("Base de pruebas local requerida.");
    const id = randomUUID();
    const email = `${id}@example.test`;
    const claveInicial = "Inicial-prueba-12345";
    const claveNueva = "Nueva-prueba-98765";
    const aplicacion = await crearAplicacionPrueba();
    const cookies = new Map<string, string>();
    const enviar = async (
      ruta: string,
      contenido?: Record<string, unknown>,
      origen = "http://localhost:3000",
    ) => {
      const respuesta = await aplicacion.inject({
        method: contenido ? "POST" : "GET",
        url: ruta,
        headers: {
          origin: origen,
          cookie: [...cookies].map(([nombre, valor]) => `${nombre}=${valor}`).join("; "),
        },
        ...(contenido ? { payload: contenido } : {}),
      });
      for (const cookie of respuesta.cookies) {
        if (!cookie.value) cookies.delete(cookie.name);
        else cookies.set(cookie.name, cookie.value);
      }
      return respuesta;
    };
    try {
      await conexiones.query('INSERT INTO "user" (id, name, email) VALUES ($1, $2, $3)', [
        id,
        "Prueba acceso",
        email,
      ]);
      await conexiones.query(
        "INSERT INTO account (id, account_id, provider_id, user_id, password, updated_at) VALUES ($1, $1, $2, $1, $3, now())",
        [id, "credential", await hashPassword(claveInicial)],
      );
      const rechazo = await enviar("/api/auth/sign-in/email", {
        email,
        password: "Incorrecta-prueba-123",
      });
      expect(rechazo.statusCode).toBe(401);
      expect(rechazo.json()).toMatchObject({
        error: { code: expect.any(String), details: [], requestId: expect.any(String) },
      });
      const ingreso = await enviar("/api/auth/sign-in/email", { email, password: claveInicial });
      expect(ingreso.statusCode, ingreso.body).toBe(200);
      expect(ingreso.json()).not.toHaveProperty("token");
      expect(ingreso.cookies.find((cookie) => cookie.name.endsWith("session_token"))).toMatchObject(
        { httpOnly: true, sameSite: "Lax" },
      );
      expect((await enviar("/api/acceso/estado")).json()).toMatchObject({ etapa: "cambiar_clave" });
      const mismaClave = await enviar("/api/auth/change-password", {
        currentPassword: claveInicial,
        newPassword: claveInicial,
      });
      expect(mismaClave.statusCode).toBe(400);
      const csrf = await enviar(
        "/api/auth/change-password",
        { currentPassword: claveInicial, newPassword: claveNueva },
        "http://intruso.example",
      );
      expect(csrf.statusCode).toBe(403);
      const cambio = await enviar("/api/auth/change-password", {
        currentPassword: claveInicial,
        newPassword: claveNueva,
        revokeOtherSessions: true,
      });
      expect(cambio.statusCode, cambio.body).toBe(200);
      expect((await enviar("/api/acceso/estado")).json()).toMatchObject({
        etapa: "segundo_factor",
      });
      expect((await enviar("/api/acceso/empresas")).statusCode).toBe(403);
      const inscripcion = await enviar("/api/auth/two-factor/enable", { password: claveNueva });
      expect(inscripcion.statusCode, inscripcion.body).toBe(200);
      const factores = inscripcion.json<{ totpURI: string; backupCodes: string[] }>();
      const secreto = new URL(factores.totpURI).searchParams.get("secret");
      expect(secreto).toBeTruthy();
      const codigo = await createOTP(new TextDecoder().decode(base32.decode(secreto ?? ""))).totp();
      const verificacion = await enviar("/api/auth/two-factor/verify-totp", { code: codigo });
      expect(verificacion.statusCode, verificacion.body).toBe(200);
      expect((await enviar("/api/acceso/estado")).json()).toMatchObject({ etapa: "listo" });
      expect((await enviar("/api/acceso/empresas")).json()).toEqual([]);
      const antesRenovar = await conexiones.query(
        "UPDATE session SET expires_at=now()+interval '1 hour' WHERE user_id=$1 RETURNING expires_at",
        [id],
      );
      const estadoSeguro = await enviar("/api/acceso/estado");
      expect(estadoSeguro.json()).toMatchObject({
        venceEn: expect.any(String),
        horaServidor: expect.any(String),
        segundoFactorConfigurado: true,
      });
      expect(estadoSeguro.json()).not.toHaveProperty("token");
      const despuesConsultar = await conexiones.query(
        "SELECT expires_at FROM session WHERE user_id=$1",
        [id],
      );
      expect(despuesConsultar.rows[0].expires_at).toEqual(antesRenovar.rows[0].expires_at);
      const renovacion = await enviar("/api/auth/get-session");
      expect(renovacion.statusCode).toBe(200);
      expect(
        renovacion.cookies.some(
          (cookie) => cookie.name.endsWith("session_token") && cookie.httpOnly,
        ),
      ).toBe(true);
      const despuesRenovar = await conexiones.query(
        "SELECT expires_at FROM session WHERE user_id=$1",
        [id],
      );
      expect(despuesRenovar.rows[0].expires_at.getTime()).toBeGreaterThan(
        antesRenovar.rows[0].expires_at.getTime(),
      );
      expect(renovacion.json()).not.toHaveProperty("session.token");
      const reemplazo = await enviar("/api/auth/two-factor/enable", { password: claveNueva });
      expect(reemplazo.statusCode).toBe(403);
      await conexiones.query("DELETE FROM session WHERE user_id = $1", [id]);
      expect((await enviar("/api/acceso/estado")).statusCode).toBe(401);
      cookies.clear();
      const reingreso = await enviar("/api/auth/sign-in/email", { email, password: claveNueva });
      expect(reingreso.json()).toMatchObject({ twoFactorRedirect: true });
      expect((await enviar("/api/acceso/estado")).statusCode).toBe(401);
      const recuperacion = await enviar("/api/auth/two-factor/verify-backup-code", {
        code: factores.backupCodes[0],
      });
      expect(recuperacion.statusCode, recuperacion.body).toBe(200);
      expect((await enviar("/api/acceso/estado")).json()).toMatchObject({ etapa: "listo" });
      const repeticion = await enviar("/api/auth/two-factor/verify-backup-code", {
        code: factores.backupCodes[0],
      });
      expect(repeticion.statusCode).not.toBe(200);
      await conexiones.query(
        "UPDATE session SET expires_at = now() - interval '1 minute' WHERE user_id = $1",
        [id],
      );
      expect((await enviar("/api/acceso/estado")).statusCode).toBe(401);
    } finally {
      await conexiones.query('DELETE FROM "user" WHERE id=$1', [id]);
      await aplicacion.close();
    }
  },
  20000,
);
