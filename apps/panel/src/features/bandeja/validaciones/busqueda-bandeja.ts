import { z } from "zod";

const esquemaBusquedaBandeja = z.object({
  busqueda: z.string().max(200).catch("").default(""),
  pendientes: z.boolean().catch(false).default(false),
});
export function validarBusquedaBandeja(entrada: unknown): {
  busqueda?: string;
  pendientes?: boolean;
} {
  const resultado = esquemaBusquedaBandeja.parse(entrada);
  return {
    ...(resultado.busqueda ? { busqueda: resultado.busqueda } : {}),
    ...(resultado.pendientes ? { pendientes: true } : {}),
  };
}
