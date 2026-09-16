import type * as esquema from "@chatbot-whatsapp/base-datos";
import {
  canalesWhatsapp,
  contactos,
  conversaciones,
  organization,
} from "@chatbot-whatsapp/base-datos";
import { eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { generarConversaciones } from "./generar-conversaciones.js";
export async function sembrarConversaciones(
  base: NodePgDatabase<typeof esquema>,
  empresa: string,
  cantidad: number,
  semilla: number,
) {
  const lote = generarConversaciones(empresa, cantidad, semilla);
  return base.transaction(async (transaccion) => {
    await transaccion.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`seed:inbox:${empresa}`}))`,
    );
    if (
      !(
        await transaccion
          .select({ id: organization.id })
          .from(organization)
          .where(eq(organization.id, empresa))
      )[0]
    )
      throw new Error("La empresa no existe");
    await transaccion.execute(sql`select set_config('hilo.id_empresa', ${empresa}, true)`);
    await transaccion
      .insert(canalesWhatsapp)
      .values(lote.canal)
      .onConflictDoNothing({ target: canalesWhatsapp.id });
    const canal = (
      await transaccion.select().from(canalesWhatsapp).where(eq(canalesWhatsapp.id, lote.canal.id))
    )[0];
    if (canal?.idEmpresa !== empresa || canal.telefono !== lote.canal.telefono)
      throw new Error("Conflicto de canal");
    for (const contacto of lote.contactos) {
      await transaccion
        .insert(contactos)
        .values(contacto)
        .onConflictDoNothing({ target: contactos.id });
      const existente = (
        await transaccion.select().from(contactos).where(eq(contactos.id, contacto.id))
      )[0];
      if (
        existente?.idEmpresa !== empresa ||
        existente.telefonoNormalizado !== contacto.telefonoNormalizado
      )
        throw new Error("Conflicto de contacto");
    }
    for (const conversacion of lote.conversaciones) {
      await transaccion
        .insert(conversaciones)
        .values(conversacion)
        .onConflictDoNothing({ target: conversaciones.id });
      const existente = (
        await transaccion
          .select()
          .from(conversaciones)
          .where(eq(conversaciones.id, conversacion.id))
      )[0];
      if (
        existente?.idEmpresa !== empresa ||
        existente.idContacto !== conversacion.idContacto ||
        existente.idCanal !== conversacion.idCanal
      )
        throw new Error("Conflicto de conversación");
    }
    return { conversaciones: lote.conversaciones.length };
  });
}
