import {
  type ConsultaConversaciones,
  esquemaIdChat,
  type PaginaConversaciones,
} from "@chatbot-whatsapp/compartido";
import { ErrorAplicacion } from "../../compartido/errores/error-aplicacion.js";
import type { CursorConversaciones } from "./tipos/cursor-conversaciones.js";
import type {
  AccesoEmpresa,
  RepositorioConversaciones,
} from "./tipos/repositorio-conversaciones.js";
export function crearServicioConversaciones(dependencias: {
  repositorio: RepositorioConversaciones;
  acceso: AccesoEmpresa;
  cursor: CursorConversaciones;
}) {
  return {
    async listar(
      idUsuario: string,
      idEmpresa: string,
      consulta: ConsultaConversaciones,
    ): Promise<PaginaConversaciones> {
      await dependencias.acceso.verificar(idUsuario, idEmpresa);
      const contexto = { idEmpresa, busqueda: consulta.busqueda };
      const despues = consulta.cursor
        ? dependencias.cursor.leer(contexto, consulta.cursor)
        : undefined;
      const filas = await dependencias.repositorio.listar({
        ...contexto,
        limite: consulta.limite + 1,
        ...(despues ? { despues } : {}),
      });
      const conversaciones = filas.slice(0, consulta.limite);
      const ultima = conversaciones.at(-1);
      return {
        conversaciones,
        cursorSiguiente:
          filas.length > consulta.limite && ultima
            ? dependencias.cursor.emitir(contexto, { id: ultima.id, fecha: ultima.ultimaActividad })
            : null,
      };
    },
    async obtener(idUsuario: string, idEmpresa: string, identificador: string) {
      const id = esquemaIdChat.parse(identificador);
      await dependencias.acceso.verificar(idUsuario, idEmpresa);
      const conversacion = await dependencias.repositorio.obtener(idEmpresa, id);
      if (!conversacion)
        throw new ErrorAplicacion(
          "CONVERSACION_NO_ENCONTRADA",
          "No se encontró la conversación.",
          "no_encontrado",
        );
      return conversacion;
    },
  };
}
