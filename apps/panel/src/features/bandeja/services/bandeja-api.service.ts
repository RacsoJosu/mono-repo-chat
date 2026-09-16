import {
  esquemaConversacion,
  esquemaIdChat,
  esquemaPaginaConversaciones,
} from "@chatbot-whatsapp/compartido";
import type { ClienteApi } from "@/lib/cliente-api/cliente-api";
import type { ServicioBandejaApi } from "../tipos/servicio-bandeja-api";
export function crearServicioBandejaApi(
  cliente: ClienteApi,
  idUsuario: string,
  idEmpresa: string,
): ServicioBandejaApi {
  const ruta = `/api/empresas/${encodeURIComponent(idEmpresa)}/conversaciones`;
  return {
    idUsuario,
    idEmpresa,
    async listarConversaciones({ busqueda, cursor, signal }) {
      const parametros = new URLSearchParams({ busqueda, limite: "20" });
      if (cursor) parametros.set("cursor", cursor);
      return esquemaPaginaConversaciones.parse(await cliente(`${ruta}?${parametros}`, { signal }));
    },
    async obtenerConversacion(id, signal) {
      return esquemaConversacion.parse(
        await cliente(`${ruta}/${esquemaIdChat.parse(id)}`, { signal }),
      );
    },
  };
}
