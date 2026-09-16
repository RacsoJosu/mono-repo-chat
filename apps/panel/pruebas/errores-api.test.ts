import assert from "node:assert/strict";
import { test } from "node:test";
import { InfiniteQueryObserver, QueryClient } from "@tanstack/react-query";
import { conversacionesDemostracion } from "../src/features/bandeja/constantes/conversaciones-demostracion";
import { crearServicioBandejaDemostracion } from "../src/features/bandeja/services/bandeja-demostracion.service";
import { opcionesMensajesChat } from "../src/features/bandeja/utils/bandeja.query-options";
import { normalizarErrorApi } from "../src/lib/cliente-api/normalizar-error-api";

test("normaliza 400, 404 y 500 sin publicar mensajes internos", () => {
  for (const estado of [400, 404, 500]) {
    const error = normalizarErrorApi(estado, {
      error: {
        code: "ERROR_PRUEBA",
        message: "SQL secreto",
        details: [{ campo: "nombre", regla: "required", mensaje: "stack privado" }],
        requestId: "solicitud-123",
      },
    });
    assert.equal(error.estadoHttp, estado);
    assert.equal(error.identificadorSolicitud, "solicitud-123");
    assert.equal(error.message.includes("SQL"), false);
    assert.deepEqual(error.detalles, [
      { campo: "nombre", regla: "required", mensaje: "Revisa el valor de este campo." },
    ]);
  }
  const inesperado = normalizarErrorApi(500, { stack: "secreto" });
  assert.equal(inesperado.codigo, "RESPUESTA_INESPERADA");
  assert.equal(inesperado.identificadorSolicitud, undefined);
  assert.equal(
    normalizarErrorApi(500, { error: { requestId: "solicitud-456" } }).identificadorSolicitud,
    "solicitud-456",
  );
});

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
