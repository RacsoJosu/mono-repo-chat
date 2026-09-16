import { ErrorApi } from "@/lib/cliente-api/error-api";
import { anticipacionAvisoSesion, intervaloComprobacionSesion } from "../constantes/sesion";
import type { CanalSesion, EmpresaPanel, ServicioSesion, StoreSesion } from "../tipos/sesion";
export function crearCoordinadorSesion(dependencias: {
  store: StoreSesion;
  servicio: ServicioSesion;
  canal: CanalSesion;
  limpiar: () => void;
  ahora?: () => number;
}) {
  const { store, servicio, canal, limpiar } = dependencias;
  const ahora = dependencias.ahora ?? Date.now;
  let pendiente: Promise<void> | undefined;
  let ultima = -Infinity;
  let bloqueada = false;
  let aviso: ReturnType<typeof setTimeout> | undefined;
  let vencimiento: ReturnType<typeof setTimeout> | undefined;
  const cancelarReloj = () => {
    clearTimeout(aviso);
    clearTimeout(vencimiento);
  };
  const vaciar = (estado: "anonima" | "expirada") => {
    cancelarReloj();
    pendiente = undefined;
    store.setState({
      estado,
      sesion: null,
      empresa: null,
      aviso: false,
      error: null,
      generacion: store.getState().generacion + 1,
    });
    limpiar();
  };
  const expirar = () => {
    if (store.getState().estado === "expirada" || bloqueada) return;
    vaciar(store.getState().estado === "activa" ? "expirada" : "anonima");
  };
  const comprobar = async (forzar = false): Promise<void> => {
    if (bloqueada) return;
    if (pendiente) return pendiente;
    if (!forzar && ahora() - ultima < intervaloComprobacionSesion) return;
    const generacion = store.getState().generacion;
    const tarea = (async () => {
      try {
        const sesion = await servicio.estado();
        if (bloqueada || generacion !== store.getState().generacion) return;
        const anterior = store.getState().sesion;
        if (anterior && anterior.usuario.id !== sesion.usuario.id) {
          limpiar();
          store.setState({ empresa: null, generacion: generacion + 1 });
        }
        ultima = ahora();
        cancelarReloj();
        const restante = Date.parse(sesion.venceEn) - Date.parse(sesion.horaServidor);
        if (restante <= 0) {
          expirar();
          return;
        }
        store.setState({
          estado: "activa",
          sesion,
          error: null,
          aviso: restante <= anticipacionAvisoSesion,
        });
        aviso = setTimeout(
          () => store.setState({ aviso: true }),
          Math.max(0, restante - anticipacionAvisoSesion),
        );
        vencimiento = setTimeout(expirar, restante);
      } catch (error) {
        if (generacion !== store.getState().generacion || bloqueada) return;
        ultima = ahora();
        if (error instanceof ErrorApi && error.estadoHttp === 401) expirar();
        else
          store.setState({
            error: "No pudimos comprobar la sesión. Reintenta cuando tengas conexión.",
          });
      }
    })();
    pendiente = tarea;
    try {
      await tarea;
    } finally {
      if (pendiente === tarea) pendiente = undefined;
    }
  };
  const desuscribir = canal.escuchar((evento) => {
    if (evento === "cierre_confirmado" || evento === "cierre_fallido") {
      store.setState({
        cerrando: false,
        error:
          evento === "cierre_fallido"
            ? "No se confirmó el cierre en el servidor. Reintenta cerrar sesión."
            : null,
      });
      return;
    }
    if (evento === "renovacion") {
      if (!bloqueada) void comprobar(true);
      return;
    }
    if (evento === "cierre") {
      bloqueada = true;
      vaciar("anonima");
      store.setState({ cerrando: true });
      return;
    }
    bloqueada = false;
    ultima = -Infinity;
    vaciar("anonima");
    store.setState({ estado: "comprobando", cerrando: false });
    void comprobar(true);
  });
  return {
    comprobar,
    expirar,
    async iniciar() {
      if (store.getState().cerrando) return;
      bloqueada = false;
      ultima = -Infinity;
      await comprobar(true);
      if (store.getState().sesion?.etapa === "listo") canal.publicar("inicio");
    },
    async cerrar() {
      if (store.getState().cerrando) return;
      bloqueada = true;
      vaciar("anonima");
      store.setState({ cerrando: true });
      canal.publicar("cierre");
      try {
        await servicio.cerrar();
        canal.publicar("cierre_confirmado");
      } catch {
        canal.publicar("cierre_fallido");
        store.setState({
          error: "No se confirmó el cierre en el servidor. Reintenta cerrar sesión.",
        });
      } finally {
        store.setState({ cerrando: false });
      }
    },
    async renovar() {
      const generacion = store.getState().generacion;
      try {
        await servicio.renovar();
        if (generacion !== store.getState().generacion || bloqueada) return;
        await comprobar(true);
        if (store.getState().estado === "activa") canal.publicar("renovacion");
      } catch (error) {
        if (generacion !== store.getState().generacion || bloqueada) return;
        if (error instanceof ErrorApi && error.estadoHttp === 401) expirar();
        else store.setState({ error: "No pudimos renovar la sesión. Reintenta." });
      }
    },
    seleccionar(empresa: EmpresaPanel | null) {
      limpiar();
      store.setState({ empresa, generacion: store.getState().generacion + 1 });
    },
    destruir() {
      cancelarReloj();
      desuscribir();
      canal.cerrar();
      pendiente = undefined;
      store.setState({ generacion: store.getState().generacion + 1 });
    },
  };
}
