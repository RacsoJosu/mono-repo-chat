import { createFileRoute } from "@tanstack/react-router";
import { PantallaContactos } from "@/features/contactos/components/pantalla-contactos";

export const Route = createFileRoute("/contactos/")({ component: PantallaContactos });
