import { z } from "zod";
import type { ClienteApi } from "@/lib/cliente-api/cliente-api";
import { normalizarErrorApi } from "@/lib/cliente-api/normalizar-error-api";

const esquemaEstado = z.object({
  usuario: z.object({ id: z.string(), nombre: z.string() }),
  etapa: z.enum(["cambiar_clave", "segundo_factor", "listo"]),
  venceEn: z.iso.datetime(),
  horaServidor: z.iso.datetime(),
  segundoFactorConfigurado: z.boolean(),
});
const esquemaEmpresas = z.array(z.object({ id: z.string(), name: z.string() }));
export function crearServicioAcceso(
  cliente: ClienteApi,
  exclusivo: (operacion: () => Promise<unknown>) => Promise<unknown>,
) {
  const enviar = (ruta: string, cuerpo: unknown) =>
    exclusivo(() =>
      cliente(`/api/auth/${ruta}`, { method: "POST", body: JSON.stringify(cuerpo) }, false),
    );
  return {
    estado: async () => esquemaEstado.parse(await cliente("/api/acceso/estado", {}, false)),
    empresas: async (signal?: AbortSignal) =>
      esquemaEmpresas.parse(await cliente("/api/acceso/empresas", { signal })),
    cerrar: async () => {
      await enviar("sign-out", {});
    },
    renovar: async () => {
      const respuesta = await exclusivo(() => cliente("/api/auth/get-session", {}, false));
      if (respuesta === null) throw normalizarErrorApi(401, {});
    },
    ingresar: async (email: string, password: string) =>
      z
        .object({ twoFactorRedirect: z.boolean().optional() })
        .parse(
          await enviar(
            "sign-in/email",
            z
              .object({ email: z.email().max(254), password: z.string().min(1).max(1024) })
              .parse({ email, password }),
          ),
        ),
    cambiarClave: (currentPassword: string, newPassword: string) =>
      enviar(
        "change-password",
        z
          .object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(12).max(128),
            revokeOtherSessions: z.literal(true),
          })
          .refine((claves) => claves.currentPassword !== claves.newPassword)
          .parse({ currentPassword, newPassword, revokeOtherSessions: true }),
      ),
    configurarFactor: async (password: string) =>
      z
        .object({ totpURI: z.string().startsWith("otpauth://"), backupCodes: z.array(z.string()) })
        .parse(
          await enviar(
            "two-factor/enable",
            z.object({ password: z.string().min(1).max(1024) }).parse({ password }),
          ),
        ),
    verificarFactor: (code: string, recuperacion: boolean) =>
      enviar(recuperacion ? "two-factor/verify-backup-code" : "two-factor/verify-totp", {
        code: (recuperacion ? z.string().min(1).max(128) : z.string().regex(/^\d{6}$/)).parse(code),
      }),
  };
}
