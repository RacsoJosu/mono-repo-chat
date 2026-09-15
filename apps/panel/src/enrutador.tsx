import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function crearEnrutador(clienteConsultas: QueryClient) {
  return createRouter({ routeTree, context: { clienteConsultas } });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof crearEnrutador>;
  }
}
