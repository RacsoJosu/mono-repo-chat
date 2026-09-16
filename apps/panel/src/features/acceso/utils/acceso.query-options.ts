import { queryOptions } from "@tanstack/react-query";
import type { crearServicioAcceso } from "../services/acceso-api.service";
export function opcionesEmpresas(
  servicio: ReturnType<typeof crearServicioAcceso>,
  usuario: string,
) {
  return queryOptions({
    queryKey: ["acceso", usuario, "empresas"],
    queryFn: ({ signal }) => servicio.empresas(signal),
    retry: false,
    staleTime: 60_000,
  });
}
