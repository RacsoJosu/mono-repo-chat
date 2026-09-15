import type { FastifyInstance } from "fastify";
import { obtenerSalud } from "./salud.controller.js";

export async function registrarRutasSalud(aplicacion: FastifyInstance) {
  aplicacion.get("/salud", obtenerSalud);
}
