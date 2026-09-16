import type { z } from "zod";
import type { esquemaConsultaConversaciones } from "../validaciones/consultas-conversaciones.js";
import type {
  esquemaConversacion,
  esquemaPaginaConversaciones,
} from "../validaciones/respuestas-conversaciones.js";
export type Conversacion = z.infer<typeof esquemaConversacion>;
export type PaginaConversaciones = z.infer<typeof esquemaPaginaConversaciones>;
export type ConsultaConversaciones = z.infer<typeof esquemaConsultaConversaciones>;
