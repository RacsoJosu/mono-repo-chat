import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { ServicioBandejaApi } from "../tipos/servicio-bandeja-api";
export function opcionesListaConversaciones(servicio: ServicioBandejaApi, busqueda: string) {
  return infiniteQueryOptions({
    queryKey: ["bandeja", servicio.idUsuario, servicio.idEmpresa, "lista", busqueda],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      servicio.listarConversaciones({ busqueda, cursor: pageParam, signal }),
    getNextPageParam: (pagina) => pagina.cursorSiguiente ?? undefined,
    retry: false,
  });
}
export function opcionesDetalleConversacion(servicio: ServicioBandejaApi, id: string) {
  return queryOptions({
    queryKey: ["bandeja", servicio.idUsuario, servicio.idEmpresa, "conversacion", id],
    queryFn: ({ signal }) => servicio.obtenerConversacion(id, signal),
    retry: false,
    staleTime: 60_000,
  });
}
