import { createFileRoute, defaultStringifySearch, redirect } from "@tanstack/react-router";
import { LayoutBandeja } from "@/features/bandeja/components/layout-bandeja";
import { validarBusquedaBandeja } from "@/features/bandeja/validaciones/busqueda-bandeja";
export const Route = createFileRoute("/bandeja")({
  validateSearch: validarBusquedaBandeja,
  beforeLoad: ({ location, search }) => {
    const busquedaCanonica = defaultStringifySearch(validarBusquedaBandeja(search));
    if (location.searchStr !== busquedaCanonica) {
      throw redirect({
        href: location.pathname + busquedaCanonica + (location.hash ? `#${location.hash}` : ""),
        replace: true,
      });
    }
  },
  component: LayoutBandeja,
});
