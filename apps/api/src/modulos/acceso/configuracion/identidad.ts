import { oauthProvider } from "@better-auth/oauth-provider";
import type { BetterAuthOptions } from "better-auth";
import { organization, twoFactor } from "better-auth/plugins";

// Esquema compartido por el CLI oficial y la composición del servidor.

export const opcionesIdentidad = {
  user: {
    additionalFields: {
      debeCambiarClave: { type: "boolean", defaultValue: true, input: false },
    },
  },
  session: {
    additionalFields: {
      segundoFactorVerificadoEn: { type: "date", required: false, input: false },
      reautenticadoEn: { type: "date", required: false, input: false },
    },
  },
  plugins: [
    twoFactor(),
    organization(),
    oauthProvider({
      disableJwtPlugin: true,
      grantTypes: ["client_credentials"],
      loginPage: "/acceso",
      consentPage: "/acceso",
    }),
    {
      id: "integridad-membresias",
      schema: {
        member: {
          fields: {},
          indexes: [
            {
              name: "membresia_empresa_usuario_unica",
              fields: ["organizationId", "userId"],
              unique: true,
            },
          ],
        },
      },
    },
  ],
} satisfies BetterAuthOptions;
