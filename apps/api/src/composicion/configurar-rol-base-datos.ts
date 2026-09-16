import { Pool } from "pg";
import { z } from "zod";

const variables = z
  .object({
    URL_BASE_DE_DATOS_ADMIN: z.url(),
    DB_RUNTIME_ROLE: z.string().regex(/^[a-z][a-z0-9_]{0,62}$/),
    DB_RUNTIME_PASSWORD: z.string().min(20),
  })
  .safeParse(process.env);
if (!variables.success)
  throw new Error("Configura URL_BASE_DE_DATOS_ADMIN, DB_RUNTIME_ROLE y DB_RUNTIME_PASSWORD.");
const conexiones = new Pool({ connectionString: variables.data.URL_BASE_DE_DATOS_ADMIN });
const cliente = await conexiones.connect();
try {
  await cliente.query("BEGIN");
  const nombre = variables.data.DB_RUNTIME_ROLE;
  const existente = await cliente.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [nombre]);
  if (!existente.rowCount) {
    // El servidor escapa el literal; nunca se imprime la sentencia ni la contraseña.
    const literal = await cliente.query<{ clave: string }>("SELECT quote_literal($1) AS clave", [
      variables.data.DB_RUNTIME_PASSWORD,
    ]);
    await cliente.query(
      `CREATE ROLE "${nombre}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS PASSWORD ${literal.rows[0]?.clave}`,
    );
  }
  const atributos = await cliente.query(
    "SELECT rolsuper,rolbypassrls,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname=$1",
    [nombre],
  );
  if (Object.values(atributos.rows[0] ?? {}).some(Boolean))
    throw new Error("Rol existente privilegiado");
  const heredados = await cliente.query(
    "SELECT 1 FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=$1)",
    [nombre],
  );
  if (heredados.rowCount) throw new Error("El rol no debe pertenecer a otros roles");
  const propiedad = await cliente.query(
    "SELECT EXISTS(SELECT 1 FROM pg_class WHERE relowner=(SELECT oid FROM pg_roles WHERE rolname=$1) AND relnamespace='public'::regnamespace) OR EXISTS(SELECT 1 FROM pg_namespace WHERE nspowner=(SELECT oid FROM pg_roles WHERE rolname=$1) AND nspname='public') OR EXISTS(SELECT 1 FROM pg_database WHERE datname=current_database() AND datdba=(SELECT oid FROM pg_roles WHERE rolname=$1)) AS propietario",
    [nombre],
  );
  if (propiedad.rows[0]?.propietario) throw new Error("El runtime no puede ser propietario");
  await cliente.query(`REVOKE CREATE ON SCHEMA public FROM "${nombre}"`);
  const ddl = await cliente.query("SELECT has_schema_privilege($1,'public','CREATE') AS puede", [
    nombre,
  ]);
  if (ddl.rows[0]?.puede) throw new Error("Retira CREATE público antes de configurar el runtime");
  await cliente.query(`GRANT USAGE ON SCHEMA public TO "${nombre}"`);
  const tablas = await cliente.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname='public'",
  );
  for (const { tablename } of tablas.rows) {
    const tabla = `"${tablename.replaceAll('"', '""')}"`;
    await cliente.query(`REVOKE ALL ON ${tabla} FROM "${nombre}"`);
    const lectura = ["contactos", "canales_whatsapp", "conversaciones"].includes(tablename);
    await cliente.query(
      `GRANT ${lectura ? "SELECT" : "SELECT, INSERT, UPDATE, DELETE"} ON ${tabla} TO "${nombre}"`,
    );
  }
  await cliente.query("COMMIT");
  console.info("Rol de ejecución configurado. Credenciales existentes conservadas.");
} catch {
  await cliente.query("ROLLBACK");
  console.error("No se configuró el rol; revisa permisos y variables.");
  process.exitCode = 1;
} finally {
  cliente.release();
  await conexiones.end();
}
