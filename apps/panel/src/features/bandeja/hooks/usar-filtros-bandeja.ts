import { useNavigate, useSearch } from "@tanstack/react-router";
export function useFiltrosBandeja() {
  const filtros = useSearch({ from: "/bandeja" });
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
