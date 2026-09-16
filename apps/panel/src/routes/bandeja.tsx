import { createFileRoute } from "@tanstack/react-router";
import { LayoutBandeja } from "@/features/bandeja/components/layout-bandeja";
export const Route = createFileRoute("/bandeja")({ component: LayoutBandeja });
