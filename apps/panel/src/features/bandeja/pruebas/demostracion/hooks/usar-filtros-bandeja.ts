import { useNavigate, useSearch } from "@tanstack/react-router";
import { validarBusquedaBandeja } from "@/features/bandeja/pruebas/demostracion/validaciones/busqueda-bandeja";
export function useFiltrosBandeja() {
  const filtros = validarBusquedaBandeja(useSearch({ strict: false }));
  const navegar = useNavigate();
  function cambiarFiltros(cambios: { busqueda?: string; pendientes?: boolean }) {
    void navegar({
      to: ".",
      search: { ...filtros, ...cambios },
      replace: true,
      resetScroll: false,
    });
  }
  return {
    busqueda: filtros.busqueda ?? "",
    pendientes: filtros.pendientes ?? false,
    cambiarFiltros,
  };
}
