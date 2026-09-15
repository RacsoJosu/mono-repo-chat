import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

function MarcoAplicacion() {
  return <Outlet />;
}

function PantallaInicio() {
  return (
    <main>
      <h1>Panel de conversaciones</h1>
      <p>El panel está listo para recibir conversaciones.</p>
    </main>
  );
}

function PantallaError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Ocurrió un error</h1>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}

const rutaRaiz = createRootRoute({ component: MarcoAplicacion, errorComponent: PantallaError });
const rutaInicio = createRoute({
  getParentRoute: () => rutaRaiz,
  path: "/",
  component: PantallaInicio,
});
const arbolRutas = rutaRaiz.addChildren([rutaInicio]);

export const enrutador = createRouter({ routeTree: arbolRutas });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof enrutador;
  }
}
