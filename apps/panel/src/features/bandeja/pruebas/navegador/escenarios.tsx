import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { crearEnrutador } from "@/enrutador";
import { crearServicioBandejaDemostracion } from "@/features/bandeja/services/bandeja-demostracion.service";
import { normalizarErrorApi } from "@/lib/cliente-api/normalizar-error-api";
import { ProveedorTema } from "@/proveedores/proveedor-tema";
import "@/internacionalizacion/configuracion";
import "@/styles.css";

const escenario = new URLSearchParams(location.search).get("escenario");
let fallar = true;
const original = crearServicioBandejaDemostracion();
const clienteConsultas = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const servicio = {
  ...original,
  async obtenerConversacion(idChat: string) {
    if (fallar && ["400", "404", "500", "cliente"].includes(escenario ?? "")) {
      fallar = false;
      if (escenario === "cliente") throw new Error("SQL secreto");
      throw normalizarErrorApi(Number(escenario), {
        error: { code: "PRUEBA", message: "SQL secreto", details: [], requestId: "solicitud-123" },
      });
    }
    return original.obtenerConversacion(idChat);
  },
  async obtenerMensajes(entrada: Parameters<typeof original.obtenerMensajes>[0]) {
    if (fallar && (escenario === "consulta" || (escenario === "historial" && entrada.cursor))) {
      fallar = false;
      throw normalizarErrorApi(500, {});
    }
    return original.obtenerMensajes(entrada);
  },
};
const enrutador = crearEnrutador(clienteConsultas, servicio);
enrutador.update({
  context: { clienteConsultas, servicioBandeja: servicio },
  history: createMemoryHistory({
    initialEntries: ["/bandeja/chat/01994bd0-1234-7000-8000-000000000001"],
  }),
});
const elementoRaiz = document.getElementById("raiz");
if (!elementoRaiz) throw new Error("Falta la raíz de pruebas.");
createRoot(elementoRaiz).render(
  <ProveedorTema>
    <TooltipProvider>
      <QueryClientProvider client={clienteConsultas}>
        <RouterProvider router={enrutador} />
      </QueryClientProvider>
    </TooltipProvider>
  </ProveedorTema>,
);
