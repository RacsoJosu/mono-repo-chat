export interface EntradaBootstrap {
  nombreEmpresa: string;
  slug: string;
  nombrePropietario: string;
  email: string;
  clave: string;
}
export interface ResultadoBootstrap {
  idUsuario: string;
  idEmpresa: string;
  creado: boolean;
}
export interface RepositorioBootstrap {
  guardar(
    entrada: Omit<EntradaBootstrap, "clave"> & { hashClave: string },
  ): Promise<ResultadoBootstrap>;
}
