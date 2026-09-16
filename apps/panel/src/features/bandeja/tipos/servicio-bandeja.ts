import type { ConversacionDemostracion } from "./tipos-conversacion-demostracion";
export interface MensajeChat {
  id: string;
  texto: string;
  autor: "contacto" | "asesor" | "bot";
  fecha: string;
}
export interface PaginaMensajes {
  mensajes: MensajeChat[];
  cursorAnterior: string | null;
}
export interface ServicioBandeja {
  obtenerConversacion(id: string): Promise<ConversacionDemostracion | undefined>;
  obtenerMensajes(entrada: {
    id: string;
    cursor: string | null;
    signal?: AbortSignal;
  }): Promise<PaginaMensajes>;
}
