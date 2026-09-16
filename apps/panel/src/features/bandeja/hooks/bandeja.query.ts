import { useInfiniteQuery } from "@tanstack/react-query";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";
import { opcionesMensajesChat } from "../utils/bandeja.query-options";

export function useMensajesChat(servicio: ServicioBandeja, id: string) {
  return useInfiniteQuery(opcionesMensajesChat(servicio, id));
}
