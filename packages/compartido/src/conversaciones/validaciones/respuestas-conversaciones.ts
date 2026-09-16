import { z } from "zod";
import { esquemaIdChat } from "./identificador-chat.js";

const esquemaParticipante = z.object({
  id: esquemaIdChat,
  nombre: z.string().min(1),
  telefono: z.string().min(1),
});
export const esquemaConversacion = z.object({
  id: esquemaIdChat,
  contacto: esquemaParticipante,
  canal: esquemaParticipante,
  resumenUltimoMensaje: z.string().max(500).nullable(),
  ultimaActividad: z.iso.datetime(),
});
export const esquemaPaginaConversaciones = z.object({
  conversaciones: z.array(esquemaConversacion),
  cursorSiguiente: z.string().nullable(),
});
