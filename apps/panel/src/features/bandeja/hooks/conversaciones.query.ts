import { useInfiniteQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ServicioBandejaApi } from "../tipos/servicio-bandeja-api";
import {
  opcionesDetalleConversacion,
  opcionesListaConversaciones,
} from "../utils/conversaciones.query-options";
export function useListaConversaciones(servicio: ServicioBandejaApi, busqueda: string) {
  const queryClient = useQueryClient();
  const opciones = opcionesListaConversaciones(servicio, busqueda);
  const consulta = useInfiniteQuery(opciones);
  return {
    ...consulta,
    actualizar: () => queryClient.resetQueries({ queryKey: opciones.queryKey, exact: true }),
  };
}
export function useDetalleConversacion(servicio: ServicioBandejaApi, id: string) {
  return useSuspenseQuery(opcionesDetalleConversacion(servicio, id));
}
