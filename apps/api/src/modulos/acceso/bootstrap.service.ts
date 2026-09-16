import type { EntradaBootstrap, RepositorioBootstrap } from "./tipos/bootstrap.js";

export function crearServicioBootstrap(dependencias: {
  repositorio: RepositorioBootstrap;
  protegerClave: (clave: string) => Promise<string>;
}) {
  return async (entrada: EntradaBootstrap) => {
    const { clave, ...identidad } = entrada;
    return dependencias.repositorio.guardar({
      ...identidad,
      email: identidad.email.trim().toLowerCase(),
      hashClave: await dependencias.protegerClave(clave),
    });
  };
}
