import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/componentes/ui/button";
import { useTema } from "@/proveedores/proveedor-tema";

export function BotonCambioTema() {
  const { t } = useTranslation();
  const { cambiarTema, tema } = useTema();
  const esTemaClaro = tema === "claro";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={esTemaClaro ? t("tema.oscuro") : t("tema.claro")}
      onClick={cambiarTema}
    >
      {esTemaClaro ? <Moon /> : <Sun />}
    </Button>
  );
}
