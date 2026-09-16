import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { ServicioBandeja } from "@/features/bandeja/tipos/servicio-bandeja";
import { routeTree } from "./routeTree.gen";

export function crearEnrutador(clienteConsultas: QueryClient, servicioBandeja: ServicioBandeja) {
  return createRouter({ routeTree, context: { clienteConsultas, servicioBandeja } });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof crearEnrutador>;
  }
}
