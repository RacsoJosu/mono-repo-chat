import cors from "@fastify/cors";
import Fastify from "fastify";
import { registrarManejadorErrores } from "./compartido/errores/manejador-errores.plugin.js";
import { registrarRutasSalud } from "./modulos/salud/salud.routes.js";

export async function crearAplicacion() {
  const aplicacion = Fastify({ logger: true });
  await aplicacion.register(cors, { origin: true });
  registrarManejadorErrores(aplicacion);
  await aplicacion.register(registrarRutasSalud);
  return aplicacion;
}
