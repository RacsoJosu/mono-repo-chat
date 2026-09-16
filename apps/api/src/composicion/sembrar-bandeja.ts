import * as esquema from "@chatbot-whatsapp/base-datos";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { z } from "zod";
import { sembrarConversaciones } from "../modulos/conversaciones/semillas/sembrar-conversaciones.js";

const variables = z
  .object({
    URL_BASE_DE_DATOS_ADMIN: z.url(),
    SEED_COMPANY_ID: z.string().min(1).max(128),
    SEED_COUNT: z.coerce.number().int().min(1).max(1000).default(100),
    SEED_VALUE: z.coerce.number().int().min(0).max(2147483647).default(20260915),
    ENTORNO: z.enum(["desarrollo", "pruebas"]).default("desarrollo"),
    NODE_ENV: z.enum(["development", "test"]).optional(),
  })
  .safeParse(process.env);
if (!variables.success)
  throw new Error("Revisa las variables del seeder. Solo desarrollo o pruebas.");
const destino = new URL(variables.data.URL_BASE_DE_DATOS_ADMIN);
if (!["localhost", "127.0.0.1", "[::1]"].includes(destino.hostname))
  throw new Error("El seeder requiere PostgreSQL local.");
const conexiones = new Pool({ connectionString: destino.toString() });
try {
  const resultado = await sembrarConversaciones(
    drizzle(conexiones, { schema: esquema }),
    variables.data.SEED_COMPANY_ID,
    variables.data.SEED_COUNT,
    variables.data.SEED_VALUE,
  );
  console.info(`Bandeja preparada: ${resultado.conversaciones} conversaciones.`);
} catch {
  console.error("No se pudo sembrar la bandeja; no se aplicaron cambios.");
  process.exitCode = 1;
} finally {
  await conexiones.end();
}
