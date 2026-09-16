import { expect, test, vi } from "vitest";
import { crearCoordinadorSesion } from "../services/coordinador-sesion";
import { crearStoreSesion } from "../store/sesion.store";
import type { CanalSesion, EventoSesion, SesionPanel } from "../tipos/sesion";

const sesion: SesionPanel = {
  usuario: { id: "u", nombre: "Ana" },
  etapa: "listo",
  venceEn: "2026-09-22T12:00:00.000Z",
  horaServidor: "2026-09-15T12:00:00.000Z",
  segundoFactorConfigurado: true,
};
function crearCanales() {
  const oyentes = new Set<(evento: EventoSesion) => void>();
  return (): CanalSesion => {
    let propio: ((evento: EventoSesion) => void) | undefined;
    return {
      publicar: (evento) => {
        for (const recibir of oyentes) if (recibir !== propio) recibir(evento);
      },
      escuchar: (recibir) => {
        propio = recibir;
        oyentes.add(recibir);
        return () => {
          oyentes.delete(recibir);
        };
      },
      cerrar: () => {},
    };
  };
}
test("deduplica comprobaciones y descarta respuestas posteriores al cierre", async () => {
  let resolver!: (sesion: SesionPanel) => void;
  const estado = vi.fn(
    () =>
      new Promise<SesionPanel>((r) => {
        resolver = r;
      }),
  );
  const store = crearStoreSesion();
  const limpiar = vi.fn();
  const coordinador = crearCoordinadorSesion({
    store,
    servicio: { estado, cerrar: async () => {}, renovar: async () => {} },
    canal: crearCanales()(),
    limpiar,
  });
  const primera = coordinador.comprobar();
  const segunda = coordinador.comprobar();
  expect(estado).toHaveBeenCalledTimes(1);
  await coordinador.cerrar();
  resolver(sesion);
  await Promise.all([primera, segunda]);
  expect(store.getState().estado).toBe("anonima");
  expect(store.getState().sesion).toBeNull();
  expect(limpiar).toHaveBeenCalled();
  coordinador.destruir();
});
test("propaga cierre a otras pestañas y verifica inicio en servidor", async () => {
  const canal = crearCanales();
  const primero = crearStoreSesion();
  const segundo = crearStoreSesion();
  const servicio = { estado: async () => sesion, cerrar: async () => {}, renovar: async () => {} };
  const a = crearCoordinadorSesion({ store: primero, servicio, canal: canal(), limpiar: () => {} });
  const b = crearCoordinadorSesion({ store: segundo, servicio, canal: canal(), limpiar: () => {} });
  await a.iniciar();
  await vi.waitFor(() => expect(segundo.getState().estado).toBe("activa"));
  await a.cerrar();
  expect(segundo.getState().estado).toBe("anonima");
  expect(segundo.getState().sesion).toBeNull();
  a.destruir();
  b.destruir();
});
test("un error de red conserva la sesión y varios vencimientos limpian una sola vez", async () => {
  const store = crearStoreSesion();
  const limpiar = vi.fn();
  let falla = false;
  const coordinador = crearCoordinadorSesion({
    store,
    servicio: {
      estado: async () => {
        if (falla) throw new Error("red");
        return sesion;
      },
      cerrar: async () => {},
      renovar: async () => {},
    },
    canal: crearCanales()(),
    limpiar,
  });
  await coordinador.iniciar();
  falla = true;
  await coordinador.comprobar(true);
  expect(store.getState().estado).toBe("activa");
  limpiar.mockClear();
  coordinador.expirar();
  coordinador.expirar();
  expect(store.getState().estado).toBe("expirada");
  expect(limpiar).toHaveBeenCalledTimes(1);
  coordinador.destruir();
});
test("renovar en otra pestaña conserva empresa y datos de la misma identidad", async () => {
  const canal = crearCanales();
  const primero = crearStoreSesion();
  const segundo = crearStoreSesion();
  const limpiar = vi.fn();
  const servicio = { estado: async () => sesion, cerrar: async () => {}, renovar: async () => {} };
  const a = crearCoordinadorSesion({ store: primero, servicio, canal: canal(), limpiar: () => {} });
  const b = crearCoordinadorSesion({ store: segundo, servicio, canal: canal(), limpiar });
  await a.iniciar();
  await b.comprobar(true);
  b.seleccionar({ id: "empresa", name: "Empresa" });
  limpiar.mockClear();
  await a.renovar();
  await b.comprobar(true);
  expect(segundo.getState().empresa?.id).toBe("empresa");
  expect(limpiar).not.toHaveBeenCalled();
  a.destruir();
  b.destruir();
});

test("un cierre pendiente bloquea ingresos y confirma el cierre en todas las pestañas", async () => {
  const canal = crearCanales();
  const primero = crearStoreSesion();
  const segundo = crearStoreSesion();
  let confirmar!: () => void;
  const servicio = {
    estado: async () => sesion,
    cerrar: () =>
      new Promise<void>((resolver) => {
        confirmar = resolver;
      }),
    renovar: async () => {},
  };
  const a = crearCoordinadorSesion({ store: primero, servicio, canal: canal(), limpiar: () => {} });
  const b = crearCoordinadorSesion({ store: segundo, servicio, canal: canal(), limpiar: () => {} });
  await a.iniciar();
  await b.comprobar(true);
  const cierre = a.cerrar();
  expect(primero.getState().cerrando).toBe(true);
  expect(segundo.getState().cerrando).toBe(true);
  await b.iniciar();
  expect(segundo.getState().sesion).toBeNull();
  confirmar();
  await cierre;
  expect(primero.getState().cerrando).toBe(false);
  expect(segundo.getState().cerrando).toBe(false);
  a.destruir();
  b.destruir();
});
test("un fallo tardío de renovación no afecta una sesión posterior", async () => {
  const store = crearStoreSesion();
  let rechazar!: (error: unknown) => void;
  const coordinador = crearCoordinadorSesion({
    store,
    servicio: {
      estado: async () => sesion,
      cerrar: async () => {},
      renovar: () =>
        new Promise<void>((_, rechazo) => {
          rechazar = rechazo;
        }),
    },
    canal: crearCanales()(),
    limpiar: () => {},
  });
  await coordinador.iniciar();
  const renovacion = coordinador.renovar();
  await coordinador.cerrar();
  await coordinador.iniciar();
  rechazar(new Error("Solicitud antigua"));
  await renovacion;
  expect(store.getState().estado).toBe("activa");
  expect(store.getState().error).toBeNull();
  coordinador.destruir();
});
