import { useQuery } from "@tanstack/react-query";
import { useAcceso } from "../store/proveedor-sesion";
import { opcionesEmpresas } from "../utils/acceso.query-options";
export function useEmpresas(usuario: string) {
  const { servicio } = useAcceso();
  return useQuery(opcionesEmpresas(servicio, usuario));
}
