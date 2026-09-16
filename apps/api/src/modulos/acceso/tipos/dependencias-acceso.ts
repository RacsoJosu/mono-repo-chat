import type { crearAutenticacion } from "../acceso.autenticacion.js";

export interface DependenciasAcceso {
  autenticacion: ReturnType<typeof crearAutenticacion>;
  urlPublica: string;
}
