import { z } from "zod";
import { esquemaIdChat } from "./identificador-chat.js";

export const esquemaEmpresa = z.string().min(1).max(128);
export const esquemaParametrosConversacion = z.object({
  idEmpresa: esquemaEmpresa,
  idConversacion: esquemaIdChat,
});
export const esquemaConsultaConversaciones = z.strictObject({
  busqueda: z
    .string()
    .max(100)
    .default("")
    .transform((texto) => texto.trim().replace(/\s+/g, " ")),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).max(2048).optional(),
});
