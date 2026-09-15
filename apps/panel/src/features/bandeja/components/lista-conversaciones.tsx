import { Search, SlidersHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { conversacionesDemostracion } from "../constantes/conversaciones-demostracion";
import type { ConversacionDemostracion } from "../tipos/tipos-conversacion-demostracion";
import { InsigniaEstado } from "./insignia-estado";

function ItemConversacion({
  conversacion,
  seleccionada,
}: {
  conversacion: ConversacionDemostracion;
  seleccionada: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className={`h-auto w-full items-start justify-start gap-3 rounded-2xl border px-3 py-3 text-left hover:bg-accent ${seleccionada ? "border-primary bg-secondary hover:bg-secondary" : "border-transparent"}`}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarFallback>{conversacion.iniciales}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{conversacion.nombre}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{conversacion.hora}</span>
        </span>
        <span className="mt-1 block truncate text-sm font-normal text-muted-foreground">
          {conversacion.resumen}
        </span>
        <span className="mt-2 flex items-center justify-between gap-2">
          <InsigniaEstado estado={conversacion.estado} />
          {conversacion.mensajesSinLeer > 0 && (
            <Badge className="min-w-5 justify-center rounded-full px-1.5">
              {conversacion.mensajesSinLeer}
            </Badge>
          )}
        </span>
      </span>
    </Button>
  );
}

export function ListaConversaciones() {
  return (
    <section className="rounded-3xl border bg-card p-3 shadow-sm">
      <header className="p-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Cola activa
            </p>
            <h2 className="mt-1 text-lg font-semibold">Conversaciones</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Filtrar conversaciones">
            <SlidersHorizontal />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="rounded-xl border-0 bg-muted pl-9 shadow-none" placeholder="Buscar" />
        </div>
      </header>

      <div className="mt-2 space-y-1">
        {conversacionesDemostracion.map((conversacion, indice) => (
          <ItemConversacion
            key={conversacion.id}
            conversacion={conversacion}
            seleccionada={indice === 0}
          />
        ))}
      </div>
    </section>
  );
}
