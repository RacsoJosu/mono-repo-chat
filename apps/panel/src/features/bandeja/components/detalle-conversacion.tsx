import type { Conversacion } from "@chatbot-whatsapp/compartido";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/componentes/ui/button";
export function DetalleConversacion({ conversacion }: { conversacion: Conversacion }) {
  return (
    <section className="flex min-h-0 w-full flex-col">
      <header className="flex items-center gap-3 border-b border-border/60 p-4">
        <Button asChild size="icon" variant="ghost">
          <Link to="/bandeja" search={(anterior) => anterior} aria-label="Volver a los chats">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {conversacion.contacto.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">{conversacion.contacto.telefono}</p>
        </div>
      </header>
      <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-10">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Última actividad
          </p>
          <p className="mt-2 text-sm">
            {new Date(conversacion.ultimaActividad).toLocaleString("es")}
          </p>
        </div>
        <div className="max-w-xl">
          <h2 className="text-sm font-medium text-muted-foreground">Último resumen</h2>
          <p className="mt-3 leading-relaxed">
            {conversacion.resumenUltimoMensaje ?? "Sin resumen disponible"}
          </p>
        </div>
        <div className="max-w-xl border-t border-border/60 pt-6">
          <h2 className="text-sm font-medium">Canal de WhatsApp</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {conversacion.canal.nombre} · {conversacion.canal.telefono}
          </p>
        </div>
        <p className="flex max-w-xl items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="size-4 shrink-0" />
          El historial de mensajes todavía no está disponible.
        </p>
      </div>
    </section>
  );
}
