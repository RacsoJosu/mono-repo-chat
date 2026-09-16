import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";
import { afterAll, expect, test } from "vitest";
import { crearAplicacionPrueba } from "../../acceso/pruebas/crear-aplicacion-prueba.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const conexiones = new Pool({ connectionString: url });
afterAll(() => conexiones.end());
test.skipIf(!url)(
  "HTTP exige MFA, valida parámetros, comprueba membresías y detecta revocación",
  async () => {
    const destino = new URL(url ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(destino.hostname) ||
      !destino.pathname.endsWith("_pruebas")
    )
      throw new Error("Base local requerida");
    const id = randomUUID();
    const empresa = randomUUID();
    const app = await crearAplicacionPrueba();
    try {
      await conexiones.query(
        "INSERT INTO \"user\"(id,name,email,debe_cambiar_clave) VALUES ($1,'Prueba',$2,false)",
        [id, `${id}@example.test`],
      );
      await conexiones.query(
        "INSERT INTO account(id,account_id,provider_id,user_id,password,updated_at) VALUES ($1,$1,'credential',$1,$2,now())",
        [id, await hashPassword("Clave-prueba-123456")],
      );
      await conexiones.query(
        "INSERT INTO organization(id,name,slug,created_at) VALUES ($1,'Prueba',$1,now())",
        [empresa],
      );
      await conexiones.query(
        "INSERT INTO member(id,organization_id,user_id,role,created_at) VALUES ($1,$2,$1,'member',now())",
        [id, empresa],
      );
      const ingreso = await app.inject({
        method: "POST",
        url: "/api/auth/sign-in/email",
        headers: { origin: "http://localhost:3000" },
        payload: { email: `${id}@example.test`, password: "Clave-prueba-123456" },
      });
      const cookie = ingreso.cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      const pedir = (ruta: string) => app.inject({ url: ruta, headers: { cookie } });
      const ruta = `/api/empresas/${empresa}/conversaciones`;
      expect((await pedir(ruta)).statusCode).toBe(403);
      await conexiones.query('UPDATE "user" SET two_factor_enabled=true WHERE id=$1', [id]);
      await conexiones.query(
        "UPDATE session SET segundo_factor_verificado_en=now() WHERE user_id=$1",
        [id],
      );
      expect((await pedir(ruta)).json()).toEqual({ conversaciones: [], cursorSiguiente: null });
      expect((await pedir(`${ruta}?limite=asa`)).statusCode).toBe(400);
      expect((await pedir(`${ruta}/123`)).statusCode).toBe(400);
      expect((await pedir(`${ruta}/019947e0-0000-7000-8000-000000000099`)).statusCode).toBe(404);
      expect((await pedir("/api/empresas/ajena/conversaciones")).statusCode).toBe(403);
      await conexiones.query("UPDATE member SET role='desconocido' WHERE id=$1", [id]);
      expect((await pedir(ruta)).statusCode).toBe(403);
      await conexiones.query("DELETE FROM session WHERE user_id=$1", [id]);
      expect((await pedir(ruta)).statusCode).toBe(401);
    } finally {
      await conexiones.query('DELETE FROM "user" WHERE id=$1', [id]);
      await conexiones.query("DELETE FROM organization WHERE id=$1", [empresa]);
      await app.close();
    }
  },
  20000,
);
