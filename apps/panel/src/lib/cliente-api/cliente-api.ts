import { normalizarErrorApi } from "./normalizar-error-api";
export function crearClienteApi(
  transporte: typeof fetch,
  sesionRechazada: () => void,
  generacion: () => number = () => 0,
  empresaRechazada: () => void = () => {},
) {
  return async (ruta: string, opciones: RequestInit = {}, protegida = true): Promise<unknown> => {
    const alEnviar = generacion();
    const respuesta = await transporte(ruta, {
      ...opciones,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...opciones.headers },
    });
    const cuerpo: unknown = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      if (respuesta.status === 401 && protegida && alEnviar === generacion()) sesionRechazada();
      const error = normalizarErrorApi(respuesta.status, cuerpo);
      if (
        protegida &&
        alEnviar === generacion() &&
        error.estadoHttp === 403 &&
        error.codigo === "EMPRESA_NO_AUTORIZADA"
      )
        empresaRechazada();
      throw error;
    }
    if (protegida && alEnviar !== generacion())
      throw new DOMException("La identidad cambió", "AbortError");
    return cuerpo;
  };
}
export type ClienteApi = ReturnType<typeof crearClienteApi>;
