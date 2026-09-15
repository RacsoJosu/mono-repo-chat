import { Bot, Headphones, Sparkles } from "lucide-react";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";

export function PanelContextoConversacion() {
  return (
    <aside className="space-y-3">
      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Siguiente paso
        </p>
        <h2 className="mt-2 text-lg font-semibold">Tomar conversación</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Andrea pidió atención humana después de completar el flujo del bot.
        </p>
        <Button className="mt-5 w-full">
          <Headphones />
          Asignarme
        </Button>
      </section>

      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Contexto</h2>
          <Badge variant="outline">Nuevo</Badge>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Origen</dt>
            <dd className="font-medium">WhatsApp</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Flujo</dt>
            <dd className="font-medium">Estado de solicitud</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Asesor</dt>
            <dd className="font-medium">Sin asignar</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl bg-sidebar p-5 text-sidebar-foreground">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-4" /> Resumen de Hilo
        </div>
        <p className="mt-3 text-sm leading-6 text-sidebar-foreground/75">
          El bot verificó la intención y derivó la conversación al equipo correcto.
        </p>
        <span className="mt-4 flex items-center gap-1.5 text-xs font-medium text-sidebar-foreground/75">
          <Bot className="size-3" /> Actualizado hace un minuto
        </span>
      </section>
    </aside>
  );
}
