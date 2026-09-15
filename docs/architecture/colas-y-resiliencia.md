# Colas y resiliencia

## Propósito

Las colas desacoplan el webhook y las operaciones lentas. El webhook valida, persiste de forma idempotente y entrega trabajo; nunca espera la descarga de medios, reintentos ni una respuesta de un proveedor externo.

En producción se usa Azure Service Bus. En desarrollo y pruebas de integración se usa `floci-az` con los SDKs Azure habituales. El código no importa Floci ni contiene condiciones especiales para él.

## Topología inicial

| Cola | Productor | Consumidor | Propósito |
| --- | --- | --- | --- |
| `mensajes-salientes` | Servicio de conversaciones | Worker de mensajería | Enviar una respuesta hacia WhatsApp/Meta. |
| `procesar-medios` | Servicio de WhatsApp | Worker de medios | Descargar, validar y almacenar archivos adjuntos. |
| `notificar-asesor` | Servicio de conversaciones | Worker de notificaciones | Avisar a un asesor de una conversación asignada. |

Cada cola tiene su Dead Letter Queue (DLQ) propia de Service Bus. No se crea una cola de errores global: debe ser posible conocer el origen de cada mensaje muerto.

## Contrato de mensaje

Todo mensaje usa un sobre versionado y validado con Zod antes de ser procesado:

```ts
type SobreTrabajo<TDatos> = {
  idTrabajo: string;
  tipo: string;
  version: 1;
  ocurridoEn: string;
  idCorrelacion: string;
  idCausal?: string;
  claveIdempotencia: string;
  numeroIntento: number;
  datos: TDatos;
};
```

- `idTrabajo` identifica una ejecución concreta de cola.
- `claveIdempotencia` identifica el efecto de negocio y permanece igual durante reintentos y reprocesos.
- `idCorrelacion` vincula webhook, petición HTTP, worker y logs.
- `idCausal` apunta al mensaje que originó este trabajo.
- `version` permite evolucionar el contrato sin romper consumidores ya desplegados.
- El `MessageId` del broker es único por entrega. No usar la misma ID en un mensaje programado: Service Bus puede descartarlo por detección de duplicados. La idempotencia real vive en la aplicación y la base de datos.

El consumidor registra la `claveIdempotencia` antes de producir efectos externos. Si ya fue procesada, completa el mensaje sin repetir el envío.

## Reintentos

Solo se reintentan fallos transitorios: timeout, red, respuesta `429`, error `5xx` o indisponibilidad temporal del proveedor. No se reintentan errores de validación, autorización, contrato inválido o regla de negocio.

Política inicial:

| Intento total | Acción al fallar | Espera base |
| --- | --- | --- |
| 1 | Reprogramar | 5 segundos |
| 2 | Reprogramar | 30 segundos |
| 3 | Reprogramar | 2 minutos |
| 4 | Reprogramar | 10 minutos |
| 5 | Enviar a DLQ | — |

- Se agrega jitter aleatorio de hasta 20 % a cada espera.
- Si el proveedor entrega `Retry-After`, se respeta siempre que no supere el límite operativo definido para ese tipo de trabajo.
- El worker programa el siguiente mensaje y confirma el actual solo después de programarlo correctamente. El nuevo sobre incrementa `numeroIntento` y conserva la misma `claveIdempotencia`.
- Un mensaje que falle por datos permanentes se mueve a DLQ de inmediato, con `motivoMuerte` y `descripcionMuerte` seguros.
- No hay reintentos infinitos, bucles de DLQ ni reenvío automático desde una DLQ.

La DLQ es una bandeja de diagnóstico y reproceso controlado. Un operador corrige la causa, selecciona mensajes y los reprocesa creando un nuevo `idTrabajo`, conservando `idCorrelacion` y `claveIdempotencia` cuando corresponda. Todo reproceso queda auditado.

## Interruptor de circuito

El interruptor de circuito protege exclusivamente llamadas a dependencias remotas: Meta/WhatsApp, Azure Blob Storage, Azure Service Bus, Key Vault o un proveedor futuro. No se usa para reglas de negocio, repositorios locales ni errores de validación.

Estados:

```text
cerrado ── fallos transitorios dentro de una ventana ──→ abierto
abierto ── termina tiempo de recuperación ────────────→ semiabierto
semiabierto ── éxitos de prueba ──────────────────────→ cerrado
semiabierto ── un fallo transitorio ──────────────────→ abierto
```

Política inicial por interruptor:

```ts
type ConfiguracionInterruptorCircuito = {
  nombre: string;
  umbralFallos: number;              // 5
  ventanaFallosMs: number;           // 60_000
  tiempoRecuperacionMs: number;      // 30_000
  maximoPruebasSemiabierto: number;  // 1
};
```

Un interruptor se crea una vez por dependencia y proceso, nunca por petición ni por mensaje. Ejemplos: `interruptorMetaWhatsApp`, `interruptorAlmacenamientoAzure` e `interruptorServiceBus`.

El reintento queda dentro del interruptor: este registra un único fallo final de una operación agotada, no cada intento breve. Si el interruptor está abierto, devuelve inmediatamente `ErrorCircuitoAbierto`; el worker programa el mensaje para más tarde y no hace más reintentos inmediatos.

## Factoría reutilizable

La implementación reusable vive en `packages/compartido/src/resiliencia/crear-interruptor-circuito.ts`. No conoce Meta, Azure, HTTP ni Service Bus.

```ts
export function crearInterruptorCircuito(dependencias: {
  configuracion: ConfiguracionInterruptorCircuito;
  reloj: Reloj;
  almacenEstado?: AlmacenEstadoInterruptor;
  registrarEvento: RegistradorEventoResiliencia;
}) {
  return {
    async ejecutar<TResult>(operacion: () => Promise<TResult>): Promise<TResult> {
      // valida estado, permite prueba semiabierta y registra éxito o fallo
    },
    async obtenerEstado(): Promise<EstadoInterruptorCircuito> {
      // cerrado | abierto | semiabierto
    },
  };
}
```

`AlmacenEstadoInterruptor` es opcional. En desarrollo y una sola réplica se usa memoria. Cuando existan varias réplicas, se inyecta un almacén distribuido con operaciones atómicas para que todos los workers observen el mismo estado. Esta es la única variación permitida; los consumidores usan siempre `ejecutar`.

La composición conecta cada cliente con su interruptor:

```ts
const interruptorMetaWhatsApp = crearInterruptorCircuito({
  configuracion: configuracionInterruptorMeta,
  reloj,
  registrarEvento,
});

const clienteMetaWhatsApp = crearClienteMetaWhatsApp({
  clienteHttp,
  interruptor: interruptorMetaWhatsApp,
  politicaReintentos,
});
```

No se instancia un interruptor dentro de un controlador, servicio, procesador o método de cliente.

## Observabilidad y operación

Se registran con `idCorrelacion`, `idTrabajo`, cola y tipo de mensaje:

- Mensajes publicados, completados, reprogramados y enviados a DLQ.
- Número de intento, tipo de fallo y espera aplicada.
- Transiciones del interruptor (`cerrado`, `abierto`, `semiabierto`).
- Tamaño y antigüedad de cada DLQ.

Se alerta cuando una DLQ recibe mensajes, un interruptor permanece abierto más de cinco minutos o la cola acumula trabajos fuera de su tiempo objetivo. Los payloads, secretos, tokens y datos personales no se incluyen en logs ni alertas.
