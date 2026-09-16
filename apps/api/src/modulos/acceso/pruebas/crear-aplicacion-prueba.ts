import { randomBytes } from "node:crypto";
import * as esquema from "@chatbot-whatsapp/base-datos";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { crearAplicacion } from "../../../app.js";
import { crearAutenticacion } from "../acceso.autenticacion.js";

export async function crearAplicacionPrueba() {
  const conexiones = new Pool({ connectionString: process.env.URL_BASE_DE_DATOS_PRUEBAS });
  const autenticacion = crearAutenticacion({
    baseDeDatos: drizzle(conexiones, { schema: esquema }),
    urlPublica: "http://localhost:3000",
    secreto: randomBytes(48).toString("hex"),
    produccion: false,
  });
  const aplicacion = await crearAplicacion({ autenticacion, urlPublica: "http://localhost:3000" });
  aplicacion.addHook("onClose", async () => {
    await conexiones.end();
  });
  return aplicacion;
}
