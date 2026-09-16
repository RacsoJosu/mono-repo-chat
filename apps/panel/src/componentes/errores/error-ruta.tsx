import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { PantallaError } from "./pantalla-error";

export function ErrorRuta({ error, reset }: { error: unknown; reset: () => void }) {
  const enrutador = useRouter();
  const { reset: restablecerConsultas } = useQueryErrorResetBoundary();
  useEffect(() => {
    restablecerConsultas();
  }, [restablecerConsultas]);
  return (
    <PantallaError
      error={error}
      reintentar={() => {
        restablecerConsultas();
        void enrutador.invalidate().then(reset);
      }}
    />
  );
}
