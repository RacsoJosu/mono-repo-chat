import { esquemaIdChat } from "@chatbot-whatsapp/compartido";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";

const esquemaParametrosChat = z.object({ idChat: esquemaIdChat });
export function validarParametrosChat(parametros: unknown) {
  const resultado = esquemaParametrosChat.safeParse(parametros);
  if (!resultado.success) throw notFound();
  return resultado.data;
}
