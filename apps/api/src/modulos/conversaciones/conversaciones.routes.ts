import type { FastifyInstance, FastifyRequest } from "fastify";
import { crearControladorConversaciones } from "./conversaciones.controller.js";
import type { ServicioConversaciones } from "./tipos/servicio-conversaciones.js";
export function registrarRutasConversaciones(
  aplicacion: FastifyInstance,
  servicio: ServicioConversaciones,
  identificar: (solicitud: FastifyRequest) => Promise<string>,
) {
  const controlador = crearControladorConversaciones(servicio, identificar);
  aplicacion.get("/api/empresas/:idEmpresa/conversaciones", controlador.listar);
  aplicacion.get("/api/empresas/:idEmpresa/conversaciones/:idConversacion", controlador.obtener);
}
