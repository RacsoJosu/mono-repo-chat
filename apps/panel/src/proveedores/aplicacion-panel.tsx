import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useStore } from "zustand";
import type { crearEnrutador } from "@/enrutador";
import { ModalSesion } from "@/features/acceso/components/modal-sesion";
import { PantallaAcceso } from "@/features/acceso/components/pantalla-acceso";
import { useAcceso } from "@/features/acceso/store/proveedor-sesion";
export function AplicacionPanel({
  crearRouter,
}: {
  crearRouter: (usuario: string, empresa: string) => ReturnType<typeof crearEnrutador>;
}) {
  const { store, coordinador } = useAcceso();
  const sesion = useStore(store);
  const usuario = sesion.sesion?.etapa === "listo" ? sesion.sesion.usuario.id : null;
  const empresa = sesion.empresa?.id;
  const enrutador = useMemo(
    () => (usuario && empresa ? crearRouter(usuario, empresa) : null),
    [crearRouter, usuario, empresa],
  );
  useEffect(() => {
    void coordinador.comprobar();
    const comprobar = () => {
      if (document.visibilityState === "visible") void coordinador.comprobar();
    };
    document.addEventListener("visibilitychange", comprobar);
    window.addEventListener("focus", comprobar);
    return () => {
      document.removeEventListener("visibilitychange", comprobar);
      window.removeEventListener("focus", comprobar);
    };
  }, [coordinador]);
  return (
    <>
      {sesion.estado === "activa" && enrutador ? (
        <RouterProvider key={`${usuario}:${empresa}`} router={enrutador} />
      ) : (
        <PantallaAcceso key={sesion.generacion} />
      )}
      <ModalSesion />
    </>
  );
}
