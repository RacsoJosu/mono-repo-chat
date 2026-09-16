import { z } from "zod";
import { nombreCanalSesion } from "../constantes/sesion";
import type { CanalSesion } from "../tipos/sesion";

const esquemaEvento = z.object({
  id: z.string(),
  evento: z.enum(["inicio", "cierre", "renovacion", "cierre_confirmado", "cierre_fallido"]),
  emisor: z.string(),
});
export function crearCanalSesion(ventana: Window): CanalSesion {
  const emisor = crypto.randomUUID();
  const canal =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(nombreCanalSesion) : null;
  return {
    publicar(evento) {
      const mensaje = { id: crypto.randomUUID(), evento, emisor };
      if (canal) canal.postMessage(mensaje);
      else
        try {
          ventana.localStorage.setItem(nombreCanalSesion, JSON.stringify(mensaje));
          ventana.localStorage.removeItem(nombreCanalSesion);
        } catch {
          /* La reconciliación al enfocar sigue disponible. */
        }
    },
    escuchar(recibir) {
      const procesar = (contenido: unknown) => {
        const resultado = esquemaEvento.safeParse(contenido);
        if (resultado.success && resultado.data.emisor !== emisor) recibir(resultado.data.evento);
      };
      const mensaje = (evento: MessageEvent<unknown>) => procesar(evento.data);
      const almacenamiento = (evento: StorageEvent) => {
        if (evento.key === nombreCanalSesion && evento.newValue) {
          try {
            procesar(JSON.parse(evento.newValue));
          } catch {
            /* Evento ajeno o inválido. */
          }
        }
      };
      canal?.addEventListener("message", mensaje);
      if (!canal) ventana.addEventListener("storage", almacenamiento);
      return () => {
        canal?.removeEventListener("message", mensaje);
        ventana.removeEventListener("storage", almacenamiento);
      };
    },
    cerrar() {
      canal?.close();
    },
  };
}
