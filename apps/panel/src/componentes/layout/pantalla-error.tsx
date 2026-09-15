import { useTranslation } from "react-i18next";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";

export function PantallaError({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="mx-auto my-12 w-full max-w-lg rounded-3xl border-border/60 bg-linear-to-br from-accent/40 via-card to-card p-4 shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">{t("error.titulo")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset}>
          {t("error.reintentar")}
        </Button>
      </CardContent>
    </Card>
  );
}
