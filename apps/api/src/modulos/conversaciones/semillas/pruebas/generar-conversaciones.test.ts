import { esquemaIdChat } from "@chatbot-whatsapp/compartido";
import { expect, test } from "vitest";
import { generarConversaciones } from "../generar-conversaciones.js";

test("produce UUID v7 y datos reproducibles, separados por empresa y estables al ampliar cantidad", () => {
  const lote = generarConversaciones("empresa-a", 4, 42);
  expect(lote.conversaciones).toHaveLength(4);
  expect(lote).toEqual(generarConversaciones("empresa-a", 4, 42));
  expect(lote.conversaciones).toEqual(
    generarConversaciones("empresa-a", 5, 42).conversaciones.slice(0, 4),
  );
  expect(lote.conversaciones[0]?.id).not.toBe(
    generarConversaciones("empresa-b", 4, 42).conversaciones[0]?.id,
  );
  for (const registro of [...lote.contactos, ...lote.conversaciones, lote.canal])
    expect(esquemaIdChat.safeParse(registro.id).success).toBe(true);
  expect(new Set(lote.contactos.map((c) => c.telefono)).size).toBe(4);
  expect(() => generarConversaciones("empresa-a", 0, 42)).toThrow();
});
