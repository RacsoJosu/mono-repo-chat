import type { ConversacionDemostracion } from "@/features/bandeja/pruebas/demostracion/tipos/tipos-conversacion-demostracion";

export const conversacionesDemostracion: readonly ConversacionDemostracion[] = [
  {
    id: "01994bd0-1234-7000-8000-000000000001",
    nombre: "Andrea López",
    iniciales: "AL",
    resumen: "Quisiera hablar con un asesor.",
    hora: "10:42",
    estado: "pendiente",
    mensajesSinLeer: 2,
  },
  {
    id: "01994bd0-1234-7000-8000-000000000002",
    nombre: "Miguel Cruz",
    iniciales: "MC",
    resumen: "El bot ya respondió mi consulta.",
    hora: "10:31",
    estado: "bot",
    mensajesSinLeer: 0,
  },
  {
    id: "01994bd0-1234-7000-8000-000000000003",
    nombre: "Sofía Reyes",
    iniciales: "SR",
    resumen: "Gracias, quedo pendiente de la cotización.",
    hora: "10:18",
    estado: "asesor",
    mensajesSinLeer: 0,
  },
  {
    id: "01994bd0-1234-7000-8000-000000000004",
    nombre: "Daniel Méndez",
    iniciales: "DM",
    resumen: "Necesito actualizar mis datos.",
    hora: "09:56",
    estado: "bot",
    mensajesSinLeer: 1,
  },
];
