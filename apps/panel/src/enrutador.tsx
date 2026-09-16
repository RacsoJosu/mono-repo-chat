import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { ServicioBandejaApi } from "@/features/bandeja/tipos/servicio-bandeja-api";
import { routeTree } from "./routeTree.gen";

export function crearEnrutador(queryClient: QueryClient, servicioBandeja: ServicioBandejaApi) {
  return createRouter({ routeTree, context: { queryClient, servicioBandeja } });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof crearEnrutador>;
  }
}
