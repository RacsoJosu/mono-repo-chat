import { useEffect } from "react";
import { Button } from "@/componentes/ui/button";
import { useEmpresas } from "../hooks/acceso.query";
import { useAcceso } from "../store/proveedor-sesion";
export function SelectorEmpresa({ usuario }: { usuario: string }) {
  const { coordinador } = useAcceso();
  const empresas = useEmpresas(usuario);
  useEffect(() => {
    if (empresas.data?.length === 1 && empresas.data[0]) coordinador.seleccionar(empresas.data[0]);
  }, [empresas.data, coordinador]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Elige tu empresa</h1>
      {empresas.isPending && <p role="status">Cargando empresas…</p>}
      {empresas.isError && (
        <>
          <p role="alert">No pudimos consultar tus empresas.</p>
          <Button onClick={() => void empresas.refetch()}>Reintentar</Button>
        </>
      )}
      {empresas.data?.length === 0 && (
        <p>No tienes empresas asignadas. Contacta a tu administrador.</p>
      )}
      {empresas.data?.map((empresa) => (
        <Button
          key={empresa.id}
          variant="outline"
          className="w-full justify-start"
          onClick={() => coordinador.seleccionar(empresa)}
        >
          {empresa.name}
        </Button>
      ))}
    </div>
  );
}
