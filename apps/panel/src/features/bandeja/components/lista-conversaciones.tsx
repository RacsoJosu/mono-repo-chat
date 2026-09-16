import { Link, useRouterState } from "@tanstack/react-router";
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
      asChild
      variant="ghost"
      className={`h-auto w-full items-start justify-start gap-3 rounded-none border-b border-l-2 border-border/60 px-4 py-4 text-left transition-colors duration-200 motion-reduce:transition-none hover:bg-accent ${seleccionada ? "border-l-primary bg-secondary hover:bg-secondary" : "border-l-transparent"}`}
    >
      <Link
        to="/bandeja/chat/$id"
        params={{ id: conversacion.id }}
        aria-current={seleccionada ? "page" : undefined}
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
      </Link>
    </Button>
  );
}

export function ListaConversaciones() {
  const rutaActual = useRouterState({ select: (estado) => estado.location.pathname });
  const [busqueda, establecerBusqueda] = useState("");
  const [soloPendientes, establecerSoloPendientes] = useState(false);
  const consulta = busqueda.trim().toLocaleLowerCase("es");
  const conversacionesVisibles = conversacionesDemostracion.filter(
    (conversacion) =>
      (!soloPendientes || conversacion.estado === "pendiente") &&
      `${conversacion.nombre} ${conversacion.resumen}`.toLocaleLowerCase("es").includes(consulta),
  );
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-card">
      <header className="shrink-0 border-b border-border/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Bandeja</h2>
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

      <div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto overscroll-contain">
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
            seleccionada={rutaActual === `/bandeja/chat/${conversacion.id}`}
          />
        ))}
      </div>
    </section>
  );
}
