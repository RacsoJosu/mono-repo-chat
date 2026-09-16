import type {
  ConsultaConversaciones,
  Conversacion,
  PaginaConversaciones,
} from "@chatbot-whatsapp/compartido";
export interface ServicioConversaciones {
  listar(
    usuario: string,
    empresa: string,
    consulta: ConsultaConversaciones,
  ): Promise<PaginaConversaciones>;
  obtener(usuario: string, empresa: string, id: string): Promise<Conversacion>;
}
