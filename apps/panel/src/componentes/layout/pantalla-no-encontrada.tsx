import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle } from "@/componentes/ui/card";

export function PantallaNoEncontrada() {
  const { t } = useTranslation();
  return (
    <Card className="m-4 max-w-lg">
      <CardHeader>
        <CardTitle>{t("error.noEncontrado")}</CardTitle>
      </CardHeader>
    </Card>
  );
}
