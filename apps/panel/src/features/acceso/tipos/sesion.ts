import type { StoreApi } from "zustand/vanilla";
export interface SesionPanel {
  usuario: { id: string; nombre: string };
  etapa: "cambiar_clave" | "segundo_factor" | "listo";
  venceEn: string;
  horaServidor: string;
  segundoFactorConfigurado: boolean;
}
export interface EmpresaPanel {
  id: string;
  name: string;
}
export interface EstadoSesion {
  estado: "comprobando" | "anonima" | "activa" | "expirada";
  sesion: SesionPanel | null;
  empresa: EmpresaPanel | null;
  aviso: boolean;
  cerrando: boolean;
  error: string | null;
  generacion: number;
}
export type StoreSesion = StoreApi<EstadoSesion>;
export interface ServicioSesion {
  estado(): Promise<SesionPanel>;
  cerrar(): Promise<void>;
  renovar(): Promise<void>;
}
export type EventoSesion =
  | "inicio"
  | "cierre"
  | "renovacion"
  | "cierre_confirmado"
  | "cierre_fallido";
export interface CanalSesion {
  publicar(evento: EventoSesion): void;
  escuchar(recibir: (evento: EventoSesion) => void): () => void;
  cerrar(): void;
}
