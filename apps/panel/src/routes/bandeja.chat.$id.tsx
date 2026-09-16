import { createFileRoute, notFound } from "@tanstack/react-router";
import { PanelConversacion } from "@/features/bandeja/components/panel-conversacion";
export const Route = createFileRoute("/bandeja/chat/$id")({
  loader: async ({ params, context }) => {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(params.id)) throw notFound();
    const conversacion = await context.servicioBandeja.obtenerConversacion(params.id);
    if (!conversacion) throw notFound();
    return conversacion;
  },
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
