import { createFileRoute } from "@tanstack/react-router";
import { SeleccionarChat } from "@/features/bandeja/components/seleccionar-chat";
export const Route = createFileRoute("/bandeja/")({ component: SeleccionarChat });
