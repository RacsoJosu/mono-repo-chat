import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { aliasPanel } from "./configuracion/constantes/alias";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: aliasPanel },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/pruebas/**/*.test.{ts,tsx}"],
    setupFiles: ["./configuracion/preparar-pruebas.ts"],
    restoreMocks: true,
  },
});
