import { Bot, Clock3, Headphones } from "lucide-react";
import type { EstadoAtencion } from "@/features/bandeja/pruebas/demostracion/tipos/tipos-conversacion-demostracion";

export const contenidoEstadosAtencion = {
  pendiente: { etiqueta: "Esperando", icono: Clock3, variante: "secondary" },
  bot: { etiqueta: "Automático", icono: Bot, variante: "outline" },
  asesor: { etiqueta: "En atención", icono: Headphones, variante: "default" },
} as const satisfies Record<
  EstadoAtencion,
  { etiqueta: string; icono: typeof Bot; variante: string }
>;
