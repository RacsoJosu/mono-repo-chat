import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { crearEnrutador } from "@/enrutador";
import { ProveedorTema } from "@/proveedores/proveedor-tema";
import { crearServicioBandejaDemostracion } from "../services/bandeja-demostracion.service";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";
import "@/internacionalizacion/configuracion";

export async function montarBandeja(
  ruta = "/bandeja",
  servicio: ServicioBandeja = crearServicioBandejaDemostracion(),
) {
  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const enrutador = crearEnrutador(clienteConsultas, servicio);
  enrutador.update({
    context: { clienteConsultas, servicioBandeja: servicio },
    history: createMemoryHistory({ initialEntries: [ruta] }),
  });
  await act(async () => {
    await enrutador.load();
  });
  const vista = render(
    <ProveedorTema>
      <TooltipProvider>
        <QueryClientProvider client={clienteConsultas}>
          <RouterProvider router={enrutador} />
        </QueryClientProvider>
      </TooltipProvider>
    </ProveedorTema>,
  );
  return {
    enrutador,
    cerrar: async () => {
      vista.unmount();
      await clienteConsultas.cancelQueries();
      clienteConsultas.clear();
    },
  };
}
