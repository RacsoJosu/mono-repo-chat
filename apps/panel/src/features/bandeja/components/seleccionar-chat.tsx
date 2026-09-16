import { MessagesSquare } from "lucide-react";
export function SeleccionarChat() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <MessagesSquare aria-hidden="true" className="mb-2 size-8 text-accent-foreground" />
      <h1 className="text-xl font-semibold tracking-tight">Una conversación a la vez.</h1>
      <p className="max-w-xs text-sm leading-6 text-muted-foreground">
        Selecciona un chat para leer los mensajes y continuar la conversación.
      </p>
    </section>
  );
}
