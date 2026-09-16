import { useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { useAccesoMutation } from "../hooks/acceso.mutation";
import { useAcceso } from "../store/proveedor-sesion";
export function FormularioCambioClave() {
  const { servicio, coordinador } = useAcceso();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const cambio = useAccesoMutation(
    () => servicio.cambiarClave(actual, nueva),
    () => coordinador.iniciar(),
  );
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        cambio.mutate();
      }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Protege tu cuenta</h1>
      <p className="text-sm text-muted-foreground">
        Cambia tu contraseña inicial antes de continuar.
      </p>
      <label htmlFor="formulario-cambio-clave-1" className="block space-y-2">
        Contraseña actual
        <Input
          id="formulario-cambio-clave-1"
          type="password"
          autoComplete="current-password"
          required
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
      </label>
      <label htmlFor="formulario-cambio-clave-2" className="block space-y-2">
        Nueva contraseña
        <Input
          id="formulario-cambio-clave-2"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
      </label>
      {cambio.isError && (
        <p role="alert" className="text-destructive">
          Revisa la contraseña actual y usa una nueva de al menos 12 caracteres.
        </p>
      )}
      <Button type="submit" disabled={cambio.isPending}>
        Cambiar contraseña
      </Button>
    </form>
  );
}
