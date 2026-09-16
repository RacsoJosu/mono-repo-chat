import { z } from "zod";

export const esquemaOpcionesSegundoFactor = z
  .object({
    trustDevice: z.literal(false).optional(),
    disableSession: z.literal(false).optional(),
    method: z.literal("totp").optional(),
  })
  .passthrough();

export const esquemaCambioClave = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(12),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((entrada) => entrada.currentPassword !== entrada.newPassword, {
    message: "La nueva contraseña debe ser diferente.",
    path: ["newPassword"],
  });
