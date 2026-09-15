import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { obtenerIdiomaGuardado } from "./idioma.js";
import { recursos } from "./recursos.js";

void i18n.use(initReactI18next).init({
  resources: recursos,
  lng: obtenerIdiomaGuardado(),
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
