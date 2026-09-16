import assert from "node:assert/strict";
import { esquemaIdChat } from "@chatbot-whatsapp/compartido";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { test } from "vitest";
import { conversacionesDemostracion } from "@/features/bandeja/pruebas/demostracion/constantes/conversaciones-demostracion";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/pruebas/demostracion/services/bandeja-demostracion.service";
import { validarBusquedaBandeja } from "@/features/bandeja/pruebas/demostracion/validaciones/busqueda-bandeja";
import { validarParametrosChat } from "@/features/bandeja/validaciones/parametros-chat";
import { arbolDemostracion as routeTree } from "./enrutador-demostracion";

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
    const queryClient = new QueryClient();
    const enrutador = createRouter({
      isServer: false,
      routeTree,
      history: createMemoryHistory({ initialEntries: [`/bandeja/chat/${idChat}`] }),
      context: {
        queryClient,
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
      queryClient.clear();
    }
  }
});

test("el loader reutiliza la conversación disponible en Query sin llamar al servicio", async () => {
  const queryClient = new QueryClient();
  const conversacion = conversacionesDemostracion[0];
  queryClient.setQueryData(["bandeja", "chat", conversacion.id, "conversacion"], conversacion);
  let llamadas = 0;
  const original = crearServicioBandejaDemostracion();
  const enrutador = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [`/bandeja/chat/${conversacion.id}`] }),
    context: {
      queryClient,
      servicioBandeja: {
        ...original,
        obtenerConversacion: async () => {
          llamadas++;
          return conversacion;
        },
      },
    },
  });
  try {
    await enrutador.load();
    assert.equal(enrutador.state.matches.at(-1)?.status, "success");
    assert.equal(llamadas, 0);
  } finally {
    queryClient.clear();
  }
});
