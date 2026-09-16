import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { ProveedorConsultas } from "./proveedores/proveedor-consultas";
import "./internacionalizacion/configuracion.js";
import { crearEnrutador } from "./enrutador.js";
import { crearServicioBandejaDemostracion } from "./features/bandeja/services/bandeja-demostracion.service";
import { crearQueryClient } from "./proveedores/configuracion-query";
import { ProveedorTema } from "./proveedores/proveedor-tema.js";
import "./styles.css";

const queryClient = crearQueryClient();
const servicioBandeja = crearServicioBandejaDemostracion();
const enrutador = crearEnrutador(queryClient, servicioBandeja);

const elementoRaiz = document.getElementById("raiz");
if (!elementoRaiz) throw new Error("No se encontró el elemento raíz del panel.");

createRoot(elementoRaiz).render(
  <StrictMode>
    <ProveedorTema>
      <TooltipProvider>
        <ProveedorConsultas queryClient={queryClient}>
          <RouterProvider router={enrutador} />
          <Toaster richColors position="top-right" />
        </ProveedorConsultas>
      </TooltipProvider>
    </ProveedorTema>
  </StrictMode>,
);
