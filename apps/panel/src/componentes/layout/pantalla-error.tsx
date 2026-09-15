import { useTranslation } from "react-i18next";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/card";

export function PantallaError({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="m-4 max-w-lg">
      <CardHeader>
        <CardTitle>{t("error.titulo")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset}>
          {t("error.reintentar")}
        </Button>
      </CardContent>
    </Card>
  );
}
