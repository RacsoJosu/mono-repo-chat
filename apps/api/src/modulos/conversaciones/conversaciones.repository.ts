import type * as esquema from "@chatbot-whatsapp/base-datos";
import { canalesWhatsapp, contactos, conversaciones } from "@chatbot-whatsapp/base-datos";
import { and, desc, eq, ilike, lt, or, type SQL, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { RepositorioConversaciones } from "./tipos/repositorio-conversaciones.js";
export function crearRepositorioConversaciones(
  base: NodePgDatabase<typeof esquema>,
): RepositorioConversaciones {
  const consultar = (idEmpresa: string, condiciones: SQL | undefined, limite: number) =>
    base.transaction(async (transaccion) => {
      await transaccion.execute(sql`select set_config('hilo.id_empresa', ${idEmpresa}, true)`);
      const filas = await transaccion
        .select({
          id: conversaciones.id,
          contacto: { id: contactos.id, nombre: contactos.nombre, telefono: contactos.telefono },
          canal: {
            id: canalesWhatsapp.id,
            nombre: canalesWhatsapp.nombre,
            telefono: canalesWhatsapp.telefono,
          },
          resumenUltimoMensaje: conversaciones.resumenUltimoMensaje,
          ultimaActividad: conversaciones.ultimaActividad,
        })
        .from(conversaciones)
        .innerJoin(
          contactos,
          and(
            eq(contactos.id, conversaciones.idContacto),
            eq(contactos.idEmpresa, conversaciones.idEmpresa),
          ),
        )
        .innerJoin(
          canalesWhatsapp,
          and(
            eq(canalesWhatsapp.id, conversaciones.idCanal),
            eq(canalesWhatsapp.idEmpresa, conversaciones.idEmpresa),
          ),
        )
        .where(and(eq(conversaciones.idEmpresa, idEmpresa), condiciones))
        .orderBy(desc(conversaciones.ultimaActividad), desc(conversaciones.id))
        .limit(limite);
      return filas.map((fila) => ({
        ...fila,
        ultimaActividad: fila.ultimaActividad.toISOString(),
      }));
    });
  return {
    async listar({ idEmpresa, busqueda, limite, despues }) {
      const patron = `%${busqueda.replace(/[\\%_]/g, "\\$&")}%`;
      const digitos = busqueda.replace(/\D/g, "");
      const filtro = busqueda
        ? or(
            ilike(contactos.nombre, patron),
            ilike(contactos.telefono, patron),
            ilike(conversaciones.resumenUltimoMensaje, patron),
            digitos ? ilike(contactos.telefonoNormalizado, `%${digitos}%`) : undefined,
          )
        : undefined;
      const posicion = despues
        ? or(
            lt(conversaciones.ultimaActividad, new Date(despues.fecha)),
            and(
              eq(conversaciones.ultimaActividad, new Date(despues.fecha)),
              lt(conversaciones.id, despues.id),
            ),
          )
        : undefined;
      return consultar(idEmpresa, and(filtro, posicion), limite);
    },
    async obtener(idEmpresa, id) {
      return (await consultar(idEmpresa, eq(conversaciones.id, id), 1))[0] ?? null;
    },
  };
}
