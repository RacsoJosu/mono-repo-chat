import type { LucideIcon } from "lucide-react";

export type RutaNavegacion = "/bandeja" | "/contactos" | "/bot" | "/configuracion";

export type ClaveNavegacion = "bandeja" | "contactos" | "bot" | "configuracion";

export type OpcionNavegacion = {
  clave: ClaveNavegacion;
  ruta: RutaNavegacion;
  icono: LucideIcon;
  visibleEnMovil: boolean;
};
