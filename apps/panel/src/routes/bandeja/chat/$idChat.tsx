import { createFileRoute, notFound } from "@tanstack/react-router";
import { ErrorRuta } from "@/componentes/errores/error-ruta";
import { RecursoNoEncontrado } from "@/componentes/errores/recurso-no-encontrado";
import { PanelConversacion } from "@/features/bandeja/components/panel-conversacion";
import { useConversacionChat } from "@/features/bandeja/hooks/bandeja.query";
import { opcionesConversacionChat } from "@/features/bandeja/utils/bandeja.query-options";
import { validarParametrosChat } from "@/features/bandeja/validaciones/parametros-chat";

export const Route = createFileRoute("/bandeja/chat/$idChat")({
  params: { parse: validarParametrosChat },
  loader: async ({ params, context }) => {
    const conversacion = await context.queryClient.ensureQueryData(
      opcionesConversacionChat(context.servicioBandeja, params.idChat),
    );
    if (!conversacion) throw notFound();
  },
  notFoundComponent: RecursoNoEncontrado,
  errorComponent: ErrorRuta,
  component: PantallaChat,
});
function PantallaChat() {
  const { idChat } = Route.useParams();
  const { servicioBandeja } = Route.useRouteContext();
  const { data: conversacion } = useConversacionChat(servicioBandeja, idChat);
  if (!conversacion) throw notFound();
  return <PanelConversacion key={idChat} conversacion={conversacion} servicio={servicioBandeja} />;
}
