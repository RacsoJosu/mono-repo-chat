import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import "./internacionalizacion/configuracion.js";
import { crearEnrutador } from "./enrutador.js";
import { crearClienteConsultas } from "./lib/cliente-consultas.js";
import { ProveedorTema } from "./proveedores/proveedor-tema.js";
import "./styles.css";

const clienteConsultas = crearClienteConsultas();
const enrutador = crearEnrutador(clienteConsultas);

const elementoRaiz = document.getElementById("raiz");
if (!elementoRaiz) throw new Error("No se encontró el elemento raíz del panel.");

createRoot(elementoRaiz).render(
  <StrictMode>
    <ProveedorTema>
      <TooltipProvider>
        <QueryClientProvider client={clienteConsultas}>
          <RouterProvider router={enrutador} />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </TooltipProvider>
    </ProveedorTema>
  </StrictMode>,
);
