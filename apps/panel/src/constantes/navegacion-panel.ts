import { Bot, ContactRound, Inbox, Settings } from "lucide-react";
import type { OpcionNavegacion } from "@/tipos/navegacion-panel";

export const navegacionPanel: readonly OpcionNavegacion[] = [
  { clave: "bandeja", ruta: "/", icono: Inbox, visibleEnMovil: true },
  { clave: "contactos", ruta: "/contactos", icono: ContactRound, visibleEnMovil: true },
  { clave: "bot", ruta: "/bot", icono: Bot, visibleEnMovil: true },
  { clave: "configuracion", ruta: "/configuracion", icono: Settings, visibleEnMovil: true },
];
