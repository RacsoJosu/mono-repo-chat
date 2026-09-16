import { createFileRoute } from "@tanstack/react-router";
import { PantallaConfiguracion } from "@/features/configuracion/components/pantalla-configuracion";

export const Route = createFileRoute("/configuracion/")({ component: PantallaConfiguracion });
