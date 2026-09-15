import { CircleAlert, Clock3, MessagesSquare } from "lucide-react";
import { Badge } from "@/componentes/ui/badge";

const metricasBandeja = [
  { etiqueta: "Por atender", valor: "12", descripcion: "4 requieren asesor", icono: CircleAlert },
  { etiqueta: "Tiempo medio", valor: "3 min", descripcion: "-18 % esta semana", icono: Clock3 },
  { etiqueta: "Resueltas hoy", valor: "48", descripcion: "92 % por el bot", icono: MessagesSquare },
] as const;

export function ResumenBandeja() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metricasBandeja.map((metrica, indice) => {
        const Icono = metrica.icono;

        return (
          <div key={metrica.etiqueta} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-medium text-muted-foreground">{metrica.etiqueta}</span>
              <span className="grid size-8 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <Icono className="size-4" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <strong className="text-2xl font-semibold tracking-tight">{metrica.valor}</strong>
              {indice === 0 && <Badge variant="secondary">Ahora</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{metrica.descripcion}</p>
          </div>
        );
      })}
    </div>
  );
}
