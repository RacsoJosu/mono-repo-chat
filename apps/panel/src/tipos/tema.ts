export type Tema = "claro" | "oscuro";

export type ValorTema = {
  tema: Tema;
  cambiarTema: () => void;
};
