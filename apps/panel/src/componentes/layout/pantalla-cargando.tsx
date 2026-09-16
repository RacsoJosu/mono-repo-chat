import { Skeleton } from "@/componentes/ui/skeleton";

export function PantallaCargando() {
  return (
    <section
      aria-busy="true"
      aria-label="Cargando pantalla"
      className="mx-auto max-w-5xl space-y-6 p-6"
    >
      <span className="sr-only" role="status">
        Cargando pantalla…
      </span>
      <Skeleton className="h-4 w-28 motion-reduce:animate-none" />
      <Skeleton className="h-10 w-2/3 max-w-md motion-reduce:animate-none" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl motion-reduce:animate-none sm:col-span-2" />
        <Skeleton className="h-64 rounded-2xl motion-reduce:animate-none" />
      </div>
    </section>
  );
}
