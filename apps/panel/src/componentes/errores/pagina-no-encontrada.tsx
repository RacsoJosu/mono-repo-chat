import { EstadoError } from "./estado-error";
export function PaginaNoEncontrada() {
  return (
    <EstadoError
      titulo="No encontramos esta página"
      descripcion="Comprueba la dirección o vuelve a la bandeja para continuar."
    />
  );
}
