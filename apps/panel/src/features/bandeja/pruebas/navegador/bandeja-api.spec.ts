import { expect, test } from "@playwright/test";
import { idAndrea, prepararApi } from "./api-fixture";

test("búsqueda, cursores, errores locales y detalle real sin llamadas a mensajes", async ({
  page,
  context,
}) => {
  const api = await prepararApi(context, { fallarPagina: true });
  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: /Andrea López/ })).toBeVisible();
  await page.getByLabel("Conversaciones", { exact: true }).evaluate((elemento) => {
    elemento.scrollTop = elemento.scrollHeight;
  });
  await expect(page.getByRole("button", { name: "Reintentar más conversaciones" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Andrea López/ })).toHaveCount(1);
  await page.getByRole("button", { name: "Reintentar más conversaciones" }).click();
  await expect(page.getByRole("link", { name: /Contacto 39/ })).toHaveCount(1);
  await page.getByLabel("Buscar conversaciones").fill("nadie");
  await expect(page.getByRole("heading", { name: "Sin coincidencias" })).toBeVisible();
  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
  await page.getByLabel("Buscar conversaciones").fill("Andrea");
  await expect(page).toHaveURL(/busqueda=Andrea/);
  await page.getByRole("link", { name: /Andrea López/ }).click();
  await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
  await page.screenshot({ path: "test-results/bandeja-escritorio.png" });
  expect(api.solicitudes.some((r) => /mensajes|sse|events/.test(r))).toBe(false);
});
test("móvil, URL canónica y errores de recurso conservan navegación", async ({ page, context }) => {
  await prepararApi(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/bandeja/chat/${idAndrea}?busqueda=Andrea&pendientes=true&page=asa`);
  await expect(page).toHaveURL(new RegExp(`/bandeja/chat/${idAndrea}\\?busqueda=Andrea$`));
  await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: "test-results/bandeja-movil.png" });
  await page.getByLabel("Volver a los chats").click();
  await expect(page.getByLabel("Buscar conversaciones")).toHaveValue("Andrea");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Andrea López" })).toBeVisible();
  for (const id of [
    "123",
    "01994bd0-1234-4000-8000-000000000001",
    "01994bd0-1234-7000-8000-000000000099",
  ]) {
    await page.goto(`/bandeja/chat/${id}`);
    await expect(page.getByRole("heading", { name: "Recurso no encontrado" })).toBeVisible();
  }
  await page.goto("/inexistente");
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
});
test("inicio y cierre se sincronizan entre pestañas sin persistir sesión", async ({ context }) => {
  const api = await prepararApi(context, { autenticada: false });
  const primera = await context.newPage();
  const segunda = await context.newPage();
  await primera.goto("/bandeja");
  await segunda.goto("/bandeja");
  await expect(segunda.getByRole("heading", { name: "Entra a Hilo" })).toBeVisible();
  await primera.getByLabel("Correo", { exact: true }).fill("ana@example.test");
  await primera.getByLabel("Contraseña", { exact: true }).fill("Clave-prueba-123456");
  await primera.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(primera.getByRole("heading", { name: "Bandeja", exact: true })).toBeVisible();
  await expect(segunda.getByRole("heading", { name: "Bandeja", exact: true })).toBeVisible();
  await primera.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await expect(primera.getByRole("heading", { name: "Entra a Hilo" })).toBeVisible();
  await expect(segunda.getByRole("heading", { name: "Entra a Hilo" })).toBeVisible();
  expect(api.solicitudes.filter((r) => r.endsWith("/sign-out"))).toHaveLength(1);
  expect(
    await primera.evaluate(() => Object.keys(localStorage).filter((k) => /token|sesion/i.test(k))),
  ).toEqual([]);
});
test("avisa antes de vencer y la renovación confirmada cierra el modal", async ({
  page,
  context,
}) => {
  await prepararApi(context, { venceEn: 90000 });
  await page.goto("/bandeja");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tu sesión está por vencer" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Bandeja", exact: true })).toBeVisible();
});

test("una sesión revocada oculta datos y requiere volver a autenticarse", async ({
  page,
  context,
}) => {
  const api = await prepararApi(context);
  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: /Andrea López/ })).toBeVisible();
  api.expirar();
  await page.getByRole("button", { name: "Actualizar conversaciones" }).click();
  await expect(page.getByRole("heading", { name: "Tu sesión expiró" })).toBeVisible();
  await expect(page.getByLabel("Buscar conversaciones")).toHaveCount(0);
  await page.getByRole("button", { name: "Volver a iniciar sesión" }).click();
  await expect(page.getByRole("heading", { name: "Entra a Hilo" })).toBeVisible();
});
