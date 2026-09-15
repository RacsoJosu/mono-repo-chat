import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/componentes/ui/avatar";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { conversacionesDemostracion } from "../constantes/conversaciones-demostracion";
import type { ConversacionDemostracion } from "../tipos/tipos-conversacion-demostracion";
import { InsigniaEstado } from "./insignia-estado";

function FilaConversacion({
  conversacion,
  seleccionada,
}: {
  conversacion: ConversacionDemostracion;
  seleccionada: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className={`h-auto w-full items-start justify-start gap-3 rounded-2xl border px-3 py-4 text-left transition-colors duration-200 motion-reduce:transition-none hover:bg-accent ${seleccionada ? "border-primary/40 bg-secondary hover:bg-secondary" : "border-transparent"}`}
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
  const [busqueda, establecerBusqueda] = useState("");
  const [soloPendientes, establecerSoloPendientes] = useState(false);
  const consulta = busqueda.trim().toLocaleLowerCase("es");
  const conversacionesVisibles = conversacionesDemostracion.filter(
    (conversacion) =>
      (!soloPendientes || conversacion.estado === "pendiente") &&
      `${conversacion.nombre} ${conversacion.resumen}`.toLocaleLowerCase("es").includes(consulta),
  );
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-3">
      <header className="p-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Cola activa
            </p>
            <h2 className="mt-1 text-lg font-semibold">Conversaciones</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mostrar solo conversaciones pendientes"
            aria-pressed={soloPendientes}
            onClick={() => establecerSoloPendientes(!soloPendientes)}
            className={
              soloPendientes ? "rounded-xl bg-accent text-accent-foreground" : "rounded-xl"
            }
          >
            <SlidersHorizontal />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(evento) => establecerBusqueda(evento.target.value)}
            aria-label="Buscar conversaciones"
            className="h-10 rounded-xl border-input/60 bg-background/60 pl-9 shadow-none"
            placeholder="Buscar conversaciones…"
          />
        </div>
      </header>

      <div className="mt-2 space-y-1">
        <p role="status" className="px-2 py-2 text-xs text-muted-foreground">
          {conversacionesVisibles.length} conversaciones{soloPendientes ? " pendientes" : ""}
        </p>
        {conversacionesVisibles.length === 0 && (
          <div className="px-4 py-10 text-center">
            <SearchX aria-hidden="true" className="mx-auto mb-3 size-6 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sin coincidencias</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Prueba con otro nombre o cambia los filtros.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => {
                establecerBusqueda("");
                establecerSoloPendientes(false);
              }}
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}
        {conversacionesVisibles.map((conversacion) => (
          <FilaConversacion
            key={conversacion.id}
            conversacion={conversacion}
            seleccionada={conversacion.id === conversacionesDemostracion[0]?.id}
          />
        ))}
      </div>
    </section>
  );
}
