import { z } from "zod";
export const esquemaIdChat = z.uuidv7().transform((identificador) => identificador.toLowerCase());
