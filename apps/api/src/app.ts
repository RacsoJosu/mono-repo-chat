import cors from "@fastify/cors";
import Fastify from "fastify";
import { registrarManejadorErrores } from "./compartido/errores/manejador-errores.plugin.js";
import { registrarRutasAcceso } from "./modulos/acceso/acceso.routes.js";
import type { DependenciasAcceso } from "./modulos/acceso/tipos/dependencias-acceso.js";
import { registrarRutasConversaciones } from "./modulos/conversaciones/conversaciones.routes.js";
import type { ServicioConversaciones } from "./modulos/conversaciones/tipos/servicio-conversaciones.js";
import { registrarRutasSalud } from "./modulos/salud/salud.routes.js";

export async function crearAplicacion(
  dependencias: DependenciasAcceso & { conversaciones?: ServicioConversaciones },
) {
  const aplicacion = Fastify({
    logger: {
      redact: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie"],
    },
  });
  await aplicacion.register(cors, {
    origin: new URL(dependencias.urlPublica).origin,
    credentials: true,
  });
  registrarManejadorErrores(aplicacion);
  await aplicacion.register(registrarRutasSalud);
  const identificar = await registrarRutasAcceso(aplicacion, dependencias);
  if (dependencias.conversaciones)
    registrarRutasConversaciones(aplicacion, dependencias.conversaciones, identificar);
  return aplicacion;
}
