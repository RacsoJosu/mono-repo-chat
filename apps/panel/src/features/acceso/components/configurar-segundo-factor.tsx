import { useState } from "react";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { useAccesoMutation } from "../hooks/acceso.mutation";
import { useAcceso } from "../store/proveedor-sesion";
import { VerificarSegundoFactor } from "./verificar-segundo-factor";
export function ConfigurarSegundoFactor() {
  const { servicio } = useAcceso();
  const [clave, setClave] = useState("");
  const configurar = useAccesoMutation(
    () => servicio.configurarFactor(clave),
    () => {
      setClave("");
    },
  );
  const resultado = configurar.data;
  if (resultado)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configura tu autenticador</h1>
        <p className="text-sm text-muted-foreground">
          Copia esta clave en tu aplicación autenticadora o abre el enlace desde el dispositivo.
        </p>
        <code className="block break-all rounded-lg bg-muted p-3 text-sm">
          {new URL(resultado.totpURI).searchParams.get("secret")}
        </code>
        <a className="text-primary underline" href={resultado.totpURI}>
          Abrir autenticador
        </a>
        <div className="rounded-xl border border-border p-4">
          <h2 className="font-semibold">Guarda tus códigos de recuperación</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Cada código se usa una sola vez. No volverán a mostrarse.
          </p>
          <ul className="grid grid-cols-2 gap-2 font-mono text-xs">
            {resultado.backupCodes.map((codigo) => (
              <li key={codigo}>{codigo}</li>
            ))}
          </ul>
        </div>
        <VerificarSegundoFactor />
      </div>
    );
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        configurar.mutate();
      }}
    >
      <h1 className="text-2xl font-semibold tracking-tight">Activa el segundo factor</h1>
      <p className="text-sm text-muted-foreground">
        Confirma tu contraseña para configurar una aplicación autenticadora.
      </p>
      <label htmlFor="configurar-segundo-factor-1" className="block space-y-2">
        Contraseña
        <Input
          id="configurar-segundo-factor-1"
          type="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />
      </label>
      {configurar.isError && (
        <p role="alert" className="text-destructive">
          No pudimos configurar el segundo factor.
        </p>
      )}
      <Button disabled={configurar.isPending}>Configurar autenticador</Button>
    </form>
  );
}
