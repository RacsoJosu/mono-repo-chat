import { randomUUID } from "node:crypto";
import * as esquema from "@chatbot-whatsapp/base-datos";
import { and, eq, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { ErrorAplicacion } from "../../compartido/errores/error-aplicacion.js";
import type { RepositorioBootstrap } from "./tipos/bootstrap.js";

export function crearRepositorioBootstrap(
  baseDeDatos: NodePgDatabase<typeof esquema>,
): RepositorioBootstrap {
  return {
    guardar: (entrada) =>
      baseDeDatos.transaction(async (transaccion) => {
        await transaccion.execute(sql`select pg_advisory_xact_lock(hashtext(${entrada.slug}))`);
        const [empresa] = await transaccion
          .select()
          .from(esquema.organization)
          .where(eq(esquema.organization.slug, entrada.slug));
        const [usuario] = await transaccion
          .select()
          .from(esquema.user)
          .where(eq(esquema.user.email, entrada.email));
        if (empresa && usuario) {
          const [membresia] = await transaccion
            .select()
            .from(esquema.member)
            .where(
              and(
                eq(esquema.member.organizationId, empresa.id),
                eq(esquema.member.userId, usuario.id),
              ),
            );
          if (membresia?.role === "owner")
            return { idEmpresa: empresa.id, idUsuario: usuario.id, creado: false };
        }
        if (empresa || usuario)
          throw new ErrorAplicacion(
            "BOOTSTRAP_CONFLICTO",
            "La empresa o el usuario ya existe; no se modificaron sus permisos.",
            "conflicto",
          );
        const idEmpresa = randomUUID();
        const idUsuario = randomUUID();
        await transaccion.insert(esquema.user).values({
          id: idUsuario,
          name: entrada.nombrePropietario,
          email: entrada.email,
          debeCambiarClave: true,
        });
        await transaccion.insert(esquema.account).values({
          id: randomUUID(),
          accountId: idUsuario,
          providerId: "credential",
          userId: idUsuario,
          password: entrada.hashClave,
          updatedAt: new Date(),
        });
        await transaccion.insert(esquema.organization).values({
          id: idEmpresa,
          name: entrada.nombreEmpresa,
          slug: entrada.slug,
          createdAt: new Date(),
        });
        await transaccion.insert(esquema.member).values({
          id: randomUUID(),
          organizationId: idEmpresa,
          userId: idUsuario,
          role: "owner",
          createdAt: new Date(),
        });
        return { idEmpresa, idUsuario, creado: true };
      }),
  };
}
