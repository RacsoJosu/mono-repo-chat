import { z } from "zod";
import { ErrorApi } from "./error-api";

const esquemaErrorApi = z.object({
  error: z.object({
    code: z.string().min(1).max(100),
    message: z.string(),
    details: z.array(
      z.object({ campo: z.string().max(200), regla: z.string().max(100), mensaje: z.string() }),
    ),
    requestId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,128}$/)
      .optional(),
  }),
});
export function normalizarErrorApi(estadoHttp: number, cuerpo: unknown): ErrorApi {
  const resultado = esquemaErrorApi.safeParse(cuerpo);
  if (!resultado.success) {
    const referencia = z
      .object({ error: z.object({ requestId: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/) }) })
      .safeParse(cuerpo);
    return new ErrorApi(
      "RESPUESTA_INESPERADA",
      estadoHttp,
      [],
      referencia.success ? referencia.data.error.requestId : undefined,
    );
  }
  return new ErrorApi(
    resultado.data.error.code,
    estadoHttp,
    resultado.data.error.details.map(({ campo, regla }) => ({
      campo,
      regla,
      mensaje: "Revisa el valor de este campo.",
    })),
    resultado.data.error.requestId,
  );
}
