import { sql } from "drizzle-orm";
import { check, pgPolicy, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { organization } from "./identidad.js";
export const contactos = pgTable(
  "contactos",
  {
    id: uuid("id").primaryKey(),
    idEmpresa: text("id_empresa")
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    nombre: text("nombre").notNull(),
    telefono: text("telefono").notNull(),
    telefonoNormalizado: text("telefono_normalizado").notNull(),
    creadoEn: timestamp("creado_en", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("contactos_empresa_id").on(tabla.idEmpresa, tabla.id),
    unique("contactos_empresa_telefono").on(tabla.idEmpresa, tabla.telefonoNormalizado),
    check(
      "contactos_uuid_v7",
      sql`substring(${tabla.id}::text, 15, 1) = '7' AND substring(${tabla.id}::text, 20, 1) IN ('8','9','a','b')`,
    ),
    pgPolicy("contactos_empresa", {
      for: "all",
      using: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
      withCheck: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
    }),
  ],
).enableRLS();
