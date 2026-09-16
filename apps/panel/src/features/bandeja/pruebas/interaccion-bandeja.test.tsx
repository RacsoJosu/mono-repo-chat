import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { conversacionesDemostracion } from "@/features/bandeja/pruebas/demostracion/constantes/conversaciones-demostracion";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/pruebas/demostracion/services/bandeja-demostracion.service";
import { normalizarErrorApi } from "@/lib/cliente-api/normalizar-error-api";
import { montarBandeja } from "./montar-bandeja";

let cerrar: (() => Promise<void>) | undefined;
beforeEach(() => {
  // jsdom no implementa media queries; las dimensiones y el scroll se verifican con Playwright.
  vi.stubGlobal("matchMedia", (consulta: string) => ({
    matches: false,
    media: consulta,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }));
  vi.stubGlobal("scrollTo", () => {});
});
afterEach(async () => {
  await cerrar?.();
  cerrar = undefined;
  vi.unstubAllGlobals();
});

test("buscar sin coincidencias permite limpiar y recuperar la lista", async () => {
  const usuario = userEvent.setup();
  ({ cerrar } = await montarBandeja());
  await usuario.type(await screen.findByLabelText("Buscar conversaciones"), "nadie");
  expect(await screen.findByRole("heading", { name: "Sin coincidencias" })).toBeVisible();
  expect(screen.queryByRole("link", { name: /Andrea López/ })).not.toBeInTheDocument();
  await usuario.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
  expect(await screen.findByRole("link", { name: /Andrea López/ })).toBeVisible();
  expect(screen.getByLabelText("Buscar conversaciones")).toHaveValue("");
});

test("filtrar pendientes y seleccionar un chat conserva la búsqueda en la URL", async () => {
  const usuario = userEvent.setup();
  const vista = await montarBandeja();
  cerrar = vista.cerrar;
  await usuario.click(await screen.findByLabelText("Mostrar solo conversaciones pendientes"));
  expect(screen.queryByRole("link", { name: /Miguel Cruz/ })).not.toBeInTheDocument();
  await usuario.type(screen.getByLabelText("Buscar conversaciones"), "Andrea");
  await usuario.click(await screen.findByRole("link", { name: /Andrea López/ }));
  expect(await screen.findByRole("heading", { name: "Andrea López" })).toBeVisible();
  expect(vista.enrutador.state.location.pathname).toBe(
    "/bandeja/chat/01994bd0-1234-7000-8000-000000000001",
  );
  expect(vista.enrutador.state.location.search).toEqual({ busqueda: "Andrea", pendientes: true });
});

test("un fallo inicial de mensajes permite reintentar y mostrar la conversación", async () => {
  const original = crearServicioBandejaDemostracion();
  let fallar = true;
  const servicio = {
    ...original,
    obtenerMensajes: async (entrada: Parameters<typeof original.obtenerMensajes>[0]) => {
      if (fallar) {
        fallar = false;
        throw normalizarErrorApi(500, {});
      }
      return original.obtenerMensajes(entrada);
    },
  };
  ({ cerrar } = await montarBandeja(
    "/bandeja/chat/01994bd0-1234-7000-8000-000000000001",
    servicio,
  ));
  expect(
    await screen.findByRole("heading", { name: "El servicio no está disponible" }),
  ).toBeVisible();
  await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
  await waitFor(() =>
    expect(
      within(screen.getByLabelText("Mensajes de la conversación")).getAllByRole("listitem"),
    ).toHaveLength(20),
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("un fallo del historial conserva mensajes y el reintento agrega los anteriores", async () => {
  const original = crearServicioBandejaDemostracion();
  let fallar = true;
  const servicio = {
    ...original,
    obtenerMensajes: async (entrada: Parameters<typeof original.obtenerMensajes>[0]) => {
      if (entrada.cursor && fallar) {
        fallar = false;
        throw normalizarErrorApi(500, {});
      }
      return original.obtenerMensajes(entrada);
    },
  };
  ({ cerrar } = await montarBandeja(
    "/bandeja/chat/01994bd0-1234-7000-8000-000000000001",
    servicio,
  ));
  const region = within(await screen.findByLabelText("Mensajes de la conversación"));
  await waitFor(() => expect(region.getAllByRole("listitem")).toHaveLength(20));
  const mensajesPrevios = region.getAllByRole("listitem").map((mensaje) => mensaje.textContent);
  const usuario = userEvent.setup();
  await usuario.click(region.getByRole("button", { name: "Cargar mensajes anteriores" }));
  expect(await region.findByRole("alert")).toBeVisible();
  expect(region.getAllByRole("listitem").map((mensaje) => mensaje.textContent)).toEqual(
    mensajesPrevios,
  );
  await usuario.click(region.getByRole("button", { name: "Reintentar historial" }));
  await waitFor(() => expect(region.getAllByRole("listitem")).toHaveLength(40));
  expect(
    region
      .getAllByRole("listitem")
      .slice(-20)
      .map((mensaje) => mensaje.textContent),
  ).toEqual(mensajesPrevios);
});

test("la conversación se actualiza cuando cambia la caché compartida", async () => {
  const vista = await montarBandeja("/bandeja/chat/01994bd0-1234-7000-8000-000000000001");
  cerrar = vista.cerrar;
  await screen.findByRole("heading", { name: "Andrea López" });
  await act(async () => {
    vista.queryClient.setQueryData(
      ["bandeja", "chat", "01994bd0-1234-7000-8000-000000000001", "conversacion"],
      { ...conversacionesDemostracion[0], nombre: "Andrea actualizada" },
    );
  });
  expect(await screen.findByRole("heading", { name: "Andrea actualizada" })).toBeVisible();
});
