import { createHash } from "node:crypto";
import { en, es, Faker } from "@faker-js/faker";
import { z } from "zod";
export function generarConversaciones(empresa: string, cantidad: number, semilla: number) {
  z.number().int().min(1).max(1000).parse(cantidad);
  z.number().int().min(0).max(2147483647).parse(semilla);
  const faker = new Faker({ locale: [es, en] });
  faker.seed([semilla, createHash("sha256").update(empresa).digest().readUInt32BE()]);
  const referencia = new Date("2026-09-15T12:00:00.000Z");
  const identificador = () => faker.string.uuid({ version: 7, refDate: referencia });
  const canal = {
    id: identificador(),
    idEmpresa: empresa,
    nombre: "Canal de demostración",
    telefono: `+504${faker.string.numeric(8)}`,
  };
  const filas = Array.from({ length: cantidad }, (_, indice) => {
    const telefonoNormalizado = `504${String(90000000 + indice)}`;
    const contacto = {
      id: identificador(),
      idEmpresa: empresa,
      nombre: faker.person.fullName(),
      telefono: `+${telefonoNormalizado}`,
      telefonoNormalizado,
    };
    const conversacion = {
      id: identificador(),
      idEmpresa: empresa,
      idContacto: contacto.id,
      idCanal: canal.id,
      resumenUltimoMensaje: faker.lorem.sentence(),
      ultimaActividad: new Date(referencia.getTime() - Math.floor(indice / 3) * 60000),
    };
    return { contacto, conversacion };
  });
  return {
    canal,
    contactos: filas.map((f) => f.contacto),
    conversaciones: filas.map((f) => f.conversacion),
  };
}
