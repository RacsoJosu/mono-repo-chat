import { z } from "zod";

const esquema = z.object({ busqueda: z.string().max(100).catch("").default("") });
export function validarBusquedaConversaciones(entrada: unknown): { busqueda?: string } {
  const { busqueda } = esquema.parse(entrada);
  return busqueda ? { busqueda } : {};
}
