import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";

export function opcionesMensajesChat(servicio: ServicioBandeja, id: string) {
  return infiniteQueryOptions({
    queryKey: ["bandeja", "chat", id, "mensajes"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => servicio.obtenerMensajes({ id, cursor: pageParam, signal }),
    getNextPageParam: (pagina) => pagina.cursorAnterior ?? undefined,
    staleTime: 60_000,
  });
}

export function opcionesConversacionChat(servicio: ServicioBandeja, idChat: string) {
  return queryOptions({
    queryKey: ["bandeja", "chat", idChat, "conversacion"],
    queryFn: async () => (await servicio.obtenerConversacion(idChat)) ?? null,
    staleTime: 60_000,
    retry: false,
  });
}
