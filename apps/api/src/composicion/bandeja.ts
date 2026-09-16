import type * as esquema from "@chatbot-whatsapp/base-datos";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { crearRepositorioMembresias } from "../modulos/acceso/acceso-empresa.repository.js";
import { crearAccesoEmpresa } from "../modulos/acceso/acceso-empresa.service.js";
import { crearRepositorioConversaciones } from "../modulos/conversaciones/conversaciones.repository.js";
import { crearServicioConversaciones } from "../modulos/conversaciones/conversaciones.service.js";
import { crearCursorConversaciones } from "../modulos/conversaciones/cursor-conversaciones.js";
export function componerBandeja(base: NodePgDatabase<typeof esquema>, secreto: string) {
  return crearServicioConversaciones({
    repositorio: crearRepositorioConversaciones(base),
    acceso: crearAccesoEmpresa(crearRepositorioMembresias(base)),
    cursor: crearCursorConversaciones({ secreto, ahora: Date.now }),
  });
}
