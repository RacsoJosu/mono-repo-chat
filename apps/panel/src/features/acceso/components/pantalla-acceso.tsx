import { type ReactNode, useState } from "react";
import { useStore } from "zustand";
import { Button } from "@/componentes/ui/button";
import { useAcceso } from "../store/proveedor-sesion";
import { ConfigurarSegundoFactor } from "./configurar-segundo-factor";
import { FormularioCambioClave } from "./formulario-cambio-clave";
import { FormularioIngreso } from "./formulario-ingreso";
import { SelectorEmpresa } from "./selector-empresa";
import { VerificarSegundoFactor } from "./verificar-segundo-factor";
export function PantallaAcceso() {
  const { store, coordinador } = useAcceso();
  const estado = useStore(store);
  const [verificar, setVerificar] = useState(false);
  let formulario: ReactNode;
  if (estado.cerrando) formulario = <p role="status">Cerrando sesión…</p>;
  else if (estado.estado === "comprobando")
    formulario = (
      <>
        <p role="status">Comprobando tu sesión…</p>
        {estado.error && (
          <Button onClick={() => void coordinador.comprobar(true)}>Reintentar</Button>
        )}
      </>
    );
  else if (estado.sesion?.etapa === "cambiar_clave") formulario = <FormularioCambioClave />;
  else if (estado.sesion?.etapa === "segundo_factor")
    formulario = estado.sesion.segundoFactorConfigurado ? (
      <VerificarSegundoFactor />
    ) : (
      <ConfigurarSegundoFactor />
    );
  else if (estado.sesion?.etapa === "listo")
    formulario = <SelectorEmpresa usuario={estado.sesion.usuario.id} />;
  else
    formulario = verificar ? (
      <VerificarSegundoFactor />
    ) : (
      <FormularioIngreso verificar={() => setVerificar(true)} />
    );
  return (
    <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-accent/60 via-background to-secondary/40 p-5">
      <section className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
        <p className="mb-8 text-sm font-semibold tracking-tight text-accent-foreground">Hilo</p>
        {formulario}
        {estado.error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {estado.error}
          </p>
        )}
        {(estado.sesion || estado.error || verificar) && (
          <Button
            variant="ghost"
            className="mt-6"
            onClick={() => {
              setVerificar(false);
              void coordinador.cerrar();
            }}
          >
            Cerrar sesión
          </Button>
        )}
      </section>
    </main>
  );
}
