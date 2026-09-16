import assert from "node:assert/strict";
import { esquemaIdChat } from "@chatbot-whatsapp/compartido";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { test } from "vitest";
import { conversacionesDemostracion } from "@/features/bandeja/constantes/conversaciones-demostracion";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/services/bandeja-demostracion.service";
import { validarBusquedaBandeja } from "@/features/bandeja/validaciones/busqueda-bandeja";
import { validarParametrosChat } from "@/features/bandeja/validaciones/parametros-chat";
import { routeTree } from "@/routeTree.gen";

test("acepta UUID v7 y rechaza versiones distintas e IDs nominales", () => {
  assert.ok(esquemaIdChat.safeParse(conversacionesDemostracion[0].id).success);
  for (const idChat of ["andrea-lopez", "123", "01994bd0-1234-4000-8000-000000000001"]) {
    assert.throws(() => validarParametrosChat({ idChat }));
  }
});

test("normaliza filtros por campo sin interpretar false como true", () => {
  assert.deepEqual(validarBusquedaBandeja({}), {});
  assert.deepEqual(validarBusquedaBandeja({ busqueda: "Andrea", pendientes: true }), {
    busqueda: "Andrea",
    pendientes: true,
  });
  assert.deepEqual(validarBusquedaBandeja({ busqueda: 12, pendientes: "false", page: "asa" }), {});
  assert.deepEqual(validarBusquedaBandeja({ busqueda: "Andrea", pendientes: [], desconocido: 1 }), {
    busqueda: "Andrea",
  });
  assert.deepEqual(validarBusquedaBandeja({ busqueda: "", pendientes: false }), {});
});

test("el router impide consultar IDs inválidos y conserva el 404 de recursos ausentes", async () => {
  for (const idChat of [
    "incorrecto",
    "01994bd0-1234-4000-8000-000000000001",
    "01994bd0-1234-7000-8000-000000000099",
    conversacionesDemostracion[0].id,
  ]) {
    let llamadas = 0;
    const original = crearServicioBandejaDemostracion();
    const clienteConsultas = new QueryClient();
    const enrutador = createRouter({
      isServer: false,
      routeTree,
      history: createMemoryHistory({ initialEntries: [`/bandeja/chat/${idChat}`] }),
      context: {
        clienteConsultas,
        servicioBandeja: {
          ...original,
          obtenerConversacion: async (identificador) => {
            llamadas++;
            return original.obtenerConversacion(identificador);
          },
        },
      },
    });
    try {
      await enrutador.load();
      assert.equal(llamadas, esquemaIdChat.safeParse(idChat).success ? 1 : 0);
      assert.equal(
        enrutador.state.matches.at(-1)?.status,
        idChat === conversacionesDemostracion[0].id ? "success" : "notFound",
      );
    } finally {
      clienteConsultas.clear();
    }
  }
});
