import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ErrorAplicacion } from "./error-aplicacion.js";

export function registrarManejadorErrores(aplicacion: FastifyInstance) {
  aplicacion.setNotFoundHandler((solicitud, respuesta) =>
    respuesta.status(404).send({
      error: {
        code: "NO_ENCONTRADO",
        message: "No se encontró el recurso solicitado.",
        details: [],
        requestId: solicitud.id,
      },
    }),
  );

  aplicacion.setErrorHandler((error, solicitud, respuesta) => {
    if (error instanceof ErrorAplicacion) {
      return respuesta.status(error.estadoHttp).send({
        error: {
          code: error.codigo,
          message: error.mensajeSeguro,
          details: error.detalles,
          requestId: solicitud.id,
        },
      });
    }
    if (error instanceof ZodError) {
      return respuesta.status(400).send({
        error: {
          code: "ERROR_VALIDACION",
          message: "La solicitud contiene datos inválidos.",
          details: error.issues,
          requestId: solicitud.id,
        },
      });
    }
    solicitud.log.error({ error }, "Error inesperado");
    return respuesta.status(500).send({
      error: {
        code: "ERROR_INTERNO",
        message: "Ocurrió un error inesperado.",
        details: [],
        requestId: solicitud.id,
      },
    });
  });
}
