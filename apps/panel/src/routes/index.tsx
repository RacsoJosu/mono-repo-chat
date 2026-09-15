import { createFileRoute } from "@tanstack/react-router";
import { PantallaBandejaDemostracion } from "@/features/bandeja/components/pantalla-bandeja-demostracion";

export const Route = createFileRoute("/")({ component: PantallaBandejaDemostracion });
