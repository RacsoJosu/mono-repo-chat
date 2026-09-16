import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { crearEnrutador } from "./enrutador";
import { crearServicioAcceso } from "./features/acceso/services/acceso-api.service";
import { crearCoordinadorSesion } from "./features/acceso/services/coordinador-sesion";
import { crearCanalSesion } from "./features/acceso/services/sincronizacion-sesion";
import { ProveedorSesion } from "./features/acceso/store/proveedor-sesion";
import { crearStoreSesion } from "./features/acceso/store/sesion.store";
import { crearServicioBandejaApi } from "./features/bandeja/services/bandeja-api.service";
import { crearClienteApi } from "./lib/cliente-api/cliente-api";
import { AplicacionPanel } from "./proveedores/aplicacion-panel";
import { crearQueryClient } from "./proveedores/configuracion-query";
import { ProveedorConsultas } from "./proveedores/proveedor-consultas";
import { ProveedorTema } from "./proveedores/proveedor-tema";
import "./internacionalizacion/configuracion";
import "./styles.css";

const queryClient = crearQueryClient();
const store = crearStoreSesion();
const cliente = crearClienteApi(
  window.fetch.bind(window),
  () => coordinador.expirar(),
  () => store.getState().generacion,
  () => coordinador.seleccionar(null),
);
const servicio = crearServicioAcceso(cliente, (operacion) =>
  navigator.locks.request("hilo:credenciales:v1", operacion),
);
const coordinador = crearCoordinadorSesion({
  store,
  servicio,
  canal: crearCanalSesion(window),
  limpiar: () => {
    void queryClient.cancelQueries();
    queryClient.clear();
  },
});
const acceso = { store, servicio, coordinador };
const crearRouter = (usuario: string, empresa: string) =>
  crearEnrutador(queryClient, crearServicioBandejaApi(cliente, usuario, empresa));
const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("No se encontró el elemento raíz del panel.");
createRoot(raiz).render(
  <StrictMode>
    <ProveedorTema>
      <TooltipProvider>
        <ProveedorConsultas queryClient={queryClient}>
          <ProveedorSesion acceso={acceso}>
            <AplicacionPanel crearRouter={crearRouter} />
          </ProveedorSesion>
          <Toaster richColors position="top-right" />
        </ProveedorConsultas>
      </TooltipProvider>
    </ProveedorTema>
  </StrictMode>,
);
if (import.meta.hot) import.meta.hot.dispose(() => coordinador.destruir());
