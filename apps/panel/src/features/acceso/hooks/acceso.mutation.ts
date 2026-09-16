import { useMutation } from "@tanstack/react-query";
import { useAcceso } from "../store/proveedor-sesion";
export function useAccesoMutation<T = void, R = unknown>(
  ejecutar: (entrada: T) => Promise<R>,
  completar?: (resultado: R) => Promise<void> | void,
) {
  const { store } = useAcceso();
  return useMutation({
    mutationFn: async (entrada: T) => {
      const generacion = store.getState().generacion;
      const resultado = await ejecutar(entrada);
      if (generacion !== store.getState().generacion)
        throw new DOMException("Operación cancelada", "AbortError");
      return resultado;
    },
    onSuccess: completar,
    retry: false,
  });
}
