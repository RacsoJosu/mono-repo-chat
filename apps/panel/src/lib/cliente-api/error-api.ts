import type { DetalleValidacionApi } from "./tipos/error-api";
export class ErrorApi extends Error {
  constructor(
    readonly codigo: string,
    readonly estadoHttp: number,
    readonly detalles: DetalleValidacionApi[] = [],
    readonly identificadorSolicitud?: string,
  ) {
    super("No se pudo completar la solicitud.");
    this.name = "ErrorApi";
  }
}
