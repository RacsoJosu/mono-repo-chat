import {
  type QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

export function ProveedorConsultas({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>{children}</QueryErrorResetBoundary>
    </QueryClientProvider>
  );
}
