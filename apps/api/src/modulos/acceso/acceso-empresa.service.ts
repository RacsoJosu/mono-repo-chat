import { ErrorAplicacion } from "../../compartido/errores/error-aplicacion.js";
import type { RepositorioMembresias } from "./tipos/acceso-empresa.js";
export function crearAccesoEmpresa(repositorio: RepositorioMembresias) {
  return {
    async verificar(idUsuario: string, idEmpresa: string) {
      const rol = await repositorio.obtenerRol(idUsuario, idEmpresa);
      if (!rol || !["owner", "admin", "member"].includes(rol))
        throw new ErrorAplicacion(
          "EMPRESA_NO_AUTORIZADA",
          "No tienes acceso a esta empresa.",
          "no_autorizado",
        );
    },
  };
}
