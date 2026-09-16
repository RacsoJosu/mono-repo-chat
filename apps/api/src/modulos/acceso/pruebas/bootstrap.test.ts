import { randomUUID } from "node:crypto";
import * as esquema from "@chatbot-whatsapp/base-datos";
import { hashPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, expect, test } from "vitest";
import { crearRepositorioBootstrap } from "../bootstrap.repository.js";
import { crearServicioBootstrap } from "../bootstrap.service.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const conexiones = new Pool({ connectionString: url });
afterAll(async () => {
  await conexiones.end();
});
test.skipIf(!url)(
  "bootstrap repetido no duplica ni modifica la clave del propietario",
  async () => {
    const destino = new URL(url ?? "");
    if (destino.hostname !== "localhost" || !destino.pathname.endsWith("_pruebas"))
      throw new Error("Base local de pruebas requerida.");
    const slug = `prueba-${randomUUID()}`;
    const email = `${slug}@example.test`;
    const entrada = {
      nombreEmpresa: "Empresa prueba",
      slug,
      nombrePropietario: "Propietario",
      email,
      clave: "Inicial-segura-12345",
    };
    const baseDeDatos = drizzle(conexiones, { schema: esquema });
    const crearPropietarioInicial = crearServicioBootstrap({
      repositorio: crearRepositorioBootstrap(baseDeDatos),
      protegerClave: hashPassword,
    });
    try {
      const primero = await crearPropietarioInicial(entrada);
      const credencial = await conexiones.query("SELECT password FROM account WHERE user_id=$1", [
        primero.idUsuario,
      ]);
      const segundo = await crearPropietarioInicial({ ...entrada, clave: "Otra-clave-987654" });
      expect(segundo).toEqual({ ...primero, creado: false });
      expect(
        (
          await conexiones.query("SELECT password FROM account WHERE user_id=$1", [
            primero.idUsuario,
          ])
        ).rows,
      ).toEqual(credencial.rows);
      expect(
        (
          await conexiones.query("SELECT role FROM member WHERE organization_id=$1", [
            primero.idEmpresa,
          ])
        ).rows,
      ).toEqual([{ role: "owner" }]);
      await expect(
        crearPropietarioInicial({ ...entrada, email: `otro-${email}` }),
      ).rejects.toMatchObject({ codigo: "BOOTSTRAP_CONFLICTO" });
      const [uno, dos] = await Promise.all([
        crearPropietarioInicial(entrada),
        crearPropietarioInicial(entrada),
      ]);
      expect(uno.creado || dos.creado).toBe(false);
    } finally {
      await conexiones.query("DELETE FROM organization WHERE slug=$1", [slug]);
      await conexiones.query('DELETE FROM "user" WHERE email=$1', [email]);
    }
  },
);
