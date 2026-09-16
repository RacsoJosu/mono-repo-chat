import { sql } from "drizzle-orm";
import { check, pgPolicy, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { organization } from "./identidad.js";
export const canalesWhatsapp = pgTable(
  "canales_whatsapp",
  {
    id: uuid("id").primaryKey(),
    idEmpresa: text("id_empresa")
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    nombre: text("nombre").notNull(),
    telefono: text("telefono").notNull(),

    creadoEn: timestamp("creado_en", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("canales_whatsapp_empresa_id").on(tabla.idEmpresa, tabla.id),
    unique("canales_whatsapp_empresa_telefono").on(tabla.idEmpresa, tabla.telefono),
    check(
      "canales_whatsapp_uuid_v7",
      sql`substring(${tabla.id}::text, 15, 1) = '7' AND substring(${tabla.id}::text, 20, 1) IN ('8','9','a','b')`,
    ),
    pgPolicy("canales_whatsapp_empresa", {
      for: "all",
      using: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
      withCheck: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
    }),
  ],
).enableRLS();
