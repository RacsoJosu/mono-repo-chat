import { Bot } from "lucide-react";
import { PantallaError } from "@/componentes/errores/pantalla-error";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { useMensajesChat } from "../hooks/bandeja.query";
import { useScrollMensajes } from "../hooks/usar-scroll-mensajes";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";

export function MensajesChat({ id, servicio }: { id: string; servicio: ServicioBandeja }) {
  const consulta = useMensajesChat(servicio, id);
  const mensajes = [...(consulta.data?.pages ?? [])].reverse().flatMap((pagina) => pagina.mensajes);
  const { contenedor, cargar, alDesplazar } = useScrollMensajes(
    mensajes.length,
    () => consulta.fetchNextPage(),
    !!consulta.hasNextPage && !consulta.isFetching,
  );
  return (
    <section
      ref={contenedor}
      onScroll={consulta.isFetchNextPageError ? undefined : alDesplazar}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Región con scroll operable por teclado.
      tabIndex={0}
      aria-label="Mensajes de la conversación"
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [overflow-anchor:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8"
    >
      {consulta.isPending && (
        <div role="status" aria-label="Cargando mensajes" className="space-y-4">
          <Skeleton className="h-20 w-2/3 motion-reduce:animate-none" />
          <Skeleton className="ml-auto h-16 w-1/2 motion-reduce:animate-none" />
        </div>
      )}
      {consulta.isError && mensajes.length === 0 && (
        <PantallaError error={consulta.error} reintentar={() => void consulta.refetch()} />
      )}
      {mensajes.length > 0 && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex h-9 items-center justify-center">
            {consulta.isFetchNextPageError ? (
              <div role="alert" className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>No se pudo cargar el historial.</span>
                <Button variant="outline" onClick={() => void cargar()}>
                  Reintentar historial
                </Button>
              </div>
            ) : consulta.hasNextPage ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={consulta.isFetchingNextPage}
                onClick={() => void cargar()}
              >
                {consulta.isFetchingNextPage ? "Cargando…" : "Cargar mensajes anteriores"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Inicio de la conversación</p>
            )}
          </div>
          <ol className="space-y-4">
            {mensajes.map((mensaje) => (
              <li
                key={mensaje.id}
                data-mensaje-id={mensaje.id}
                className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${mensaje.autor === "contacto" ? "rounded-tl-sm bg-muted text-foreground" : mensaje.autor === "bot" ? "ml-auto rounded-tr-sm bg-accent text-accent-foreground" : "ml-auto rounded-tr-sm bg-secondary text-secondary-foreground"}`}
              >
                {mensaje.autor === "bot" && (
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <Bot className="size-3" />
                    Hilo
                  </span>
                )}
                <p>{mensaje.texto}</p>
                <time dateTime={mensaje.fecha} className="mt-1 block text-right text-[11px]">
                  {new Date(mensaje.fecha).toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })}
                </time>
              </li>
            ))}
          </ol>
        </div>
      )}
      {consulta.isSuccess && mensajes.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no hay mensajes en este chat.
        </p>
      )}
    </section>
  );
}
