import { useLayoutEffect, useRef } from "react";

export function useScrollMensajes(
  cantidad: number,
  cargarAnteriores: () => Promise<unknown>,
  puedeCargar: boolean,
) {
  const contenedor = useRef<HTMLElement>(null);
  const posicionAnterior = useRef<{ altura: number } | null>(null);
  const iniciado = useRef(false);
  const cargando = useRef(false);
  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento || cantidad === 0) return;
    if (posicionAnterior.current) {
      elemento.scrollTop =
        elemento.scrollTop + elemento.scrollHeight - posicionAnterior.current.altura;
      posicionAnterior.current = null;
    } else if (!iniciado.current) {
      elemento.scrollTop = elemento.scrollHeight;
      iniciado.current = true;
    }
  }, [cantidad]);
  async function cargar() {
    const elemento = contenedor.current;
    if (!elemento || !puedeCargar || cargando.current) return;
    posicionAnterior.current = {
      altura: elemento.scrollHeight,
    };
    cargando.current = true;
    try {
      await cargarAnteriores();
    } finally {
      cargando.current = false;
    }
  }
  return {
    contenedor,
    cargar,
    alDesplazar: () => {
      if ((contenedor.current?.scrollTop ?? 999) < 80) void cargar();
    },
  };
}
