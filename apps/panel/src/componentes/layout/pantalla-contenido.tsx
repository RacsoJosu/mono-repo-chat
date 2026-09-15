import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent } from "@/componentes/ui/card";

export function PantallaContenido({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <section className="mx-auto max-w-5xl space-y-8 py-3">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground">
          Espacio de trabajo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{titulo}</h1>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{descripcion}</p>
      </header>
      <Card className="overflow-hidden rounded-3xl border-border/60 bg-linear-to-br from-accent/50 via-card to-card shadow-none">
        <CardContent className="flex min-h-80 flex-col items-start justify-center p-6 sm:p-10">
          <span className="mb-6 grid size-12 place-items-center rounded-2xl border border-accent-foreground/15 bg-accent text-accent-foreground">
            <Layers3 aria-hidden="true" className="size-5" />
          </span>
          <Badge variant="outline" className="mb-3 bg-card">
            Próximamente
          </Badge>
          <h2 className="text-xl font-semibold tracking-tight">Todo tendrá su lugar.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Este espacio todavía no está disponible. Puedes continuar atendiendo conversaciones
            desde la bandeja.
          </p>
          <Button asChild variant="outline" className="mt-7 rounded-xl">
            <Link to="/">
              Volver a la bandeja
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
