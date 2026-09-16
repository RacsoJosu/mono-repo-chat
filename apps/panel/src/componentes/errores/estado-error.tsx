import { Link } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { Button } from "@/componentes/ui/button";

export function EstadoError({
  titulo,
  descripcion,
  referencia,
  reintentar,
}: {
  titulo: string;
  descripcion: string;
  referencia?: string;
  reintentar?: () => void;
}) {
  return (
    <section
      role="alert"
      className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 overflow-auto p-6 text-center"
    >
      <CircleAlert aria-hidden="true" className="size-8 text-accent-foreground" />
      <h1 className="max-w-lg text-xl font-semibold tracking-tight">{titulo}</h1>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">{descripcion}</p>
      {referencia && <p className="text-xs text-muted-foreground">Referencia: {referencia}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {reintentar && <Button onClick={reintentar}>Reintentar</Button>}
        <Button variant="outline" asChild>
          <Link to="/bandeja" search={(anteriores) => anteriores}>
            Volver a la bandeja
          </Link>
        </Button>
      </div>
    </section>
  );
}
