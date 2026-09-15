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
          className={`flex justify-between gap-4 rounded-3xl bg-sidebar text-sidebar-foreground ${resumenAbierto ? "flex-col p-5 sm:flex-row sm:items-end sm:p-7" : "items-center px-5 py-3"}`}
        >
          <div>
            {resumenAbierto && (
              <p className="text-sm font-medium text-sidebar-foreground/70">Centro vivo</p>
            )}
            <h1
              className={`${resumenAbierto ? "mt-1 text-3xl" : "text-lg"} font-semibold tracking-tight`}
            >
              Bandeja de Hilo
            </h1>
            {resumenAbierto && (
              <p className="mt-2 text-sidebar-foreground/75">
                Cada conversación conserva su contexto.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
              <MessageCircleMore className="size-4" />
              12 por atender
            </Badge>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
