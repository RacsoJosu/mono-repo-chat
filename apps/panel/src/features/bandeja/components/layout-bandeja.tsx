import { Outlet, useRouterState } from "@tanstack/react-router";
import { ListaConversaciones } from "./lista-conversaciones";

export function LayoutBandeja() {
  const chatAbierto = useRouterState({
    select: (estado) => estado.location.pathname.startsWith("/bandeja/chat/"),
  });
  return (
    <div className="flex h-full min-h-0 min-w-0 overflow-hidden bg-card">
      <aside
        aria-label="Lista de chats"
        className={`min-h-0 w-full shrink-0 border-r border-border/60 md:w-72 xl:w-80 ${chatAbierto ? "hidden md:flex" : "flex"}`}
      >
        <ListaConversaciones />
      </aside>
      <div className={`min-h-0 min-w-0 flex-1 ${chatAbierto ? "flex" : "hidden md:flex"}`}>
        <Outlet />
      </div>
    </div>
  );
}
