import { useStore } from "zustand";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Button } from "@/componentes/ui/button";
import { useAccesoOpcional } from "@/features/acceso/store/proveedor-sesion";
import type { ContextoAcceso } from "@/features/acceso/tipos/contexto-acceso";
import { BotonCambioTema } from "./boton-cambio-tema";
import { SelectorIdioma } from "./selector-idioma";

function UsuarioActual({ acceso }: { acceso: ContextoAcceso }) {
  const { sesion, empresa } = useStore(acceso.store);
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => acceso.coordinador.seleccionar(null)}
        aria-label="Cambiar empresa"
        className="max-w-24 truncate sm:max-w-48"
      >
        {empresa?.name}
      </Button>
      <Avatar className="size-8">
        <AvatarFallback>{sesion?.usuario.nombre.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <span className="hidden truncate text-sm sm:block">{sesion?.usuario.nombre}</span>
      <Button variant="ghost" onClick={() => void acceso.coordinador.cerrar()}>
        Cerrar sesión
      </Button>
    </>
  );
}
export function BarraUsuario() {
  const acceso = useAccesoOpcional();
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-end gap-1 overflow-hidden border-b border-border/60 bg-background/80 px-2 backdrop-blur-md md:px-8">
      <BotonCambioTema />
      <SelectorIdioma />
      {acceso && <UsuarioActual acceso={acceso} />}
    </header>
  );
}
