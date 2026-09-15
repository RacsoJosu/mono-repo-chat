import type { CategoriaErrorAplicacion, DetalleValidacion } from "./tipos/error-aplicacion.js";
export class ErrorAplicacion extends Error {
  constructor(
    readonly codigo: string,
    readonly mensajeSeguro: string,
    readonly categoria: CategoriaErrorAplicacion,
    readonly detalles: DetalleValidacion[] = [],
    opciones?: ErrorOptions,
  ) {
    super(mensajeSeguro, opciones);
    this.name = "ErrorAplicacion";
  }
}
