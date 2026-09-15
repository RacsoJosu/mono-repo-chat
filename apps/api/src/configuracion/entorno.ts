import { z } from "zod";

const esquemaEntorno = z.object({
  ENTORNO: z.enum(["desarrollo", "pruebas", "produccion"]).default("desarrollo"),
  PUERTO_API: z.coerce.number().int().positive().default(3000),
});

export const entorno = esquemaEntorno.parse(process.env);
