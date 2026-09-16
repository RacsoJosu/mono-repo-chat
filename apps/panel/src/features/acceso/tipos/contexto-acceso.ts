import type { crearServicioAcceso } from "../services/acceso-api.service";
import type { crearCoordinadorSesion } from "../services/coordinador-sesion";
import type { StoreSesion } from "./sesion";
export interface ContextoAcceso {
  store: StoreSesion;
  coordinador: ReturnType<typeof crearCoordinadorSesion>;
  servicio: ReturnType<typeof crearServicioAcceso>;
}
