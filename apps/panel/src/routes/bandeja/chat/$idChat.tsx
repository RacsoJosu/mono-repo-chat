import { createFileRoute, notFound } from "@tanstack/react-router";
import { ErrorRuta } from "@/componentes/errores/error-ruta";
import { RecursoNoEncontrado } from "@/componentes/errores/recurso-no-encontrado";
import { PanelConversacion } from "@/features/bandeja/components/panel-conversacion";
import { validarParametrosChat } from "@/features/bandeja/validaciones/parametros-chat";
import { ErrorApi } from "@/lib/cliente-api/error-api";

export const Route = createFileRoute("/bandeja/chat/$idChat")({
  params: { parse: validarParametrosChat },
  loader: async ({ params, context }) => {
    try {
      const conversacion = await context.servicioBandeja.obtenerConversacion(params.idChat);
      if (!conversacion) throw notFound();
      return conversacion;
    } catch (error) {
      if (error instanceof ErrorApi && error.estadoHttp === 404) throw notFound();
      throw error;
    }
  },
  notFoundComponent: RecursoNoEncontrado,
  errorComponent: ErrorRuta,
  component: PantallaChat,
});
function PantallaChat() {
  const conversacion = Route.useLoaderData();
  const { servicioBandeja } = Route.useRouteContext();
  return (
    <PanelConversacion
      key={conversacion.id}
      conversacion={conversacion}
      servicio={servicioBandeja}
    />
  );
}
