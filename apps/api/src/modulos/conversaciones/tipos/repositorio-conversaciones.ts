import type { Conversacion } from "@chatbot-whatsapp/compartido";
import type { PosicionConversacion } from "./cursor-conversaciones.js";
export interface RepositorioConversaciones {
  listar(entrada: {
    idEmpresa: string;
    busqueda: string;
    limite: number;
    despues?: PosicionConversacion;
  }): Promise<Conversacion[]>;
  obtener(idEmpresa: string, idConversacion: string): Promise<Conversacion | null>;
}
export interface AccesoEmpresa {
  verificar(idUsuario: string, idEmpresa: string): Promise<void>;
}
