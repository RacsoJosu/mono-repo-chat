import type { FastifyRequest } from "fastify";
import {
  esquemaConsultaConversaciones,
  esquemaConversacion,
  esquemaEmpresa,
  esquemaPaginaConversaciones,
  esquemaParametrosConversacion,
} from "./conversaciones.schemas.js";
import type { ServicioConversaciones } from "./tipos/servicio-conversaciones.js";
export function crearControladorConversaciones(
  servicio: ServicioConversaciones,
  identificar: (solicitud: FastifyRequest) => Promise<string>,
) {
  return {
    async listar(solicitud: FastifyRequest<{ Params: { idEmpresa: string } }>) {
      const empresa = esquemaEmpresa.parse(solicitud.params.idEmpresa);
      const consulta = esquemaConsultaConversaciones.parse(solicitud.query);
      return esquemaPaginaConversaciones.parse(
        await servicio.listar(await identificar(solicitud), empresa, consulta),
      );
    },
    async obtener(solicitud: FastifyRequest) {
      const parametros = esquemaParametrosConversacion.parse(solicitud.params);
      return esquemaConversacion.parse(
        await servicio.obtener(
          await identificar(solicitud),
          parametros.idEmpresa,
          parametros.idConversacion,
        ),
      );
    },
  };
}
