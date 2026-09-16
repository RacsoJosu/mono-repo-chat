import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { ErrorAplicacion } from "../../compartido/errores/error-aplicacion.js";
import { esquemaCambioClave, esquemaOpcionesSegundoFactor } from "./acceso.schemas.js";
import {
  patronCookieIdentidad,
  rutasPublicasAutenticacion,
} from "./constantes/rutas-autenticacion.js";
import { omitirCredencialesSesion } from "./respuestas-autenticacion.js";
import type { DependenciasAcceso } from "./tipos/dependencias-acceso.js";

export async function registrarRutasAcceso(
  aplicacion: FastifyInstance,
  dependencias: DependenciasAcceso,
) {
  const identidades = new WeakMap<FastifyRequest, string>();
  aplicacion.addHook("onRequest", async (solicitud) => {
    if (
      solicitud.headers.authorization &&
      patronCookieIdentidad.test(solicitud.headers.cookie ?? "")
    ) {
      throw new ErrorAplicacion(
        "IDENTIDAD_AMBIGUA",
        "Usa una sola identidad por solicitud.",
        "validacion",
      );
    }
    const ruta = new URL(solicitud.url, dependencias.urlPublica).pathname;
    if (
      !["GET", "HEAD", "OPTIONS"].includes(solicitud.method) &&
      (ruta.startsWith("/api/auth/") ||
        patronCookieIdentidad.test(solicitud.headers.cookie ?? "")) &&
      solicitud.headers.origin !== new URL(dependencias.urlPublica).origin
    ) {
      throw new ErrorAplicacion(
        "ORIGEN_NO_PERMITIDO",
        "El origen de la solicitud no está permitido.",
        "no_autorizado",
      );
    }
    if (ruta.startsWith("/api/auth/") && !rutasPublicasAutenticacion.has(ruta)) {
      throw new ErrorAplicacion(
        "OPERACION_NO_PERMITIDA",
        "Esta operación no está disponible.",
        "no_autorizado",
      );
    }
  });
  aplicacion.addHook("preHandler", async (solicitud) => {
    const ruta = new URL(solicitud.url, dependencias.urlPublica).pathname;
    if (ruta === "/api/auth/two-factor/enable") {
      const sesion = await dependencias.autenticacion.api.getSession({
        headers: fromNodeHeaders(solicitud.headers),
        query: { disableCookieCache: true, disableRefresh: true },
      });
      if (sesion?.user.twoFactorEnabled) {
        throw new ErrorAplicacion(
          "FACTOR_YA_CONFIGURADO",
          "El cambio de segundo factor requiere recuperación administrativa.",
          "no_autorizado",
        );
      }
    }
    if (ruta === "/api/auth/change-password") esquemaCambioClave.parse(solicitud.body);
    if (ruta.startsWith("/api/auth/two-factor/"))
      esquemaOpcionesSegundoFactor.parse(solicitud.body);
    if (
      ruta.startsWith("/api/") &&
      !ruta.startsWith("/api/auth/") &&
      ruta !== "/api/acceso/estado"
    ) {
      const sesion = await dependencias.autenticacion.api.getSession({
        headers: fromNodeHeaders(solicitud.headers),
        query: { disableCookieCache: true, disableRefresh: true },
      });
      if (sesion) identidades.set(solicitud, sesion.user.id);
      if (!sesion)
        throw new ErrorAplicacion(
          "SESION_REQUERIDA",
          "Inicia sesión para continuar.",
          "no_autenticado",
        );
      if (
        sesion.user.debeCambiarClave !== false ||
        !sesion.user.twoFactorEnabled ||
        !sesion.session.segundoFactorVerificadoEn
      ) {
        throw new ErrorAplicacion(
          "ACCESO_INCOMPLETO",
          "Completa la configuración de seguridad.",
          "no_autorizado",
        );
      }
    }
  });
  aplicacion.get("/api/acceso/empresas", async (solicitud) =>
    dependencias.autenticacion.api.listOrganizations({
      headers: fromNodeHeaders(solicitud.headers),
    }),
  );
  aplicacion.get("/api/acceso/estado", async (solicitud) => {
    const sesion = await dependencias.autenticacion.api.getSession({
      headers: fromNodeHeaders(solicitud.headers),
      query: { disableCookieCache: true, disableRefresh: true },
    });
    if (!sesion)
      throw new ErrorAplicacion(
        "SESION_REQUERIDA",
        "Inicia sesión para continuar.",
        "no_autenticado",
      );
    return {
      usuario: { id: sesion.user.id, nombre: sesion.user.name },
      venceEn: sesion.session.expiresAt.toISOString(),
      horaServidor: new Date().toISOString(),
      segundoFactorConfigurado: sesion.user.twoFactorEnabled === true,
      etapa:
        sesion.user.debeCambiarClave !== false
          ? "cambiar_clave"
          : sesion.user.twoFactorEnabled && sesion.session.segundoFactorVerificadoEn
            ? "listo"
            : "segundo_factor",
    };
  });
  aplicacion.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    handler: async (solicitud, respuesta) => {
      const resultado = await dependencias.autenticacion.handler(
        new Request(new URL(solicitud.url, dependencias.urlPublica), {
          method: solicitud.method,
          headers: fromNodeHeaders(solicitud.headers),
          ...(solicitud.body ? { body: JSON.stringify(solicitud.body) } : {}),
        }),
      );
      respuesta.status(resultado.status);
      resultado.headers.forEach((valor, nombre) => {
        if (nombre !== "set-cookie") respuesta.header(nombre, valor);
      });
      const cookies = resultado.headers.getSetCookie();
      if (cookies.length) respuesta.header("set-cookie", cookies);
      if (resultado.status >= 400) {
        return respuesta.send({
          error: {
            code: resultado.status >= 500 ? "ERROR_INTERNO" : "AUTENTICACION_RECHAZADA",
            message:
              resultado.status >= 500
                ? "No pudimos completar la solicitud."
                : "No pudimos verificar la solicitud de acceso.",
            details: [],
            requestId: solicitud.id,
          },
        });
      }
      return respuesta.send(omitirCredencialesSesion(await resultado.json()));
    },
  });
  return async (solicitud: FastifyRequest) => {
    const usuario = identidades.get(solicitud);
    if (!usuario)
      throw new ErrorAplicacion(
        "SESION_REQUERIDA",
        "Inicia sesión para continuar.",
        "no_autenticado",
      );
    return usuario;
  };
}
