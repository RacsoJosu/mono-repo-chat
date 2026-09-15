import { Link, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/componentes/ui/tabs";
import { navegacionPanel } from "@/constantes/navegacion-panel";

export function NavegacionMovil() {
  const { t } = useTranslation();
  const rutaActual = useRouterState({ select: (estado) => estado.location.pathname });

  return (
    <Tabs
      value={rutaActual}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-2 py-2 md:hidden"
    >
      <TabsList className="grid h-auto w-full grid-cols-4 bg-transparent">
        {navegacionPanel
          .filter((opcion) => opcion.visibleEnMovil)
          .map((opcion) => {
            const Icono = opcion.icono;

            return (
              <TabsTrigger key={opcion.clave} value={opcion.ruta} asChild>
                <Link to={opcion.ruta} className="h-auto flex-col gap-1 py-1.5 text-xs">
                  <Icono className="size-4" />
                  <span>{t(`navegacion.${opcion.clave}`)}</span>
                </Link>
              </TabsTrigger>
            );
          })}
      </TabsList>
    </Tabs>
  );
}
