import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircleMore } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/componentes/ui/sidebar";
import { navegacionPanel } from "@/constantes/navegacion-panel";

export function SidebarPanel() {
  const { t } = useTranslation();
  const rutaActual = useRouterState({ select: (estado) => estado.location.pathname });

  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <MessageCircleMore className="size-4" />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-none">Hilo</span>
            <span className="mt-1 block text-xs text-sidebar-foreground/70">Centro vivo</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navegacionPanel.map((opcion) => {
            const Icono = opcion.icono;
            const activa = rutaActual === opcion.ruta;

            return (
              <SidebarMenuItem key={opcion.clave}>
                <SidebarMenuButton
                  asChild
                  isActive={activa}
                  tooltip={t(`navegacion.${opcion.clave}`)}
                >
                  <Link to={opcion.ruta}>
                    <Icono />
                    <span>{t(`navegacion.${opcion.clave}`)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
