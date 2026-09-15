import { crearAplicacion } from "./app.js";
import { entorno } from "./configuracion/entorno.js";

const aplicacion = await crearAplicacion();
await aplicacion.listen({ host: "0.0.0.0", port: entorno.PUERTO_API });
