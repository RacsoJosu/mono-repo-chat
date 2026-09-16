import * as esquema from "@chatbot-whatsapp/base-datos";
import { hashPassword } from "better-auth/crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { z } from "zod";
import { crearRepositorioBootstrap } from "../modulos/acceso/bootstrap.repository.js";
import { crearServicioBootstrap } from "../modulos/acceso/bootstrap.service.js";

const variables = z
  .object({
    URL_BASE_DE_DATOS: z.string().url(),
    BOOTSTRAP_EMPRESA: z.string().min(1),
    BOOTSTRAP_SLUG: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    BOOTSTRAP_NOMBRE: z.string().min(1),
    BOOTSTRAP_EMAIL: z.email(),
    BOOTSTRAP_CLAVE: z.string().min(12),
  })
  .safeParse(process.env);
if (!variables.success) {
  process.stderr.write("Faltan variables válidas para el bootstrap. Consulta .env.example.\n");
  process.exitCode = 1;
} else {
  const configuracion = variables.data;
  const conexiones = new Pool({ connectionString: configuracion.URL_BASE_DE_DATOS });
  try {
    const bootstrap = crearServicioBootstrap({
      repositorio: crearRepositorioBootstrap(drizzle(conexiones, { schema: esquema })),
      protegerClave: hashPassword,
    });
    const resultado = await bootstrap({
      nombreEmpresa: configuracion.BOOTSTRAP_EMPRESA,
      slug: configuracion.BOOTSTRAP_SLUG,
      nombrePropietario: configuracion.BOOTSTRAP_NOMBRE,
      email: configuracion.BOOTSTRAP_EMAIL,
      clave: configuracion.BOOTSTRAP_CLAVE,
    });
    process.stdout.write(
      resultado.creado
        ? "Empresa y propietario creados.\n"
        : "El propietario ya existe; sin cambios.\n",
    );
  } catch {
    process.stderr.write(
      "No se pudo completar el bootstrap. Revisa la conexión y los registros existentes.\n",
    );
    process.exitCode = 1;
  } finally {
    await conexiones.end();
  }
}
