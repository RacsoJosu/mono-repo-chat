import { EstadoError } from "./estado-error";
export function RecursoNoEncontrado() {
  return (
    <EstadoError
      titulo="Recurso no encontrado"
      descripcion="Lo sentimos, este recurso no existe o ya no está disponible."
    />
  );
}
