import { createContext, type ReactNode, useContext } from "react";
import type { ContextoAcceso } from "../tipos/contexto-acceso";

const Contexto = createContext<ContextoAcceso | null>(null);
export function ProveedorSesion({
  acceso,
  children,
}: {
  acceso: ContextoAcceso;
  children: ReactNode;
}) {
  return <Contexto.Provider value={acceso}>{children}</Contexto.Provider>;
}
export function useAccesoOpcional() {
  return useContext(Contexto);
}
export function useAcceso() {
  const acceso = useAccesoOpcional();
  if (!acceso) throw new Error("Falta proveedor de sesión");
  return acceso;
}
