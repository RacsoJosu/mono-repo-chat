import { randomUUID } from "node:crypto";
import * as esquema from "@chatbot-whatsapp/base-datos";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, expect, test } from "vitest";
import { crearRepositorioConversaciones } from "../conversaciones.repository.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
let destinoValidado = false;
const suite = test.skipIf(!url);
const admin = new Pool({ connectionString: url });
const limitado = new Pool({
  connectionString: url,
  options: "-c role=hilo_bandeja_pruebas",
  max: 1,
});
const repositorio = crearRepositorioConversaciones(drizzle(limitado, { schema: esquema }));
const empresa = randomUUID();
const ajena = randomUUID();
const canal = "019947e0-0000-7000-8000-000000000010";
const contacto = "019947e0-0000-7000-8000-000000000011";
const primero = "019947e0-0000-7000-8000-000000000013";
const segundo = "019947e0-0000-7000-8000-000000000012";
beforeAll(async () => {
  if (!url) return;
  const destino = new URL(url);
  if (
    !["localhost", "127.0.0.1"].includes(destino.hostname) ||
    !destino.pathname.endsWith("_pruebas")
  )
    throw new Error("Solo base local de pruebas");
  destinoValidado = true;
  await admin.query(
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='hilo_bandeja_pruebas') THEN CREATE ROLE hilo_bandeja_pruebas NOSUPERUSER NOBYPASSRLS; END IF; END $$",
  );
  await admin.query("GRANT USAGE ON SCHEMA public TO hilo_bandeja_pruebas");
  await admin.query(
    "GRANT SELECT ON contactos, canales_whatsapp, conversaciones TO hilo_bandeja_pruebas",
  );
  await admin.query(
    "INSERT INTO organization(id,name,slug,created_at) VALUES ($1,'Prueba',$1,now()),($2,'Ajena',$2,now())",
    [empresa, ajena],
  );
  await admin.query(
    "INSERT INTO canales_whatsapp(id,id_empresa,nombre,telefono) VALUES ($1,$2,'Canal','+50422220000')",
    [canal, empresa],
  );
  await admin.query(
    "INSERT INTO contactos(id,id_empresa,nombre,telefono,telefono_normalizado) VALUES ($1,$2,'Ana 100%','+504 9999-0000','50499990000')",
    [contacto, empresa],
  );
  await admin.query(
    "INSERT INTO conversaciones(id,id_empresa,id_contacto,id_canal,resumen_ultimo_mensaje,ultima_actividad) VALUES ($1,$2,$3,$4,'Pedido', '2026-09-15T00:00:00Z')",
    [primero, empresa, contacto, canal],
  );
  const otro = "019947e0-0000-7000-8000-000000000014";
  await admin.query(
    "INSERT INTO contactos(id,id_empresa,nombre,telefono,telefono_normalizado) VALUES ($1,$2,'Pedro','+50499990001','50499990001')",
    [otro, empresa],
  );
  await admin.query(
    "INSERT INTO conversaciones(id,id_empresa,id_contacto,id_canal,resumen_ultimo_mensaje,ultima_actividad) VALUES ($1,$2,$3,$4,'Otra compra', '2026-09-15T00:00:00Z')",
    [segundo, empresa, otro, canal],
  );
});
afterAll(async () => {
  if (destinoValidado) {
    await admin.query("DELETE FROM conversaciones WHERE id_empresa=$1", [empresa]);
    await admin.query("DELETE FROM contactos WHERE id_empresa=$1", [empresa]);
    await admin.query("DELETE FROM canales_whatsapp WHERE id_empresa=$1", [empresa]);
    await admin.query("DELETE FROM organization WHERE id IN ($1,$2)", [empresa, ajena]);
  }
  await limitado.end();
  await admin.end();
});
suite("pagina empates por ID, busca texto literal y teléfono normalizado", async () => {
  expect(
    (await repositorio.listar({ idEmpresa: empresa, busqueda: "", limite: 1 })).map((c) => c.id),
  ).toEqual([primero]);
  expect(
    (
      await repositorio.listar({
        idEmpresa: empresa,
        busqueda: "",
        limite: 2,
        despues: { id: primero, fecha: "2026-09-15T00:00:00.000Z" },
      })
    ).map((c) => c.id),
  ).toEqual([segundo]);
  for (const busqueda of ["ana", "%", "Pedido", "99990000"])
    expect(
      (await repositorio.listar({ idEmpresa: empresa, busqueda, limite: 20 })).map((c) => c.id),
    ).toEqual([primero]);
  expect(
    await repositorio.listar({ idEmpresa: empresa, busqueda: "' OR 1=1 --", limite: 20 }),
  ).toEqual([]);
});
suite(
  "RLS no expone datos sin contexto ni filtra contexto al reutilizar una conexión",
  async () => {
    expect((await limitado.query("SELECT id FROM conversaciones")).rows).toEqual([]);
    expect(await repositorio.obtener(ajena, primero)).toBeNull();
    expect((await repositorio.obtener(empresa, primero))?.contacto.nombre).toBe("Ana 100%");
    expect((await limitado.query("SELECT id FROM conversaciones")).rows).toEqual([]);
    await expect(limitado.query("DELETE FROM conversaciones")).rejects.toMatchObject({
      code: "42501",
    });
    const politica = await admin.query(
      "SELECT relforcerowsecurity FROM pg_class WHERE relname='conversaciones'",
    );
    expect(politica.rows[0].relforcerowsecurity).toBe(true);
  },
);
suite("la clave compuesta impide mezclar contactos y canales de otra empresa", async () => {
  await expect(
    admin.query(
      "INSERT INTO conversaciones(id,id_empresa,id_contacto,id_canal,ultima_actividad) VALUES ('019947e0-0000-7000-8000-000000000099',$1,$2,$3,now())",
      [ajena, contacto, canal],
    ),
  ).rejects.toMatchObject({ code: "23503" });
});
