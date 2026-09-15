import { Bot, MoreHorizontal, Paperclip, SendHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { conversacionesDemostracion } from "../constantes/conversaciones-demostracion";
import { InsigniaEstado } from "./insignia-estado";

export function PanelConversacion({
  ocuparAlturaDisponible = false,
}: {
  ocuparAlturaDisponible?: boolean;
}) {
  const conversacion = conversacionesDemostracion[0];

  return (
    <section
      className={`flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm ${ocuparAlturaDisponible ? "h-full min-h-0" : "min-h-[38rem]"}`}
    >
      <header className="flex items-center gap-3 border-b px-5 py-4">
        <Avatar className="size-10">
          <AvatarFallback>{conversacion.iniciales}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">{conversacion.nombre}</h2>
          <p className="text-sm text-muted-foreground">+504 9876-4321 · Cliente desde 2025</p>
        </div>
        <InsigniaEstado estado={conversacion.estado} />
        <Button variant="ghost" size="icon" aria-label="Más acciones de la conversación">
          <MoreHorizontal />
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-background/55 p-5">
        <p className="mx-auto rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Hoy · 10:36
        </p>
        <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-card p-3 text-sm shadow-sm ring-1 ring-border/60">
          Hola Andrea, soy Hilo. ¿En qué puedo ayudarte hoy?
        </div>
        <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-secondary p-3 text-sm text-secondary-foreground">
          Quisiera conocer el estado de mi solicitud.
        </div>
        <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-accent p-3 text-sm text-accent-foreground">
          Puedo ayudarte con eso. ¿Quieres que te conecte con un asesor?
          <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
            <Bot className="size-3" /> Hilo · Asistente automático
          </span>
        </div>
        <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-secondary p-3 text-sm text-secondary-foreground">
          Sí, por favor.
        </div>
      </div>

      <footer className="border-t bg-card p-4">
        <div className="flex items-center gap-2 rounded-2xl border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
          <Button variant="ghost" size="icon" aria-label="Adjuntar archivo">
            <Paperclip />
          </Button>
          <Input
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            placeholder="Escribe una respuesta"
          />
          <Button size="icon" aria-label="Enviar respuesta">
            <SendHorizontal />
          </Button>
        </div>
      </footer>
    </section>
  );
}
