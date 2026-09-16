import { createFileRoute, defaultStringifySearch, redirect } from "@tanstack/react-router";
import { LayoutBandejaApi } from "@/features/bandeja/components/layout-bandeja-api";
import { validarBusquedaConversaciones } from "@/features/bandeja/validaciones/busqueda-conversaciones";
export const Route = createFileRoute("/bandeja")({
  validateSearch: validarBusquedaConversaciones,
  beforeLoad: ({ location, search }) => {
    const busquedaCanonica = defaultStringifySearch(validarBusquedaConversaciones(search));
    if (location.searchStr !== busquedaCanonica) {
      throw redirect({
        href: location.pathname + busquedaCanonica + (location.hash ? `#${location.hash}` : ""),
        replace: true,
      });
    }
  },
  component: LayoutBandejaApi,
});
