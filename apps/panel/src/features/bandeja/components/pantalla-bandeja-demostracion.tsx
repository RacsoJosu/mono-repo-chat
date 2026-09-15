import { ChevronsDown, ChevronsUp, MessageCircleMore } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/componentes/ui/collapsible";
import { ListaConversaciones } from "./lista-conversaciones";
import { PanelContextoConversacion } from "./panel-contexto-conversacion";
import { PanelConversacion } from "./panel-conversacion";
import { ResumenBandeja } from "./resumen-bandeja";

export function PantallaBandejaDemostracion() {
  const [resumenAbierto, establecerResumenAbierto] = useState(true);

  return (
    <section className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-[96rem] flex-col gap-5">
      <Collapsible open={resumenAbierto} onOpenChange={establecerResumenAbierto}>
        <header
          className={`flex justify-between gap-4 rounded-3xl border border-border/60 bg-linear-to-br from-accent/60 via-card to-secondary/40 text-foreground ${resumenAbierto ? "flex-col p-5 sm:flex-row sm:items-end sm:p-7" : "items-center px-5 py-3"}`}
        >
          <div>
            {resumenAbierto && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground">
                Centro vivo
              </p>
            )}
            <h1
              className={`${resumenAbierto ? "mt-3 text-3xl sm:text-4xl" : "text-lg"} font-semibold tracking-tight`}
            >
              Bandeja de Hilo
            </h1>
            {resumenAbierto && (
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Cada conversación conserva su contexto.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 border border-primary/15 px-3 py-1.5 text-xs"
            >
              <MessageCircleMore className="size-4" />
              12 por atender
            </Badge>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                aria-label={resumenAbierto ? "Activar modo enfoque" : "Mostrar resumen"}
                className="rounded-xl border border-border/60 bg-card/70 text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {resumenAbierto ? <ChevronsUp /> : <ChevronsDown />}
                <span className="hidden sm:inline">
                  {resumenAbierto ? "Modo enfoque" : "Mostrar resumen"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </header>

        <CollapsibleContent className="pt-5">
          <ResumenBandeja />
        </CollapsibleContent>
      </Collapsible>

      <div
        className={`flex flex-col items-stretch gap-4 xl:flex-row ${resumenAbierto ? "" : "min-h-0 flex-1"}`}
      >
        <div className="shrink-0 xl:w-80">
          <ListaConversaciones />
        </div>

        <div className="min-w-0 flex-1">
          <PanelConversacion ocuparAlturaDisponible={!resumenAbierto} />
        </div>

        <div className="shrink-0 xl:w-72">
          <PanelContextoConversacion />
        </div>
      </div>
    </section>
  );
}
