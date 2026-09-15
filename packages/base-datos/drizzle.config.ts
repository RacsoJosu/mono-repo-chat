import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/esquema/index.ts",
  out: "./migraciones",
  dialect: "postgresql",
  dbCredentials: { url: process.env.URL_BASE_DE_DATOS ?? "" },
});
