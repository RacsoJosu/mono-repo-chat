import { type Conversacion, esquemaConsultaConversaciones } from "@chatbot-whatsapp/compartido";
import { expect, test, vi } from "vitest";
import { crearServicioConversaciones } from "../conversaciones.service.js";
import { crearCursorConversaciones } from "../cursor-conversaciones.js";

const primero: Conversacion = {
  id: "019947e0-0000-7000-8000-000000000002",
  contacto: { id: "019947e0-0000-7000-8000-000000000003", nombre: "Ana", telefono: "+50499990000" },
  canal: { id: "019947e0-0000-7000-8000-000000000004", nombre: "Ventas", telefono: "+50422220000" },
  resumenUltimoMensaje: null,
  ultimaActividad: "2026-09-15T00:00:00.000Z",
};
test("limita la página y usa el último registro visible para el siguiente cursor", async () => {
  const listar = vi.fn(async () => [
    primero,
    { ...primero, id: "019947e0-0000-7000-8000-000000000001" },
  ]);
  const cursor = crearCursorConversaciones({ secreto: "prueba", ahora: () => 1000 });
  const servicio = crearServicioConversaciones({
    repositorio: { listar, obtener: async () => null },
    acceso: { verificar: async () => {} },
    cursor,
  });
  const pagina = await servicio.listar("u", "e", { busqueda: "", limite: 1 });
  expect(pagina.conversaciones).toEqual([primero]);
  expect(listar).toHaveBeenCalledWith({ idEmpresa: "e", busqueda: "", limite: 2 });
  expect(cursor.leer({ idEmpresa: "e", busqueda: "" }, pagina.cursorSiguiente ?? "")).toEqual({
    id: primero.id,
    fecha: primero.ultimaActividad,
  });
});
test("valida IDs sin consultar y no accede al repositorio sin membresía", async () => {
  const obtener = vi.fn(async () => null);
  const servicio = crearServicioConversaciones({
    repositorio: { listar: async () => [], obtener },
    acceso: {
      verificar: async () => {
        throw new Error("Sin membresía");
      },
    },
    cursor: crearCursorConversaciones({ secreto: "prueba", ahora: () => 0 }),
  });
  await expect(servicio.obtener("u", "e", "123")).rejects.toThrow();
  expect(obtener).not.toHaveBeenCalled();
  await expect(servicio.obtener("u", "e", primero.id)).rejects.toThrow("Sin membresía");
  expect(obtener).not.toHaveBeenCalled();
});
test("rechaza recursos inexistentes y termina páginas vacías sin cursor", async () => {
  const servicio = crearServicioConversaciones({
    repositorio: { listar: async () => [], obtener: async () => null },
    acceso: { verificar: async () => {} },
    cursor: crearCursorConversaciones({ secreto: "prueba", ahora: () => 0 }),
  });
  await expect(servicio.obtener("u", "e", primero.id)).rejects.toMatchObject({
    categoria: "no_encontrado",
  });
  expect(await servicio.listar("u", "e", { busqueda: "", limite: 20 })).toEqual({
    conversaciones: [],
    cursorSiguiente: null,
  });
});
test("valida búsqueda, límites y claves desconocidas en la frontera HTTP", () => {
  expect(esquemaConsultaConversaciones.parse({})).toEqual({ busqueda: "", limite: 20 });
  expect(esquemaConsultaConversaciones.parse({ busqueda: "  Ana   Pérez ", limite: "2" })).toEqual({
    busqueda: "Ana Pérez",
    limite: 2,
  });
  for (const consulta of [
    { limite: "asa" },
    { limite: 0 },
    { limite: 101 },
    { page: 1 },
    { busqueda: "a".repeat(101) },
  ])
    expect(esquemaConsultaConversaciones.safeParse(consulta).success).toBe(false);
});
