import { EllipsisVertical, LogOut, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/componentes/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/componentes/ui/dropdown-menu";
import { usuarioDemostracion } from "@/constantes/usuario-demostracion";

export function MenuUsuario() {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("usuario.menu")}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{usuarioDemostracion.nombre}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem disabled>
          <UserRound />
          {t("usuario.perfil")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => toast.info(t("sesion.cierrePendiente"))}
        >
          <LogOut />
          {t("usuario.cerrarSesion")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
