import type { Conversacion } from "@chatbot-whatsapp/compartido";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Button } from "@/componentes/ui/button";
export function FilaConversacionApi({
  conversacion,
  seleccionada,
}: {
  conversacion: Conversacion;
  seleccionada: boolean;
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={`h-auto w-full justify-start gap-3 rounded-none border-b border-l-2 border-border/60 p-4 text-left transition-colors ${seleccionada ? "border-l-primary bg-secondary" : "border-l-transparent"}`}
    >
      <Link
        to="/bandeja/chat/$idChat"
        params={{ idChat: conversacion.id }}
        search={(anterior) => anterior}
        aria-current={seleccionada ? "page" : undefined}
      >
        <Avatar>
          <AvatarFallback>
            {conversacion.contacto.nombre
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="flex justify-between gap-2">
            <span className="truncate font-semibold">{conversacion.contacto.nombre}</span>
            <time
              className="text-xs font-normal text-muted-foreground"
              dateTime={conversacion.ultimaActividad}
            >
              {new Date(conversacion.ultimaActividad).toLocaleDateString("es", {
                day: "numeric",
                month: "short",
              })}
            </time>
          </span>
          <span className="mt-1 block truncate text-sm font-normal text-muted-foreground">
            {conversacion.resumenUltimoMensaje ?? "Sin resumen disponible"}
          </span>
        </span>
      </Link>
    </Button>
  );
}
