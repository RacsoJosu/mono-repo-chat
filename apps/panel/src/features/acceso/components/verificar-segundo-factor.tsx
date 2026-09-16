import { useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { useAccesoMutation } from "../hooks/acceso.mutation";
import { useAcceso } from "../store/proveedor-sesion";
export function VerificarSegundoFactor() {
  const { servicio, coordinador } = useAcceso();
  const [codigo, setCodigo] = useState("");
  const [recuperacion, setRecuperacion] = useState(false);
  const verificar = useAccesoMutation(
    () => servicio.verificarFactor(codigo, recuperacion),
    () => coordinador.iniciar(),
  );
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        verificar.mutate();
      }}
    >
      <h1 className="text-xl font-semibold tracking-tight">Verifica tu identidad</h1>
      <label htmlFor="verificar-segundo-factor-1" className="block space-y-2">
        {recuperacion ? "Código de recuperación" : "Código de tu autenticador"}
        <Input
          id="verificar-segundo-factor-1"
          autoComplete="one-time-code"
          required
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
      </label>
      {verificar.isError && (
        <p role="alert" className="text-destructive">
          El código no pudo verificarse. Revisa el código e intenta nuevamente.
        </p>
      )}
      <Button type="submit" disabled={verificar.isPending}>
        Verificar
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setRecuperacion(!recuperacion);
          setCodigo("");
        }}
      >
        {recuperacion ? "Usar autenticador" : "Usar código de recuperación"}
      </Button>
    </form>
  );
}
