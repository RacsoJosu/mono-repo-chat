import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/componentes/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/componentes/ui/dropdown-menu";
import { guardarIdioma, type IdiomaDisponible } from "@/internacionalizacion/idioma";

export function SelectorIdioma() {
  const { i18n, t } = useTranslation();

  const cambiarIdioma = async (idioma: IdiomaDisponible) => {
    await i18n.changeLanguage(idioma);
    guardarIdioma(idioma);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("usuario.cambiarIdioma")}>
          <Languages />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("usuario.cambiarIdioma")}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => void cambiarIdioma("es")}>
          Español
          {i18n.language === "es" && <Check className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void cambiarIdioma("en")}>
          English
          {i18n.language === "en" && <Check className="ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
