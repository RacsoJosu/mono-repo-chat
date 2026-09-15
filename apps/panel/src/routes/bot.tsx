import { createFileRoute } from "@tanstack/react-router";
import { PantallaBot } from "@/features/bot/components/pantalla-bot";

export const Route = createFileRoute("/bot")({ component: PantallaBot });
