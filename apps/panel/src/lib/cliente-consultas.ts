import { QueryClient } from "@tanstack/react-query";

export function crearClienteConsultas() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
