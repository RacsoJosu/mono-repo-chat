export class ErrorAplicacion extends Error {
  constructor(
    readonly codigo: string,
    readonly mensajeSeguro: string,
    readonly estadoHttp: number,
    readonly detalles: unknown[] = [],
    opciones?: ErrorOptions,
  ) {
    super(mensajeSeguro, opciones);
    this.name = "ErrorAplicacion";
  }
}
