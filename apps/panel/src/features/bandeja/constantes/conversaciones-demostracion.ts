import type { ConversacionDemostracion } from "../tipos/tipos-conversacion-demostracion";

export const conversacionesDemostracion: readonly ConversacionDemostracion[] = [
  {
    id: "andrea-lopez",
    nombre: "Andrea López",
    iniciales: "AL",
    resumen: "Quisiera hablar con un asesor.",
    hora: "10:42",
    estado: "pendiente",
    mensajesSinLeer: 2,
  },
  {
    id: "miguel-cruz",
    nombre: "Miguel Cruz",
    iniciales: "MC",
    resumen: "El bot ya respondió mi consulta.",
    hora: "10:31",
    estado: "bot",
    mensajesSinLeer: 0,
  },
  {
    id: "sofia-reyes",
    nombre: "Sofía Reyes",
    iniciales: "SR",
    resumen: "Gracias, quedo pendiente de la cotización.",
    hora: "10:18",
    estado: "asesor",
    mensajesSinLeer: 0,
  },
  {
    id: "daniel-mendez",
    nombre: "Daniel Méndez",
    iniciales: "DM",
    resumen: "Necesito actualizar mis datos.",
    hora: "09:56",
    estado: "bot",
    mensajesSinLeer: 1,
  },
];
