import { Badge } from "@/componentes/ui/badge";
import { metricasBandeja } from "../constantes/metricas-bandeja";

export function ResumenBandeja() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metricasBandeja.map((metrica, indice) => {
        const Icono = metrica.icono;
        return (
          <section
            key={metrica.etiqueta}
            className={`group rounded-2xl border border-border/60 p-5 transition-colors duration-200 hover:border-primary/40 motion-reduce:transition-none ${indice === 0 ? "bg-linear-to-br from-secondary via-card to-card sm:col-span-2" : "bg-card"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-muted-foreground">{metrica.etiqueta}</span>
              <Icono
                aria-hidden="true"
                className={`size-4 ${indice === 0 ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <strong className="text-3xl font-semibold tracking-tight tabular-nums">
                {metrica.valor}
              </strong>
              {indice === 0 && (
                <Badge variant="secondary" className="border border-primary/15">
                  Prioridad del equipo
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{metrica.descripcion}</p>
          </section>
        );
      })}
    </div>
  );
}
