import { createStore } from "zustand/vanilla";
import type { EstadoSesion } from "../tipos/sesion";
export function crearStoreSesion() {
  return createStore<EstadoSesion>(() => ({
    estado: "comprobando",
    sesion: null,
    empresa: null,
    aviso: false,
    cerrando: false,
    error: null,
    generacion: 0,
  }));
}
