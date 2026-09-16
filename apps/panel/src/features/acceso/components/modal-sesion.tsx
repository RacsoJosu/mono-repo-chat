import { useStore } from "zustand";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/componentes/ui/alert-dialog";
import { Button } from "@/componentes/ui/button";
import { useAccesoMutation } from "../hooks/acceso.mutation";
import { useAcceso } from "../store/proveedor-sesion";
export function ModalSesion() {
  const { store, coordinador } = useAcceso();
  const estado = useStore(store);
  const renovar = useAccesoMutation(() => coordinador.renovar());
  const expirada = estado.estado === "expirada";
  return (
    <AlertDialog open={expirada || estado.aviso}>
      <AlertDialogContent className="border-border/60">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {expirada ? "Tu sesión expiró" : "Tu sesión está por vencer"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {expirada
              ? "Vuelve a verificar tu identidad para acceder a tus conversaciones."
              : "Puedes continuar trabajando o cerrar tu sesión."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {estado.error && (
          <p role="alert" className="text-sm text-destructive">
            {estado.error}
          </p>
        )}
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => void coordinador.cerrar()}>
            Cerrar sesión
          </Button>
          <Button
            disabled={renovar.isPending}
            onClick={() => {
              if (expirada) store.setState({ estado: "anonima", aviso: false });
              else renovar.mutate();
            }}
          >
            {expirada
              ? "Volver a iniciar sesión"
              : renovar.isPending
                ? "Verificando…"
                : "Continuar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
