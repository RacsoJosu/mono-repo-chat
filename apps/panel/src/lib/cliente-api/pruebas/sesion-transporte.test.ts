import { expect, test, vi } from "vitest";
import { crearClienteApi } from "../cliente-api";

test("un 401 de una identidad anterior no expira la sesión nueva", async () => {
  let resolver!: (respuesta: Response) => void;
  let generacion = 0;
  const transporte: typeof fetch = () =>
    new Promise<Response>((r) => {
      resolver = r;
    });
  const expirar = vi.fn();
  const cliente = crearClienteApi(transporte, expirar, () => generacion);
  const pendiente = cliente("/api/empresas/a/conversaciones");
  generacion++;
  resolver(
    new Response(
      JSON.stringify({ error: { code: "SESION_REQUERIDA", message: "", details: [] } }),
      { status: 401 },
    ),
  );
  await expect(pendiente).rejects.toThrow();
  expect(expirar).not.toHaveBeenCalled();
});
