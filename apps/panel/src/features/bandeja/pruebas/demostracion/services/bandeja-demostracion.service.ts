import { conversacionesDemostracion } from "@/features/bandeja/pruebas/demostracion/constantes/conversaciones-demostracion";
import type {
  MensajeChat,
  ServicioBandeja,
} from "@/features/bandeja/pruebas/demostracion/tipos/servicio-bandeja";

export function crearServicioBandejaDemostracion(): ServicioBandeja {
  return {
    async obtenerConversacion(id) {
      return conversacionesDemostracion.find((conversacion) => conversacion.id === id);
    },
    async obtenerMensajes({ id, cursor, signal }) {
      signal?.throwIfAborted();
      const conversacion = conversacionesDemostracion.find((entrada) => entrada.id === id);
      if (!conversacion) throw new Error("Conversación no encontrada.");
      if (cursor !== null && !/^(0|[1-9][0-9]*)$/.test(cursor)) throw new Error("Cursor inválido.");
      const fin = cursor === null ? 75 : Number(cursor);
      if (!Number.isInteger(fin) || fin < 0 || fin > 75) throw new Error("Cursor inválido.");
      const inicio = Math.max(0, fin - 20);
      const mensajes: MensajeChat[] = Array.from({ length: fin - inicio }, (_, indice) => {
        const numero = inicio + indice;
        return {
          id: `${id}-${numero}`,
          autor:
            numero === 74 || numero % 3 === 0 ? "contacto" : numero % 3 === 1 ? "bot" : "asesor",
          texto:
            numero === 74
              ? conversacion.resumen
              : numero % 3 === 0
                ? `Soy ${conversacion.nombre}. Quisiera consultar el estado de mi solicitud.`
                : numero % 3 === 1
                  ? "Te ayudaremos a revisar tu solicitud. ¿Puedes contarnos más detalles?"
                  : "Gracias por la información. Estoy revisando tu caso.",
          fecha: new Date(Date.UTC(2026, 8, 15, 9, numero)).toISOString(),
        };
      });
      return { mensajes, cursorAnterior: inicio > 0 ? String(inicio) : null };
    },
  };
}
