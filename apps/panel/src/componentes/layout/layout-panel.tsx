import { Outlet } from "@tanstack/react-router";
import { BarraUsuario } from "@/componentes/layout/barra-usuario";
import { NavegacionMovil } from "@/componentes/layout/navegacion-movil";
import { SidebarPanel } from "@/componentes/layout/sidebar-panel";
import { SidebarInset, SidebarProvider } from "@/componentes/ui/sidebar";

export function LayoutPanel() {
  return (
    <SidebarProvider>
      <SidebarPanel />

      <SidebarInset className="min-h-svh bg-background pb-20 md:pb-0">
        <BarraUsuario />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>

      <NavegacionMovil />
    </SidebarProvider>
  );
}
