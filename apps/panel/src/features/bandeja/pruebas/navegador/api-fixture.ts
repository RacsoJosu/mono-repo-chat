import type { BrowserContext } from "@playwright/test";
export const idAndrea = "01994bd0-1234-7000-8000-000000000001";
export async function prepararApi(
  contexto: BrowserContext,
  opciones: { autenticada?: boolean; venceEn?: number; fallarPagina?: boolean } = {},
) {
  let autenticada = opciones.autenticada ?? true;
  let vence = opciones.venceEn ?? 3600000;
  let fallar = opciones.fallarPagina ?? false;
  const solicitudes: string[] = [];
  await contexto.route("**/api/**", async (ruta) => {
    const url = new URL(ruta.request().url());
    solicitudes.push(url.pathname);
    const responder = (cuerpo: unknown, status = 200) => ruta.fulfill({ status, json: cuerpo });
    if (url.pathname.endsWith("/sign-in/email")) {
      autenticada = true;
      return responder({});
    }
    if (url.pathname.endsWith("/sign-out")) {
      autenticada = false;
      return responder({ success: true });
    }
    if (!autenticada)
      return responder({ error: { code: "SESION_REQUERIDA", message: "", details: [] } }, 401);
    if (url.pathname.endsWith("/get-session")) {
      vence = 3600000;
      return responder({ session: {} });
    }
    if (url.pathname.endsWith("/acceso/estado"))
      return responder({
        usuario: { id: "usuario", nombre: "Ana Agente" },
        etapa: "listo",
        venceEn: new Date(Date.now() + vence).toISOString(),
        horaServidor: new Date().toISOString(),
        segundoFactorConfigurado: true,
      });
    if (url.pathname.endsWith("/acceso/empresas"))
      return responder([{ id: "empresa", name: "Empresa de prueba" }]);
    const conversaciones = Array.from({ length: 40 }, (_, indice) => ({
      id:
        indice === 0 ? idAndrea : `01994bd0-1234-7000-8000-${String(indice + 1).padStart(12, "0")}`,
      contacto: {
        id: idAndrea,
        nombre: indice === 0 ? "Andrea López" : `Contacto ${indice}`,
        telefono: "+50499990000",
      },
      canal: { id: idAndrea, nombre: "Atención", telefono: "+50422220000" },
      resumenUltimoMensaje: "Consulta de prueba",
      ultimaActividad: "2026-09-15T12:00:00.000Z",
    }));
    if (url.pathname.endsWith("/conversaciones")) {
      const pagina = url.searchParams.get("cursor");
      if (pagina && fallar) {
        fallar = false;
        return responder({ error: { code: "ERROR_INTERNO", message: "", details: [] } }, 500);
      }
      const busqueda = (url.searchParams.get("busqueda") ?? "").toLowerCase();
      const filtradas = conversaciones.filter((c) =>
        c.contacto.nombre.toLowerCase().includes(busqueda),
      );
      return responder({
        conversaciones: filtradas.slice(pagina ? 20 : 0, pagina ? 40 : 20),
        cursorSiguiente: !pagina && filtradas.length > 20 ? "siguiente" : null,
      });
    }
    const conversacion = conversaciones.find((c) =>
      url.pathname.toLowerCase().endsWith(`/${c.id}`),
    );
    return conversacion
      ? responder(conversacion)
      : responder({ error: { code: "NO_ENCONTRADO", message: "", details: [] } }, 404);
  });
  return {
    solicitudes,
    expirar: () => {
      autenticada = false;
    },
  };
}
