import { expect, test } from "vitest";
import { crearCursorConversaciones } from "../cursor-conversaciones.js";

const contexto = { idEmpresa: "empresa-a", busqueda: "Ana" };
const posicion = { id: "019947e0-0000-7000-8000-000000000001", fecha: "2026-09-15T00:00:00.000Z" };
test("recupera la posición y rechaza alteración, vencimiento y cambio de contexto", () => {
  let ahora = 1000;
  const cursor = crearCursorConversaciones({
    secreto: "secreto-de-prueba".repeat(3),
    ahora: () => ahora,
  });
  const valor = cursor.emitir(contexto, posicion);
  expect(cursor.leer(contexto, valor)).toEqual(posicion);
  expect(() => cursor.leer(contexto, `${valor}a`)).toThrow();
  expect(() => cursor.leer({ ...contexto, idEmpresa: "empresa-b" }, valor)).toThrow();
  expect(() => cursor.leer({ ...contexto, busqueda: "Pedro" }, valor)).toThrow();
  ahora += 900001;
  expect(() => cursor.leer(contexto, valor)).toThrow();
});
