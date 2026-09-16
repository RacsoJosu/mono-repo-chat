import { useRouter } from "@tanstack/react-router";
import { PantallaError } from "./pantalla-error";
export function ErrorRuta({ error, reset }: { error: unknown; reset: () => void }) {
  const enrutador = useRouter();
  return (
    <PantallaError
      error={error}
      reintentar={() => {
        void enrutador.invalidate().then(reset);
      }}
    />
  );
}
