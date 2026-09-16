import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { crearEnrutador } from "@/enrutador";
import { ProveedorConsultas } from "@/proveedores/proveedor-consultas";
import { ProveedorTema } from "@/proveedores/proveedor-tema";
import { crearServicioBandejaDemostracion } from "../services/bandeja-demostracion.service";
import type { ServicioBandeja } from "../tipos/servicio-bandeja";
import "@/internacionalizacion/configuracion";

export async function montarBandeja(
  ruta = "/bandeja",
  servicio: ServicioBandeja = crearServicioBandejaDemostracion(),
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const enrutador = crearEnrutador(queryClient, servicio);
  enrutador.update({
    context: { queryClient, servicioBandeja: servicio },
    history: createMemoryHistory({ initialEntries: [ruta] }),
  });
  await act(async () => {
    await enrutador.load();
  });
  const vista = render(
    <ProveedorTema>
      <TooltipProvider>
        <ProveedorConsultas queryClient={queryClient}>
          <RouterProvider router={enrutador} />
        </ProveedorConsultas>
      </TooltipProvider>
    </ProveedorTema>,
  );
  return {
    enrutador,
    queryClient: queryClient,
    cerrar: async () => {
      vista.unmount();
      await queryClient.cancelQueries();
      queryClient.clear();
    },
  };
}
