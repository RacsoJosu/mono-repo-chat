import type { FastifyReply, FastifyRequest } from "fastify";

export async function obtenerSalud(_solicitud: FastifyRequest, respuesta: FastifyReply) {
  return respuesta.status(200).send({ estado: "disponible" });
}
