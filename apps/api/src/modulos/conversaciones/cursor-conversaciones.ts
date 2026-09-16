import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { esquemaIdChat } from "@chatbot-whatsapp/compartido";
import { z } from "zod";
import { ErrorAplicacion } from "../../compartido/errores/error-aplicacion.js";
import { duracionCursorMilisegundos } from "./constantes/paginacion.js";
import type { CursorConversaciones } from "./tipos/cursor-conversaciones.js";

const esquemaCursor = z.object({
  version: z.literal(1),
  empresa: z.string(),
  busqueda: z.string(),
  id: esquemaIdChat,
  fecha: z.iso.datetime(),
  vence: z.number(),
});
export function crearCursorConversaciones(dependencias: {
  secreto: string;
  ahora: () => number;
}): CursorConversaciones {
  const clave = createHmac("sha256", dependencias.secreto)
    .update("hilo:cursor:conversaciones:v1")
    .digest();
  const firmar = (valor: string) => createHmac("sha256", clave).update(valor).digest();
  const huella = (texto: string) => createHash("sha256").update(texto).digest("hex");
  return {
    emitir(contexto, posicion) {
      const contenido = Buffer.from(
        JSON.stringify({
          version: 1,
          empresa: contexto.idEmpresa,
          busqueda: huella(contexto.busqueda),
          ...posicion,
          vence: dependencias.ahora() + duracionCursorMilisegundos,
        }),
      ).toString("base64url");
      return `${contenido}.${firmar(contenido).toString("base64url")}`;
    },
    leer(contexto, valor) {
      try {
        if (valor.length > 2048 || !/^[\w-]+\.[\w-]+$/.test(valor)) throw new Error();
        const [contenido = "", firma = ""] = valor.split(".");
        const recibida = Buffer.from(firma, "base64url");
        const esperada = firmar(contenido);
        if (
          recibida.length !== esperada.length ||
          !timingSafeEqual(recibida, esperada) ||
          recibida.toString("base64url") !== firma
        )
          throw new Error();
        const cursor = esquemaCursor.parse(
          JSON.parse(Buffer.from(contenido, "base64url").toString("utf8")),
        );
        if (
          cursor.empresa !== contexto.idEmpresa ||
          cursor.busqueda !== huella(contexto.busqueda) ||
          cursor.vence <= dependencias.ahora()
        )
          throw new Error();
        return { id: cursor.id, fecha: cursor.fecha };
      } catch {
        throw new ErrorAplicacion(
          "CURSOR_INVALIDO",
          "Actualiza la lista para continuar.",
          "validacion",
        );
      }
    },
  };
}
