import type * as esquema from "@chatbot-whatsapp/base-datos";
import { member } from "@chatbot-whatsapp/base-datos";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { RepositorioMembresias } from "./tipos/acceso-empresa.js";
export function crearRepositorioMembresias(
  base: NodePgDatabase<typeof esquema>,
): RepositorioMembresias {
  return {
    async obtenerRol(idUsuario, idEmpresa) {
      const filas = await base
        .select({ rol: member.role })
        .from(member)
        .where(and(eq(member.userId, idUsuario), eq(member.organizationId, idEmpresa)))
        .limit(1);
      return filas[0]?.rol ?? null;
    },
  };
}
