import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { Tema, ValorTema } from "@/tipos/tema";

export type { Tema } from "@/tipos/tema";

const ContextoTema = createContext<ValorTema | undefined>(undefined);
const nombreCookieTema = "tema-panel";

function obtenerTemaInicial(): Tema {
  if (typeof document === "undefined") return "claro";
  return document.cookie.includes(`${nombreCookieTema}=oscuro`) ? "oscuro" : "claro";
}

export function ProveedorTema({ children }: { children: ReactNode }) {
  const [tema, establecerTema] = useState<Tema>(obtenerTemaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("oscuro", tema === "oscuro");
    const seguro = location.protocol === "https:" ? "; Secure" : "";
    // biome-ignore lint/suspicious/noDocumentCookie: La preferencia de tema se guarda en una cookie legible por el cliente.
    document.cookie = `${nombreCookieTema}=${tema}; Path=/; Max-Age=31536000; SameSite=Lax${seguro}`;
  }, [tema]);

  return (
    <ContextoTema.Provider
      value={{
        tema,
        cambiarTema: () =>
          establecerTema((temaActual) => (temaActual === "claro" ? "oscuro" : "claro")),
      }}
    >
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) throw new Error("useTema debe utilizarse dentro de ProveedorTema.");
  return contexto;
}
