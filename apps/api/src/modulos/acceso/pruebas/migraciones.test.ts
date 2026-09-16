import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, expect, test } from "vitest";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const suite = test.skipIf(!url);
const conexion = new Pool({ connectionString: url, max: 1 });
const carpeta = fileURLToPath(
  new URL("../../../../../../packages/base-datos/migraciones", import.meta.url),
);
beforeAll(async () => {
  if (!url) return;
  const destino = new URL(url);
  if (
    !["localhost", "127.0.0.1"].includes(destino.hostname) ||
    !destino.pathname.endsWith("_pruebas")
  ) {
    throw new Error(
      "Las migraciones de prueba requieren PostgreSQL local y una base terminada en _pruebas.",
    );
  }
  await migrate(drizzle(conexion), { migrationsFolder: carpeta });
});
afterAll(async () => {
  await conexion.end();
});

suite("crea las tablas de identidad, sesiones, empresas, membresías y OAuth", async () => {
  const resultado = await conexion.query<{ nombre: string }>(
    "SELECT tablename AS nombre FROM pg_tables WHERE schemaname = 'public'",
  );
  expect(resultado.rows.map((fila) => fila.nombre)).toEqual(
    expect.arrayContaining([
      "user",
      "session",
      "account",
      "two_factor",
      "organization",
      "member",
      "oauth_client",
      "oauth_access_token",
      "contactos",
      "canales_whatsapp",
      "conversaciones",
    ]),
  );
});
suite("reaplicar las migraciones conserva los registros y no duplica versiones", async () => {
  const identificador = crypto.randomUUID();
  await conexion.query(
    'INSERT INTO "user" (id, name, email, "created_at", "updated_at") VALUES ($1, $2, $3, now(), now())',
    [identificador, "Persistencia", `${identificador}@example.test`],
  );
  try {
    const antes = await conexion.query("SELECT hash FROM drizzle.__drizzle_migrations ORDER BY id");
    await migrate(drizzle(conexion), { migrationsFolder: carpeta });
    const despues = await conexion.query(
      "SELECT hash FROM drizzle.__drizzle_migrations ORDER BY id",
    );
    expect(despues.rows).toEqual(antes.rows);
    const usuario = await conexion.query('SELECT name FROM "user" WHERE id = $1', [identificador]);
    expect(usuario.rows).toEqual([{ name: "Persistencia" }]);
  } finally {
    await conexion.query('DELETE FROM "user" WHERE id = $1', [identificador]);
  }
});

suite("una persona pertenece a varias empresas pero no duplica su membresía", async () => {
  const cliente = await conexion.connect();
  const identificador = crypto.randomUUID();
  try {
    await cliente.query("BEGIN");
    await cliente.query(
      'INSERT INTO "user" (id, name, email, "created_at", "updated_at") VALUES ($1, $2, $3, now(), now())',
      [identificador, "Prueba", `${identificador}@example.test`],
    );
    for (const sufijo of ["primera", "segunda"]) {
      await cliente.query(
        'INSERT INTO organization (id, name, slug, "created_at") VALUES ($1, $2, $1, now())',
        [identificador + sufijo, sufijo],
      );
      await cliente.query(
        'INSERT INTO member (id, "organization_id", "user_id", role, "created_at") VALUES ($1, $2, $3, $4, now())',
        [
          identificador + sufijo,
          identificador + sufijo,
          identificador,
          sufijo === "primera" ? "owner" : "member",
        ],
      );
    }
    const membresias = await cliente.query('SELECT role FROM member WHERE "user_id" = $1', [
      identificador,
    ]);
    expect(membresias.rows).toHaveLength(2);
    await expect(
      cliente.query(
        'INSERT INTO member (id, "organization_id", "user_id", role, "created_at") VALUES ($1, $2, $3, $4, now())',
        [`${identificador}duplicada`, `${identificador}primera`, identificador, "admin"],
      ),
    ).rejects.toMatchObject({ code: "23505" });
  } finally {
    await cliente.query("ROLLBACK");
    cliente.release();
  }
});
suite("una cuenta nueva exige cambiar la clave y no tiene segundo factor confirmado", async () => {
  const identificador = crypto.randomUUID();
  const cliente = await conexion.connect();
  try {
    await cliente.query("BEGIN");
    const usuario = await cliente.query(
      'INSERT INTO "user" (id, name, email, "created_at", "updated_at") VALUES ($1, $2, $3, now(), now()) RETURNING "debe_cambiar_clave", "two_factor_enabled"',
      [identificador, "Prueba", `${identificador}@example.test`],
    );
    expect(usuario.rows[0]).toEqual({ debe_cambiar_clave: true, two_factor_enabled: false });
    const sesion = await cliente.query(
      'INSERT INTO session (id, token, "user_id", "expires_at", "created_at", "updated_at") VALUES ($1, $1, $1, now() + interval \'1 hour\', now(), now()) RETURNING "segundo_factor_verificado_en", "reautenticado_en"',
      [identificador],
    );
    expect(sesion.rows[0]).toEqual({ segundo_factor_verificado_en: null, reautenticado_en: null });
  } finally {
    await cliente.query("ROLLBACK");
    cliente.release();
  }
});
