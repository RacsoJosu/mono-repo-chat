import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { usuarioDemostracion } from "@/constantes/usuario-demostracion";
import { BotonCambioTema } from "./boton-cambio-tema";
import { MenuUsuario } from "./menu-usuario";
import { SelectorIdioma } from "./selector-idioma";

export function BarraUsuario() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-end gap-1 border-b border-border/60 bg-background/80 px-4 text-foreground backdrop-blur-md md:px-8">
      <BotonCambioTema />
      <SelectorIdioma />

      <div className="ml-2 flex items-center gap-2 border-l border-sidebar-border pl-3">
        <Avatar className="size-8">
          <AvatarFallback>{usuarioDemostracion.iniciales}</AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-medium">{usuarioDemostracion.nombre}</span>
          <span className="block text-xs text-sidebar-foreground/75">
            {usuarioDemostracion.rol}
          </span>
        </span>
        <MenuUsuario />
      </div>
    </header>
  );
}
