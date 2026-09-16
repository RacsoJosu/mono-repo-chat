import { z } from "zod";

const esquemaEntorno = z.object({
  ENTORNO: z.enum(["desarrollo", "pruebas", "produccion"]).default("desarrollo"),
  URL_BASE_DE_DATOS: z.string().url(),
  URL_PUBLICA: z.string().url(),
  SECRETO_AUTENTICACION: z.string().min(32),
  PUERTO_API: z.coerce.number().int().positive().default(3000),
});

export const entorno = esquemaEntorno.parse(process.env);
