import { Outlet } from "@tanstack/react-router";
import { BarraUsuario } from "@/componentes/layout/barra-usuario";
import { NavegacionMovil } from "@/componentes/layout/navegacion-movil";
import { SidebarPanel } from "@/componentes/layout/sidebar-panel";
import { SidebarInset, SidebarProvider } from "@/componentes/ui/sidebar";

export function LayoutPanel() {
  return (
    <SidebarProvider>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <SidebarPanel />

      <SidebarInset className="min-h-svh bg-background pb-20 md:pb-0">
        <BarraUsuario />

        <main id="contenido-principal" className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>

      <NavegacionMovil />
    </SidebarProvider>
  );
}
