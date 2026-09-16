import { useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { useAccesoMutation } from "../hooks/acceso.mutation";
import { useAcceso } from "../store/proveedor-sesion";
export function FormularioIngreso({ verificar }: { verificar: () => void }) {
  const { servicio, coordinador } = useAcceso();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const ingreso = useAccesoMutation(
    () => servicio.ingresar(correo, clave),
    async (resultado) => {
      setClave("");
      if (resultado.twoFactorRedirect) verificar();
      else await coordinador.iniciar();
    },
  );
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        ingreso.mutate();
      }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Entra a Hilo</h1>
      <p className="text-sm text-muted-foreground">
        Tu equipo y tus conversaciones, en un solo lugar.
      </p>
      <label htmlFor="formulario-ingreso-1" className="block space-y-2">
        Correo
        <Input
          id="formulario-ingreso-1"
          type="email"
          autoComplete="username"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </label>
      <label htmlFor="formulario-ingreso-2" className="block space-y-2">
        Contraseña
        <Input
          id="formulario-ingreso-2"
          type="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
      </label>
      {ingreso.isError && (
        <p role="alert" className="text-sm text-destructive">
          No pudimos iniciar sesión. Revisa tus credenciales o intenta nuevamente.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={ingreso.isPending}>
        {ingreso.isPending ? "Verificando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
