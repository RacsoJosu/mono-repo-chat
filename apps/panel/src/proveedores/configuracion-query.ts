import { QueryClient } from "@tanstack/react-query";

// Se llama una vez en main; las pruebas crean su propia instancia.
export function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, gcTime: 300_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
