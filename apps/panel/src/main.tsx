import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { enrutador } from "./enrutador.js";
import { clienteConsultas } from "./lib/cliente-consultas.js";
import "./styles.css";

const elementoRaiz = document.getElementById("raiz");
if (!elementoRaiz) throw new Error("No se encontró el elemento raíz del panel.");

createRoot(elementoRaiz).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <RouterProvider router={enrutador} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);
