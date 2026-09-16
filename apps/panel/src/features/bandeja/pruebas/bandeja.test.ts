import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import { test } from "vitest";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/services/bandeja-demostracion.service";
import { opcionesMensajesChat } from "@/features/bandeja/utils/bandeja.query-options";

test("recorre todo el historial sin duplicar ni perder mensajes", async () => {
  const servicio = crearServicioBandejaDemostracion();
  let cursor: string | null = null;
  const paginas = [];
  do {
    const pagina = await servicio.obtenerMensajes({
      id: "01994bd0-1234-7000-8000-000000000001",
      cursor,
    });
    assert.ok(pagina.mensajes.length <= 20);
    paginas.unshift(pagina);
    cursor = pagina.cursorAnterior;
  } while (cursor !== null);
  const mensajes = paginas.flatMap((pagina) => pagina.mensajes);
  assert.equal(mensajes.length, 75);
  assert.equal(new Set(mensajes.map((mensaje) => mensaje.id)).size, 75);
  assert.equal(mensajes[0]?.id, "01994bd0-1234-7000-8000-000000000001-0");
  assert.equal(mensajes.at(-1)?.id, "01994bd0-1234-7000-8000-000000000001-74");
  assert.deepEqual(
    mensajes.map((mensaje) => mensaje.fecha),
    mensajes.map((mensaje) => mensaje.fecha).sort(),
  );
});

test("rechaza chats inexistentes, cursores inválidos y peticiones canceladas", async () => {
  const servicio = crearServicioBandejaDemostracion();
  assert.equal(await servicio.obtenerConversacion("desconocido"), undefined);
  await assert.rejects(servicio.obtenerMensajes({ id: "desconocido", cursor: null }));
  for (const cursor of ["abc", "-1", "76", "1.5", "", " "]) {
    await assert.rejects(
      servicio.obtenerMensajes({ id: "01994bd0-1234-7000-8000-000000000001", cursor }),
    );
  }
  await assert.rejects(
    servicio.obtenerMensajes({
      id: "01994bd0-1234-7000-8000-000000000001",
      cursor: null,
      signal: AbortSignal.abort(),
    }),
  );
});

test("TanStack Query mantiene una caché independiente por chat", async () => {
  const servicio = crearServicioBandejaDemostracion();
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  try {
    const andrea = await cliente.fetchInfiniteQuery(
      opcionesMensajesChat(servicio, "01994bd0-1234-7000-8000-000000000001"),
    );
    const miguel = await cliente.fetchInfiniteQuery(
      opcionesMensajesChat(servicio, "01994bd0-1234-7000-8000-000000000002"),
    );
    assert.ok(
      andrea.pages[0]?.mensajes.every((mensaje) =>
        mensaje.id.startsWith("01994bd0-1234-7000-8000-000000000001-"),
      ),
    );
    assert.ok(
      miguel.pages[0]?.mensajes.every((mensaje) =>
        mensaje.id.startsWith("01994bd0-1234-7000-8000-000000000002-"),
      ),
    );
    assert.equal(cliente.getQueryCache().getAll().length, 2);
    assert.equal(andrea.pages[0]?.cursorAnterior, "55");
  } finally {
    cliente.clear();
  }
});
