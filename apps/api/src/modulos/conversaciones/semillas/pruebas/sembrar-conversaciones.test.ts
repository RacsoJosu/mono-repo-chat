import { randomUUID } from "node:crypto";
import * as esquema from "@chatbot-whatsapp/base-datos";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, expect, test } from "vitest";
import { sembrarConversaciones } from "../sembrar-conversaciones.js";

const url = process.env.URL_BASE_DE_DATOS_PRUEBAS;
const conexiones = new Pool({ connectionString: url });
afterAll(() => conexiones.end());
test.skipIf(!url)(
  "repetir semillas conserva cambios reales y un conflicto revierte todo el lote",
  async () => {
    const destino = new URL(url ?? "");
    if (
      !["localhost", "127.0.0.1"].includes(destino.hostname) ||
      !destino.pathname.endsWith("_pruebas")
    )
      throw new Error("Solo pruebas locales");
    const empresa = randomUUID();
    const base = drizzle(conexiones, { schema: esquema });
    await conexiones.query(
      "INSERT INTO organization(id,name,slug,created_at) VALUES ($1,'Semilla',$1,now())",
      [empresa],
    );
    try {
      await sembrarConversaciones(base, empresa, 3, 42);
      await conexiones.query(
        "UPDATE conversaciones SET resumen_ultimo_mensaje='Cambio real' WHERE id_empresa=$1",
        [empresa],
      );
      await sembrarConversaciones(base, empresa, 3, 42);
      const filas = await conexiones.query(
        "SELECT resumen_ultimo_mensaje FROM conversaciones WHERE id_empresa=$1",
        [empresa],
      );
      expect(filas.rows).toEqual(
        Array.from({ length: 3 }, () => ({ resumen_ultimo_mensaje: "Cambio real" })),
      );
      await expect(sembrarConversaciones(base, empresa, 3, 43)).rejects.toThrow();
      expect(
        (await conexiones.query("SELECT id FROM canales_whatsapp WHERE id_empresa=$1", [empresa]))
          .rows,
      ).toHaveLength(1);
      await expect(sembrarConversaciones(base, "no-existe", 3, 42)).rejects.toThrow();
    } finally {
      await conexiones.query("DELETE FROM conversaciones WHERE id_empresa=$1", [empresa]);
      await conexiones.query("DELETE FROM contactos WHERE id_empresa=$1", [empresa]);
      await conexiones.query("DELETE FROM canales_whatsapp WHERE id_empresa=$1", [empresa]);
      await conexiones.query("DELETE FROM organization WHERE id=$1", [empresa]);
    }
  },
);
