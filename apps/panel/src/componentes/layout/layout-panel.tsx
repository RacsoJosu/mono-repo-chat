import { Outlet, useRouterState } from "@tanstack/react-router";
import { BarraUsuario } from "@/componentes/layout/barra-usuario";
import { NavegacionMovil } from "@/componentes/layout/navegacion-movil";
import { SidebarPanel } from "@/componentes/layout/sidebar-panel";
import { SidebarInset, SidebarProvider } from "@/componentes/ui/sidebar";

export function LayoutPanel() {
  const esBandeja = useRouterState({
    select: (estado) => estado.location.pathname.startsWith("/bandeja"),
  });
  const esChat = useRouterState({
    select: (estado) => estado.location.pathname.startsWith("/bandeja/chat/"),
  });
  return (
    <SidebarProvider className={esBandeja ? "h-dvh min-h-0 overflow-hidden" : ""}>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <SidebarPanel />

      <SidebarInset
        className={
          esBandeja
            ? `h-dvh min-h-0 overflow-hidden bg-background ${esChat ? "" : "pb-20 md:pb-0"}`
            : "min-h-svh bg-background pb-20 md:pb-0"
        }
      >
        <BarraUsuario />

        <main
          id="contenido-principal"
          className={
            esBandeja
              ? "min-h-0 min-w-0 flex-1 overflow-hidden"
              : "min-w-0 flex-1 p-4 md:p-6 lg:p-8"
          }
        >
          <Outlet />
        </main>
      </SidebarInset>

      {!esChat && <NavegacionMovil />}
    </SidebarProvider>
  );
}
