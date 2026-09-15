import { Badge } from "@/componentes/ui/badge";
import { contenidoEstadosAtencion } from "../constantes/estados-atencion";
import type { EstadoAtencion } from "../tipos/tipos-conversacion-demostracion";

export function InsigniaEstado({ estado }: { estado: EstadoAtencion }) {
  const { etiqueta, icono: Icono, variante } = contenidoEstadosAtencion[estado];

  return (
    <Badge variant={variante} className="gap-1.5 px-2.5 py-1 font-medium">
      <Icono className="size-3" />
      {etiqueta}
    </Badge>
  );
}
