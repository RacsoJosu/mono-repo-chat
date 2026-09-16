import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { canalesWhatsapp } from "./canales-whatsapp.js";
import { contactos } from "./contactos.js";
import { organization } from "./identidad.js";
export const conversaciones = pgTable(
  "conversaciones",
  {
    id: uuid("id").primaryKey(),
    idEmpresa: text("id_empresa")
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    idContacto: uuid("id_contacto").notNull(),
    idCanal: uuid("id_canal").notNull(),
    resumenUltimoMensaje: varchar("resumen_ultimo_mensaje", { length: 500 }),
    ultimaActividad: timestamp("ultima_actividad", { withTimezone: true, precision: 3 }).notNull(),
    creadoEn: timestamp("creado_en", { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("conversaciones_empresa_contacto_canal").on(
      tabla.idEmpresa,
      tabla.idContacto,
      tabla.idCanal,
    ),
    foreignKey({
      columns: [tabla.idEmpresa, tabla.idContacto],
      foreignColumns: [contactos.idEmpresa, contactos.id],
    }).onDelete("restrict"),
    foreignKey({
      columns: [tabla.idEmpresa, tabla.idCanal],
      foreignColumns: [canalesWhatsapp.idEmpresa, canalesWhatsapp.id],
    }).onDelete("restrict"),
    index("conversaciones_actividad").on(
      tabla.idEmpresa,
      tabla.ultimaActividad.desc(),
      tabla.id.desc(),
    ),
    check(
      "conversaciones_uuid_v7",
      sql`substring(${tabla.id}::text, 15, 1) = '7' AND substring(${tabla.id}::text, 20, 1) IN ('8','9','a','b')`,
    ),
    pgPolicy("conversaciones_empresa", {
      for: "all",
      using: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
      withCheck: sql`${tabla.idEmpresa} = current_setting('hilo.id_empresa', true)`,
    }),
  ],
).enableRLS();
