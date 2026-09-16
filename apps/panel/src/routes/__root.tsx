import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { ErrorRuta } from "@/componentes/errores/error-ruta";
import { PaginaNoEncontrada } from "@/componentes/errores/pagina-no-encontrada";
import { LayoutPanel } from "@/componentes/layout/layout-panel";
import { PantallaCargando } from "@/componentes/layout/pantalla-cargando";
import type { ServicioBandejaApi } from "@/features/bandeja/tipos/servicio-bandeja-api";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  servicioBandeja: ServicioBandejaApi;
}>()({
  component: LayoutPanel,
  pendingComponent: PantallaCargando,
  errorComponent: ErrorRuta,
  notFoundComponent: PaginaNoEncontrada,
});
