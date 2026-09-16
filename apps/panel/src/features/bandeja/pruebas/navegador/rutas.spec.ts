import { expect, test } from "@playwright/test";

const idAndrea = "01994bd0-1234-7000-8000-000000000001";
test("normaliza URL, conserva filtros, reemplaza historial y admite atrás y adelante", async ({
  page,
}) => {
  await page.goto("/contactos");
  await page.goto("/bandeja?busqueda=Andrea&pendientes=incorrecto&page=asa");
  await expect(page).toHaveURL(/\/bandeja\?busqueda=Andrea$/);
  await expect(page.getByLabel("Buscar conversaciones")).toHaveValue("Andrea");
  await page.getByRole("link", { name: /Andrea López/ }).click();
  await expect(page).toHaveURL(new RegExp(`/bandeja/chat/${idAndrea}\\?busqueda=Andrea$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/bandeja\?busqueda=Andrea$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/contactos\/?$/);
  await page.goForward();
  await expect(page.getByLabel("Buscar conversaciones")).toHaveValue("Andrea");
  await page.getByLabel("Buscar conversaciones").fill("");
  await expect(page).toHaveURL(/\/bandeja$/);
  await page.getByLabel("Mostrar solo conversaciones pendientes").click();
  await expect(page).toHaveURL(/pendientes=true/);
});
test("ruta directa, UUID mayúsculo, recurso inexistente y página desconocida", async ({ page }) => {
  await page.goto(`/bandeja/chat/${idAndrea.toUpperCase()}`);
  await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
  await page.screenshot({ path: "test-results/escritorio.png" });
  await page.reload();
  await expect(page.getByLabel("Mensajes de la conversación")).toBeVisible();
  for (const id of [
    "incorrecto",
    "01994bd0-1234-4000-8000-000000000001",
    "01994bd0-1234-7000-8000-000000000099",
  ]) {
    await page.goto(`/bandeja/chat/${id}`);
    await expect(page.getByRole("heading", { name: "Recurso no encontrado" })).toBeVisible();
  }
  await page.goto("/bandeja/chat/incorrecto?busqueda=Andrea");
  await page.getByRole("link", { name: "Volver a la bandeja" }).click();
  await expect(page.getByLabel("Buscar conversaciones")).toHaveValue("Andrea");
  await page.goto("/ruta-inexistente");
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
});
test("móvil mantiene scroll y regreso con filtros", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/bandeja/chat/${idAndrea}?busqueda=Andrea`);
  const mensajes = page.getByLabel("Mensajes de la conversación");
  await expect(mensajes).toBeVisible();
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(20);
  await mensajes.evaluate((elemento) => {
    elemento.scrollTop = 0;
  });
  await expect(page.locator("[data-mensaje-id]")).toHaveCount(40);
  expect(await mensajes.evaluate((elemento) => elemento.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(844);
  await page.screenshot({ path: "test-results/movil.png" });
  await page.getByLabel("Volver a los chats").click();
  await expect(page.getByLabel("Buscar conversaciones")).toHaveValue("Andrea");
});
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
