import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";

export function PantallaContenido({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Próximamente.</CardContent>
    </Card>
  );
}
