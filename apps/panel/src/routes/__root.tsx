import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { LayoutPanel } from "@/componentes/layout/layout-panel";
import { PantallaCargando } from "@/componentes/layout/pantalla-cargando";
import { PantallaError } from "@/componentes/layout/pantalla-error";
import { PantallaNoEncontrada } from "@/componentes/layout/pantalla-no-encontrada";
import type { ServicioBandeja } from "@/features/bandeja/tipos/servicio-bandeja";

export const Route = createRootRouteWithContext<{
  clienteConsultas: QueryClient;
  servicioBandeja: ServicioBandeja;
}>()({
  component: LayoutPanel,
  pendingComponent: PantallaCargando,
  errorComponent: PantallaError,
  notFoundComponent: PantallaNoEncontrada,
});
