import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Skeleton } from "@/componentes/ui/skeleton";
import { useListaConversaciones } from "../hooks/conversaciones.query";
import type { ServicioBandejaApi } from "../tipos/servicio-bandeja-api";
import { FilaConversacionApi } from "./fila-conversacion";
export function ListaConversacionesApi({ servicio }: { servicio: ServicioBandejaApi }) {
  const { busqueda = "" } = useSearch({ from: "/bandeja" });
  const navegar = useNavigate();
  const ruta = useRouterState({ select: (estado) => estado.location.pathname });
  const [consulta, setConsulta] = useState(busqueda);
  const scroll = useRef<HTMLElement>(null);
  const final = useRef<HTMLDivElement>(null);
  const filtrosAnteriores = useRef({ busqueda, empresa: servicio.idEmpresa });
  const listado = useListaConversaciones(servicio, busqueda);
  useEffect(() => {
    setConsulta(busqueda);
  }, [busqueda]);
  useEffect(() => {
    if (consulta === busqueda) return;
    const temporizador = setTimeout(
      () =>
        void navegar({
          to: ".",
          search: consulta ? { busqueda: consulta } : {},
          replace: true,
          resetScroll: false,
        }),
      300,
    );
    return () => clearTimeout(temporizador);
  }, [consulta, busqueda, navegar]);
  useEffect(() => {
    if (
      scroll.current &&
      (filtrosAnteriores.current.busqueda !== busqueda ||
        filtrosAnteriores.current.empresa !== servicio.idEmpresa)
    )
      scroll.current.scrollTop = 0;
    filtrosAnteriores.current = { busqueda, empresa: servicio.idEmpresa };
  }, [busqueda, servicio.idEmpresa]);
  useEffect(() => {
    if (
      !final.current ||
      !scroll.current ||
      !listado.hasNextPage ||
      listado.isFetchingNextPage ||
      listado.isFetchNextPageError
    )
      return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) void listado.fetchNextPage();
      },
      { root: scroll.current, rootMargin: "120px" },
    );
    observador.observe(final.current);
    return () => observador.disconnect();
  }, [
    listado.hasNextPage,
    listado.isFetchingNextPage,
    listado.isFetchNextPageError,
    listado.fetchNextPage,
  ]);
  const conversaciones = [
    ...new Map(
      listado.data?.pages.flatMap((p) => p.conversaciones).map((c) => [c.id, c]) ?? [],
    ).values(),
  ];
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-card">
      <header className="border-b border-border/60 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Bandeja</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar conversaciones"
            onClick={() => {
              if (scroll.current) scroll.current.scrollTop = 0;
              void listado.actualizar();
            }}
            disabled={listado.isFetching}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Buscar conversaciones"
            placeholder="Nombre, teléfono o resumen…"
            maxLength={100}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />
        </div>
      </header>
      <section
        ref={scroll}
        aria-label="Conversaciones"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {listado.isPending && (
          <div role="status" aria-label="Cargando conversaciones" className="space-y-4 p-4">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-16 w-full" />
            ))}
          </div>
        )}
        {listado.isError && !listado.data && (
          <div role="alert" className="space-y-3 p-4">
            <p>No pudimos cargar las conversaciones.</p>
            <Button
              onClick={() => {
                if (scroll.current) scroll.current.scrollTop = 0;
                void listado.actualizar();
              }}
            >
              Reintentar
            </Button>
          </div>
        )}
        {!listado.isPending && !listado.isError && conversaciones.length === 0 && (
          <div className="space-y-3 px-4 py-10 text-center">
            <h3 className="font-semibold">
              {busqueda ? "Sin coincidencias" : "Aún no hay conversaciones"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {busqueda
                ? "Prueba con otro nombre o teléfono."
                : "Las conversaciones de tu empresa aparecerán aquí."}
            </p>
            {busqueda && (
              <Button variant="outline" onClick={() => setConsulta("")}>
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}
        {conversaciones.map((conversacion) => (
          <FilaConversacionApi
            key={conversacion.id}
            conversacion={conversacion}
            seleccionada={ruta.toLowerCase().endsWith(`/${conversacion.id}`)}
          />
        ))}
        <div ref={final} />
        {listado.isFetchNextPageError && (
          <p role="alert" className="p-4 text-sm">
            No pudimos cargar más conversaciones. Las anteriores siguen disponibles.
          </p>
        )}
        {listado.hasNextPage && (
          <Button
            variant="ghost"
            className="my-2 w-full"
            disabled={listado.isFetchingNextPage}
            onClick={() => void listado.fetchNextPage()}
          >
            {listado.isFetchingNextPage
              ? "Cargando…"
              : listado.isFetchNextPageError
                ? "Reintentar más conversaciones"
                : "Cargar más conversaciones"}
          </Button>
        )}
      </section>
    </section>
  );
}
