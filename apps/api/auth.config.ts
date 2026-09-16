import { betterAuth } from "better-auth";
import { opcionesIdentidad } from "./src/modulos/acceso/configuracion/identidad.js";

export const auth = betterAuth(opcionesIdentidad);
