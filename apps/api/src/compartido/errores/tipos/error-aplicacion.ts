export type CategoriaErrorAplicacion =
  | "validacion"
  | "no_autenticado"
  | "no_autorizado"
  | "no_encontrado"
  | "conflicto"
  | "interno";
export interface DetalleValidacion {
  campo: string;
  regla: string;
  mensaje: string;
}
