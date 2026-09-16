import { createFileRoute } from "@tanstack/react-router";
import { ErrorRuta } from "@/componentes/errores/error-ruta";
import { RecursoNoEncontrado } from "@/componentes/errores/recurso-no-encontrado";
import { DetalleConversacion } from "@/features/bandeja/components/detalle-conversacion";
import { useDetalleConversacion } from "@/features/bandeja/hooks/conversaciones.query";
import { opcionesDetalleConversacion } from "@/features/bandeja/utils/conversaciones.query-options";
import { validarParametrosChat } from "@/features/bandeja/validaciones/parametros-chat";
export const Route = createFileRoute("/bandeja/chat/$idChat")({
  params: { parse: validarParametrosChat },
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      opcionesDetalleConversacion(context.servicioBandeja, params.idChat),
    ),
  notFoundComponent: RecursoNoEncontrado,
  errorComponent: ErrorRuta,
  component: PantallaChat,
});
function PantallaChat() {
  const { idChat } = Route.useParams();
  const { servicioBandeja } = Route.useRouteContext();
  const { data } = useDetalleConversacion(servicioBandeja, idChat);
  return <DetalleConversacion conversacion={data} />;
}
