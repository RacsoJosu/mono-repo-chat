import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/pruebas/**/*.test.ts"],
    restoreMocks: true,
  },
});
