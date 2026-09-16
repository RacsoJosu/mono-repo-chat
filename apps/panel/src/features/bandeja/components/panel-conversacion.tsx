import { Link } from "@tanstack/react-router";
import { ArrowLeft, Info, SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/componentes/ui/sheet";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";
import type { ConversacionDemostracion } from "../tipos/tipos-conversacion-demostracion";
import { InsigniaEstado } from "./insignia-estado";
import { MensajesChat } from "./mensajes-chat";

export function PanelConversacion({
  conversacion,
  servicio,
}: {
  conversacion: ConversacionDemostracion;
  servicio: ServicioBandeja;
}) {
  return (
    <section
      aria-label={`Chat con ${conversacion.nombre}`}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-card"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 py-3">
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link to="/bandeja" search={(anteriores) => anteriores} aria-label="Volver a los chats">
            <ArrowLeft />
          </Link>
        </Button>
        <Avatar className="size-9 shrink-0">
          <AvatarFallback>{conversacion.iniciales}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{conversacion.nombre}</h1>
          <p className="text-xs text-muted-foreground">WhatsApp · Demostración</p>
        </div>
        <span className="hidden sm:block">
          <InsigniaEstado estado={conversacion.estado} />
        </span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Detalles del chat">
              <Info />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{conversacion.nombre}</SheetTitle>
              <SheetDescription>Contexto de la conversación</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4">
              <InsigniaEstado estado={conversacion.estado} />
              <div>
                <h2 className="text-sm font-medium">Último mensaje</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {conversacion.resumen}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Conversación de demostración. La asignación y el envío estarán disponibles al
                conectar el canal.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      <MensajesChat id={conversacion.id} servicio={servicio} />
      <footer className="shrink-0 border-t border-border/60 bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Input
            disabled
            aria-label="Escribir respuesta"
            placeholder="Envío disponible al conectar el canal"
            className="h-11 rounded-xl"
          />
          <Button disabled size="icon" aria-label="Enviar respuesta">
            <SendHorizontal />
          </Button>
        </div>
      </footer>
    </section>
  );
}
