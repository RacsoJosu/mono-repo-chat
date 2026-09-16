export interface RepositorioMembresias {
  obtenerRol(idUsuario: string, idEmpresa: string): Promise<string | null>;
}
