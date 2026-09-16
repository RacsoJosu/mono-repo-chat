import * as esquema from "@chatbot-whatsapp/base-datos";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { opcionesIdentidad } from "./configuracion/identidad.js";

export function crearAutenticacion(dependencias: {
  baseDeDatos: NodePgDatabase<typeof esquema>;
  urlPublica: string;
  secreto: string;
  produccion: boolean;
}) {
  return betterAuth({
    ...opcionesIdentidad,
    database: drizzleAdapter(dependencias.baseDeDatos, { provider: "pg", schema: esquema }),
    baseURL: dependencias.urlPublica,
    secret: dependencias.secreto,
    trustedOrigins: [new URL(dependencias.urlPublica).origin],
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12 },
    session: {
      ...opcionesIdentidad.session,
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: { enabled: false },
    },
    hooks: {
      after: createAuthMiddleware(async (contexto) => {
        if (contexto.context.returned instanceof APIError) return;
        const sesion = contexto.context.newSession ?? contexto.context.session;
        if (!sesion) return;
        if (contexto.path === "/change-password") {
          await contexto.context.internalAdapter.updateUser(sesion.user.id, {
            debeCambiarClave: false,
          });
        }
        if (["/two-factor/verify-totp", "/two-factor/verify-backup-code"].includes(contexto.path)) {
          await contexto.context.internalAdapter.updateSession(sesion.session.token, {
            segundoFactorVerificadoEn: new Date(),
          });
        }
      }),
    },
    advanced: {
      useSecureCookies: dependencias.produccion,
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: dependencias.produccion },
    },
  });
}
