import type { IdiomaDisponible } from "@/tipos/idioma";

export type { IdiomaDisponible } from "@/tipos/idioma";

const nombreCookieIdioma = "idioma-panel";

function leerCookie(nombre: string) {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((fragmento) => fragmento.startsWith(`${nombre}=`))
    ?.split("=")[1];
}

export function obtenerIdiomaGuardado(): IdiomaDisponible {
  return leerCookie(nombreCookieIdioma) === "en" ? "en" : "es";
}

export function guardarIdioma(idioma: IdiomaDisponible) {
  const seguro =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: El idioma es una preferencia no sensible que debe poder leer el cliente.
  document.cookie = `${nombreCookieIdioma}=${idioma}; Path=/; Max-Age=31536000; SameSite=Lax${seguro}`;
  document.documentElement.lang = idioma;
}
