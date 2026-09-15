import { CircleAlert, Clock3, MessagesSquare } from "lucide-react";
export const metricasBandeja = [
  { etiqueta: "Por atender", valor: "12", descripcion: "4 requieren asesor", icono: CircleAlert },
  {
    etiqueta: "Tiempo medio",
    valor: "3 min",
    descripcion: "18 % menos esta semana",
    icono: Clock3,
  },
  { etiqueta: "Resueltas hoy", valor: "48", descripcion: "92 % por el bot", icono: MessagesSquare },
] as const;
