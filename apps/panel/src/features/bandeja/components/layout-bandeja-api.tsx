import { Outlet, useRouteContext, useRouterState } from "@tanstack/react-router";
import { ListaConversacionesApi } from "./lista-conversaciones-api";
export function LayoutBandejaApi() {
  const { servicioBandeja } = useRouteContext({ from: "__root__" });
  const abierto = useRouterState({
    select: (estado) => estado.location.pathname.startsWith("/bandeja/chat/"),
  });
  return (
    <div className="flex h-full min-h-0 min-w-0 overflow-hidden bg-card">
      <aside
        aria-label="Lista de chats"
        className={`min-h-0 w-full shrink-0 border-r border-border/60 md:w-80 xl:w-96 ${abierto ? "hidden md:flex" : "flex"}`}
      >
        <ListaConversacionesApi servicio={servicioBandeja} />
      </aside>
      <div className={`min-h-0 min-w-0 flex-1 ${abierto ? "flex" : "hidden md:flex"}`}>
        <Outlet />
      </div>
    </div>
  );
}
