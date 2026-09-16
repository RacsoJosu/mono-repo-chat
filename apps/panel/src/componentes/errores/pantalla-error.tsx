import { ErrorApi } from "@/lib/cliente-api/error-api";
import { EstadoError } from "./estado-error";
import { RecursoNoEncontrado } from "./recurso-no-encontrado";

export function PantallaError({ error, reintentar }: { error: unknown; reintentar: () => void }) {
  if (error instanceof ErrorApi) {
    if (error.estadoHttp === 404) return <RecursoNoEncontrado />;
    if (error.estadoHttp === 400)
      return (
        <EstadoError
          titulo="Solicitud inválida"
          descripcion="No pudimos procesar los datos de la solicitud. Vuelve a la bandeja y revisa los valores."
        />
      );
    return (
      <EstadoError
        titulo="El servicio no está disponible"
        descripcion="No pudimos completar la solicitud. Puedes intentarlo de nuevo."
        referencia={error.identificadorSolicitud}
        reintentar={reintentar}
      />
    );
  }
  return (
    <EstadoError
      titulo="Ocurrió un error en la aplicación"
      descripcion="No pudimos mostrar este contenido. Intenta recuperarlo o vuelve a la bandeja."
      reintentar={reintentar}
    />
  );
}
