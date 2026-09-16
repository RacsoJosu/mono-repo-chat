import { Pool } from "pg";
import { afterAll, expect, test } from "vitest";
import { validarRolBaseDatos } from "../../../configuracion/validar-rol-base-datos.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const admin = new Pool({ connectionString: url });
const limitado = new Pool({ connectionString: url, options: "-c role=hilo_propietario_pruebas" });
afterAll(async () => {
  await limitado.end();
  await admin.end();
});
test.skipIf(!url)(
  "rechaza un runtime propietario aunque no sea superusuario ni BYPASSRLS",
  async () => {
    const destino = new URL(url ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(destino.hostname) ||
      !destino.pathname.endsWith("_pruebas")
    )
      throw new Error("Solo pruebas locales");
    await admin.query(
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='hilo_propietario_pruebas') THEN CREATE ROLE hilo_propietario_pruebas NOSUPERUSER NOBYPASSRLS; END IF; END $$",
    );
    await admin.query("CREATE TABLE IF NOT EXISTS propiedad_runtime_pruebas(id integer)");
    await admin.query("ALTER TABLE propiedad_runtime_pruebas OWNER TO hilo_propietario_pruebas");
    try {
      await expect(validarRolBaseDatos(limitado)).rejects.toThrow();
    } finally {
      await admin.query("DROP TABLE propiedad_runtime_pruebas");
    }
  },
);
