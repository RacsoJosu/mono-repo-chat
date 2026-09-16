import { z } from "zod";

const esquemaRespuesta = z.record(z.string(), z.unknown());

export function omitirCredencialesSesion(contenido: unknown) {
  const resultado = esquemaRespuesta.safeParse(contenido);
  if (!resultado.success) return null;
  const respuesta = resultado.data;
  delete respuesta.token;
  const sesion = esquemaRespuesta.safeParse(respuesta.session);
  if (sesion.success) {
    delete sesion.data.token;
    respuesta.session = sesion.data;
  }
  return respuesta;
}
