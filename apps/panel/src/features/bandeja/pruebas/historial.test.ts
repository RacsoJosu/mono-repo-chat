import assert from "node:assert/strict";
import { InfiniteQueryObserver, QueryClient } from "@tanstack/react-query";
import { test } from "vitest";
import { conversacionesDemostracion } from "@/features/bandeja/constantes/conversaciones-demostracion";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/services/bandeja-demostracion.service";
import { opcionesMensajesChat } from "@/features/bandeja/utils/bandeja.query-options";
import { normalizarErrorApi } from "@/lib/cliente-api/normalizar-error-api";

test("fallo del historial conserva páginas y permite reintentar el mismo cursor", async () => {
  const original = crearServicioBandejaDemostracion();
  let fallar = true;
  const servicio = {
    ...original,
    obtenerMensajes: async (entrada: Parameters<typeof original.obtenerMensajes>[0]) => {
      if (entrada.cursor && fallar) throw normalizarErrorApi(500, {});
      return original.obtenerMensajes(entrada);
    },
  };
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const observador = new InfiniteQueryObserver(
    cliente,
    opcionesMensajesChat(servicio, conversacionesDemostracion[0].id),
  );
  const cancelar = observador.subscribe(() => {});
  try {
    await observador.refetch();
    const inicial = observador.getCurrentResult().data?.pages[0];
    await observador.fetchNextPage();
    assert.equal(observador.getCurrentResult().isFetchNextPageError, true);
    assert.deepEqual(observador.getCurrentResult().data?.pages, [inicial]);
    fallar = false;
    await observador.fetchNextPage();
    assert.equal(observador.getCurrentResult().isFetchNextPageError, false);
    assert.equal(observador.getCurrentResult().data?.pages.length, 2);
  } finally {
    cancelar();
    cliente.clear();
  }
});
