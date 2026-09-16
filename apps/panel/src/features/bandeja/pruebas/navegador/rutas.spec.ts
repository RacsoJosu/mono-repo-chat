import { expect, test } from "@playwright/test";

test("pantallas API 400, 404, 500 y error cliente son seguras y recuperables", async ({ page }) => {
  for (const [escenario, titulo] of [
    ["400", "Solicitud inválida"],
    ["404", "Recurso no encontrado"],
    ["500", "El servicio no está disponible"],
    ["cliente", "Ocurrió un error en la aplicación"],
  ]) {
    await page.goto(
      `/src/features/bandeja/pruebas/navegador/escenarios.html?escenario=${escenario}`,
    );
    await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
    await expect(page.getByText("SQL secreto")).toHaveCount(0);
    if (escenario === "500" || escenario === "cliente") {
      await page.getByRole("button", { name: "Reintentar", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
    }
  }
});
test("fallo de consulta inicial y de historial preservan recuperación", async ({ page }) => {
  await page.goto("/src/features/bandeja/pruebas/navegador/escenarios.html?escenario=consulta");
  await expect(page.getByRole("heading", { name: "El servicio no está disponible" })).toBeVisible();
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(20);
  await page.goto("/src/features/bandeja/pruebas/navegador/escenarios.html?escenario=historial");
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(20);
  await page.getByLabel("Mensajes de la conversación").evaluate((elemento) => {
    elemento.scrollTop = 0;
  });
  await expect(page.getByRole("button", { name: "Reintentar historial" })).toBeVisible();
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(20);
  await page.getByRole("button", { name: "Reintentar historial" }).click();
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(40);
});
