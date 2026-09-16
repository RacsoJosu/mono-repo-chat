import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";
import { crearServicioBandejaApi } from "../services/bandeja-api.service";
import { opcionesListaConversaciones } from "../utils/conversaciones.query-options";

test("valida ID antes de consultar y separa cachés por identidad y empresa", async () => {
  let peticiones = 0;
  const cliente = async () => {
    peticiones++;
    return { conversaciones: [], cursorSiguiente: null };
  };
  const a = crearServicioBandejaApi(cliente, "usuario", "empresa-a");
  const b = crearServicioBandejaApi(cliente, "usuario", "empresa-b");
  const c = crearServicioBandejaApi(cliente, "otro", "empresa-a");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  try {
    await expect(a.obtenerConversacion("123")).rejects.toThrow();
    expect(peticiones).toBe(0);
    await queryClient.fetchInfiniteQuery(opcionesListaConversaciones(a, "Ana"));
    await queryClient.fetchInfiniteQuery(opcionesListaConversaciones(b, "Ana"));
    await queryClient.fetchInfiniteQuery(opcionesListaConversaciones(c, "Ana"));
    expect(queryClient.getQueryCache().getAll()).toHaveLength(3);
  } finally {
    queryClient.clear();
  }
});
test("incluye el cursor opaco y AbortSignal y rechaza contratos inválidos", async () => {
  const abortar = new AbortController();
  let rutaRecibida = "";
  let opcionesRecibidas: RequestInit | undefined;
  const servicio = crearServicioBandejaApi(
    async (ruta, opciones) => {
      rutaRecibida = ruta;
      opcionesRecibidas = opciones;
      return { conversaciones: [], cursorSiguiente: null };
    },
    "u",
    "empresa/a",
  );
  await servicio.listarConversaciones({
    busqueda: "Ana & José",
    cursor: "a.b",
    signal: abortar.signal,
  });
  expect(rutaRecibida).toBe(
    "/api/empresas/empresa%2Fa/conversaciones?busqueda=Ana+%26+Jos%C3%A9&limite=20&cursor=a.b",
  );
  expect(opcionesRecibidas?.signal).toBe(abortar.signal);
  const invalido = crearServicioBandejaApi(async () => ({ conversaciones: "no" }), "u", "e");
  await expect(invalido.listarConversaciones({ busqueda: "", cursor: null })).rejects.toThrow();
});
