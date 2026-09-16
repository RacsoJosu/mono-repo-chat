import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./pruebas-navegador",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4181",
    channel: "msedge",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "pnpm desarrollo --host 127.0.0.1 --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
