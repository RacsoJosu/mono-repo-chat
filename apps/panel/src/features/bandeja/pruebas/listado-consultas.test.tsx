import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, test } from "vitest";
import { useListaConversaciones } from "../hooks/conversaciones.query";
import type { ServicioBandejaApi } from "../tipos/servicio-bandeja-api";

test("actualizar vuelve a la primera página y descarta los cursores anteriores", async () => {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const servicio: ServicioBandejaApi = {
    idUsuario: "u",
    idEmpresa: "e",
    obtenerConversacion: async () => {
      throw new Error("No se usa en listado");
    },
    listarConversaciones: async ({ cursor }) => ({
      conversaciones: [],
      cursorSiguiente: cursor ? null : "siguiente",
    }),
  };
  const vista = renderHook(() => ({ ...useListaConversaciones(servicio, "") }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
    ),
  });
  try {
    await waitFor(() => expect(vista.result.current.isSuccess).toBe(true));
    await act(async () => {
      await vista.result.current.fetchNextPage();
    });
    await waitFor(() => expect(vista.result.current.data?.pages).toHaveLength(2));
    await act(async () => {
      await vista.result.current.actualizar();
    });
    await waitFor(() => expect(vista.result.current.data?.pages).toHaveLength(1));
    expect(vista.result.current.data?.pageParams).toEqual([null]);
  } finally {
    vista.unmount();
    await cliente.cancelQueries();
    cliente.clear();
  }
});
