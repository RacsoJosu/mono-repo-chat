export type EstadoAtencion = "pendiente" | "bot" | "asesor";

export type ConversacionDemostracion = {
  id: string;
  nombre: string;
  iniciales: string;
  resumen: string;
  hora: string;
  estado: EstadoAtencion;
  mensajesSinLeer: number;
};
