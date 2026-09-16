import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  defaultStringifySearch,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { ErrorRuta } from "@/componentes/errores/error-ruta";
import { PaginaNoEncontrada } from "@/componentes/errores/pagina-no-encontrada";
import { RecursoNoEncontrado } from "@/componentes/errores/recurso-no-encontrado";
import { LayoutPanel } from "@/componentes/layout/layout-panel";
import { LayoutBandeja } from "@/features/bandeja/pruebas/demostracion/components/layout-bandeja";
import { PanelConversacion } from "@/features/bandeja/pruebas/demostracion/components/panel-conversacion";
import { useConversacionChat } from "@/features/bandeja/pruebas/demostracion/hooks/bandeja.query";
import type { ServicioBandeja } from "@/features/bandeja/pruebas/demostracion/tipos/servicio-bandeja";
import { opcionesConversacionChat } from "@/features/bandeja/pruebas/demostracion/utils/bandeja.query-options";
import { validarBusquedaBandeja } from "@/features/bandeja/pruebas/demostracion/validaciones/busqueda-bandeja";
import { validarParametrosChat } from "../validaciones/parametros-chat";

const raiz = createRootRouteWithContext<{
  queryClient: QueryClient;
  servicioBandeja: ServicioBandeja;
}>()({ component: LayoutPanel, errorComponent: ErrorRuta, notFoundComponent: PaginaNoEncontrada });
const bandeja = createRoute({
  getParentRoute: () => raiz,
  path: "bandeja",
  validateSearch: validarBusquedaBandeja,
  beforeLoad: ({ location, search }) => {
    const canonica = defaultStringifySearch(validarBusquedaBandeja(search));
    if (location.searchStr !== canonica)
      throw redirect({ href: location.pathname + canonica, replace: true });
  },
  component: LayoutBandeja,
});
const indice = createRoute({
  getParentRoute: () => bandeja,
  path: "/",
  component: () => <p>Selecciona una conversación</p>,
});
const chat = createRoute({
  getParentRoute: () => bandeja,
  path: "chat/$idChat",
  params: { parse: validarParametrosChat },
  loader: async ({ context, params }) => {
    if (
      !(await context.queryClient.ensureQueryData(
        opcionesConversacionChat(context.servicioBandeja, params.idChat),
      ))
    )
      throw notFound();
  },
  notFoundComponent: RecursoNoEncontrado,
  errorComponent: ErrorRuta,
  component: () => {
    const { idChat } = chat.useParams();
    const { servicioBandeja } = chat.useRouteContext() as unknown as {
      servicioBandeja: ServicioBandeja;
    };
    const { data: conversacion } = useConversacionChat(servicioBandeja, idChat);
    if (!conversacion) throw notFound();
    return <PanelConversacion conversacion={conversacion} servicio={servicioBandeja} />;
  },
});
export const arbolDemostracion = raiz.addChildren([bandeja.addChildren([indice, chat])]);
export function crearEnrutadorDemostracion(
  queryClient: QueryClient,
  servicioBandeja: ServicioBandeja,
) {
  return createRouter({ routeTree: arbolDemostracion, context: { queryClient, servicioBandeja } });
}
