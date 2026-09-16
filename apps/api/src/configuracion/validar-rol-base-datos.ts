import type { Pool } from "pg";
export async function validarRolBaseDatos(conexiones: Pool) {
  const resultado = await conexiones.query(`
 SELECT r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb
 OR EXISTS(SELECT 1 FROM pg_auth_members WHERE member=r.oid)
 OR EXISTS(SELECT 1 FROM pg_class WHERE relowner=r.oid AND relnamespace='public'::regnamespace)
 OR EXISTS(SELECT 1 FROM pg_namespace WHERE nspowner=r.oid AND nspname='public')
 OR EXISTS(SELECT 1 FROM pg_database WHERE datname=current_database() AND datdba=r.oid)
 OR has_schema_privilege(current_user,'public','CREATE') AS inseguro
 FROM pg_roles r WHERE rolname=current_user`);
  if (resultado.rows[0]?.inseguro !== false)
    throw new Error("La API requiere un rol restringido sin propiedad ni privilegios DDL.");
}
