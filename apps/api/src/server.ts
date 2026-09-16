import * as esquema from "@chatbot-whatsapp/base-datos";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { crearAplicacion } from "./app.js";
import { componerBandeja } from "./composicion/bandeja.js";
import { entorno } from "./configuracion/entorno.js";
import { validarRolBaseDatos } from "./configuracion/validar-rol-base-datos.js";
import { crearAutenticacion } from "./modulos/acceso/acceso.autenticacion.js";

const conexiones = new Pool({ connectionString: entorno.URL_BASE_DE_DATOS });
try {
  await validarRolBaseDatos(conexiones);
} catch (error) {
  await conexiones.end();
  throw error;
}
const autenticacion = crearAutenticacion({
  baseDeDatos: drizzle(conexiones, { schema: esquema }),
  urlPublica: entorno.URL_PUBLICA,
  secreto: entorno.SECRETO_AUTENTICACION,
  produccion: entorno.ENTORNO === "produccion",
});
const aplicacion = await crearAplicacion({
  conversaciones: componerBandeja(
    drizzle(conexiones, { schema: esquema }),
    entorno.SECRETO_AUTENTICACION,
  ),
  autenticacion,
  urlPublica: entorno.URL_PUBLICA,
});
aplicacion.addHook("onClose", async () => {
  await conexiones.end();
});
for (const senal of ["SIGTERM", "SIGINT"] as const) {
  process.once(senal, () => {
    void aplicacion.close();
  });
}
await aplicacion.listen({ host: "0.0.0.0", port: entorno.PUERTO_API });
