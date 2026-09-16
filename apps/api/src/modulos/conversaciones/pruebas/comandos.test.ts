import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Pool } from "pg";
import { expect, test } from "vitest";
import { validarRolBaseDatos } from "../../../configuracion/validar-rol-base-datos.js";

const ejecutar = promisify(execFile);
const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
test.skipIf(!url)(
  "el comando runtime es idempotente y su conexión real no escribe en bandeja",
  async () => {
    const destino = new URL(url ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(destino.hostname) ||
      !destino.pathname.endsWith("_pruebas")
    )
      throw new Error("Solo base local de pruebas");
    const admin = new Pool({ connectionString: url });
    const rol = `hilo_runtime_${randomBytes(8).toString("hex")}`;
    const clave = randomBytes(32).toString("hex");
    const variables = {
      ...process.env,
      URL_BASE_DE_DATOS_ADMIN: url,
      DB_RUNTIME_ROLE: rol,
      DB_RUNTIME_PASSWORD: clave,
    };
    const cli = fileURLToPath(
      new URL("../../../../node_modules/tsx/dist/cli.mjs", import.meta.url),
    );
    const comando = fileURLToPath(
      new URL("../../../composicion/configurar-rol-base-datos.ts", import.meta.url),
    );
    let runtime: Pool | undefined;
    try {
      for (let intento = 0; intento < 2; intento++) {
        const resultado = await ejecutar(process.execPath, [cli, comando], { env: variables });
        expect(resultado.stdout).not.toContain(clave);
      }
      destino.username = rol;
      destino.password = clave;
      runtime = new Pool({ connectionString: destino.toString() });
      await expect(validarRolBaseDatos(runtime)).resolves.toBeUndefined();
      expect((await runtime.query("SELECT id FROM conversaciones")).rows).toEqual([]);
      await expect(runtime.query("DELETE FROM conversaciones")).rejects.toMatchObject({
        code: "42501",
      });
      await expect(
        runtime.query("ALTER TABLE conversaciones DISABLE ROW LEVEL SECURITY"),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await runtime?.end();
      await admin.query(`DROP OWNED BY "${rol}"`);
      await admin.query(`DROP ROLE "${rol}"`);
      await admin.end();
    }
  },
  30000,
);
test("el seeder rechaza producción y destinos remotos antes de conectar", async () => {
  const cli = fileURLToPath(new URL("../../../../node_modules/tsx/dist/cli.mjs", import.meta.url));
  const comando = fileURLToPath(
    new URL("../../../composicion/sembrar-bandeja.ts", import.meta.url),
  );
  for (const variables of [
    { URL_BASE_DE_DATOS_ADMIN: "postgresql://u:p@example.invalid/base", ENTORNO: "desarrollo" },
    { URL_BASE_DE_DATOS_ADMIN: "postgresql://u:p@localhost/base", ENTORNO: "produccion" },
  ]) {
    await expect(
      ejecutar(process.execPath, [cli, comando], {
        env: { ...process.env, ...variables, SEED_COMPANY_ID: "empresa" },
        timeout: 10000,
      }),
    ).rejects.toMatchObject({ code: 1 });
  }
}, 30000);
