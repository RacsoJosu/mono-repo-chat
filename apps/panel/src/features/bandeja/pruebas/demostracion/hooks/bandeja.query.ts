import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { ServicioBandeja } from "@/features/bandeja/pruebas/demostracion/tipos/servicio-bandeja";
import {
  opcionesConversacionChat,
  opcionesMensajesChat,
} from "@/features/bandeja/pruebas/demostracion/utils/bandeja.query-options";

export function useMensajesChat(servicio: ServicioBandeja, id: string) {
  return useInfiniteQuery(opcionesMensajesChat(servicio, id));
}

export function useConversacionChat(servicio: ServicioBandeja, idChat: string) {
  return useSuspenseQuery(opcionesConversacionChat(servicio, idChat));
}
