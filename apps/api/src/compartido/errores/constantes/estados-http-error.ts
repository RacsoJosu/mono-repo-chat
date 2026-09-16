import type { CategoriaErrorAplicacion } from "../tipos/error-aplicacion.js";
export const estadosHttpPorCategoria = {
  validacion: 400,
  no_autenticado: 401,
  no_autorizado: 403,
  no_encontrado: 404,
  conflicto: 409,
  interno: 500,
} as const satisfies Record<CategoriaErrorAplicacion, number>;
