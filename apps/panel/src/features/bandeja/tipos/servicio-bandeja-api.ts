import type { Conversacion, PaginaConversaciones } from "@chatbot-whatsapp/compartido";
export interface ServicioBandejaApi {
  readonly idUsuario: string;
  readonly idEmpresa: string;
  listarConversaciones(entrada: {
    busqueda: string;
    cursor: string | null;
    signal?: AbortSignal;
  }): Promise<PaginaConversaciones>;
  obtenerConversacion(id: string, signal?: AbortSignal): Promise<Conversacion>;
}
