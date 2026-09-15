# Arquitectura del backend

## Objetivo y estilo

`apps/api` es un monolito modular con estructura por funcionalidad. No usa arquitectura hexagonal completa: no se crean capas, puertos, entidades o interfaces si no resuelven una necesidad real.

El árbol debe revelar el producto: conversaciones, mensajes, contactos, asesores, bot y WhatsApp. Todos los nombres propios del proyecto se escriben en español y son descriptivos. Se conservan los nombres impuestos por Fastify, TypeScript o estándares externos.

```text
src/
  composicion/                    # Único lugar que crea dependencias concretas
  configuracion/                  # entorno, logger y configuración técnica
  compartido/                     # errores y contratos HTTP transversales
  modulos/
    conversaciones/
      conversaciones.routes.ts
      conversaciones.controller.ts
      conversaciones.service.ts
      conversaciones.repository.ts
      conversaciones.schemas.ts
      conversaciones.types.ts
      conversaciones.errors.ts
    mensajes/
    contactos/
    asesores/
    bot/
    whatsapp/
      whatsapp.routes.ts
      whatsapp.controller.ts
      whatsapp.service.ts
      cliente-meta-whatsapp.ts
      whatsapp.schemas.ts
      whatsapp.types.ts
  plugins/                        # Nombre impuesto por Fastify
  app.ts                           # Nombre impuesto por la aplicación
  server.ts                        # Nombre impuesto por la aplicación
```

Cada módulo empieza con los archivos que necesita. No se crean carpetas o abstracciones vacías por convención.

## Responsabilidades por archivo

| Archivo | Puede hacer | Nunca puede hacer |
| --- | --- | --- |
| `*.controller.ts` | Leer `request`, validar el DTO de transporte, llamar un servicio y formar la respuesta HTTP. | Contener reglas de negocio, llamar repositorios, usar Drizzle/SQL, llamar Meta o formatear errores manualmente. |
| `*.service.ts` | Orquestar reglas de negocio, transacciones, repositorios, clientes y eventos; devolver resultados de aplicación o lanzar errores de aplicación. | Conocer `request`, `reply`, códigos HTTP, Fastify o payloads HTTP. |
| `*.repository.ts` | Leer y persistir datos con Drizzle; mapear almacenamiento a resultados que entiende el servicio. | Devolver HTTP, usar `request`/`reply`, decidir reglas de negocio o coordinar otros repositorios. |
| `cliente-*.ts` | Adaptar una API externa, como Meta, Azure o Redis, a una interfaz pequeña que necesita el módulo. | Tomar decisiones de conversación o construir respuestas HTTP. |
| `*.schemas.ts` | Declarar y validar esquemas de frontera con Zod. | Ejecutar I/O, consultar datos o implementar reglas de negocio. |
| `*.types.ts` | Tipos, DTOs internos y contratos locales del módulo. | Ejecutar I/O o importar infraestructura. |
| `*.errors.ts` | Errores tipados del módulo y sus códigos estables. | Conocer HTTP o serializar respuestas. |

Un controlador siempre devuelve HTTP. Un servicio, repositorio o cliente **nunca** devuelve HTTP.

## Dirección de dependencias

```text
controller → service → repository / cliente externo
composicion → todos los módulos (para ensamblarlos)
```

Un servicio usa dependencias inyectadas. Se define una interfaz solo cuando aporta valor: una integración externa, una implementación intercambiable o una prueba aislada. No se duplican interfaces para cada repositorio por defecto.

### Inversión de dependencias

La inyección de dependencias no basta por sí sola. El servicio de alto nivel define el contrato que requiere; la infraestructura depende de ese contrato y lo implementa.

```text
servicio conversaciones → ClienteWhatsApp (contrato propio)
cliente-meta-whatsapp  → ClienteWhatsApp (implementación)
composicion            → une contrato e implementación
```

Por ejemplo, `crearServicioConversaciones` recibe `ClienteWhatsApp`; no importa `cliente-meta-whatsapp.ts` ni el SDK de Meta. El mismo criterio aplica a almacenamiento Azure, colas, correo y cualquier proveedor externo.

No crear interfaces mecánicamente para operaciones simples que solo usan un repositorio local. Crear el contrato cuando una dependencia externa, una variación real o una prueba aislada justifique desacoplarla.

## Inyección de dependencias

Se prefieren factorías `crear...` con un objeto `dependencias` explícito:

```ts
export function crearServicioConversaciones(dependencias: {
  repositorioConversaciones: RepositorioConversaciones;
  clienteWhatsApp: ClienteWhatsApp;
}) {
  return {
    async tomarConversacion(entrada: TomarConversacionEntrada) {
      // reglas de negocio
    },
  };
}
```

Solo `src/composicion` instancia implementaciones concretas:

```ts
const repositorioConversaciones = crearRepositorioConversacionesDrizzle({
  baseDeDatos,
});

const servicioConversaciones = crearServicioConversaciones({
  repositorioConversaciones,
  clienteWhatsApp,
});
```

No se permite instanciar una base de datos, un repositorio, un cliente de Meta o Azure dentro de un controlador, servicio o repositorio. No se usan singletons implícitos, service locator ni contenedores mágicos.

## Azure local con Floci

En desarrollo local y pruebas de integración se usa `floci-az`, no una cuenta real de Azure. Floci emula servicios Azure mediante sus SDKs y endpoints estándar.

| Necesidad | Servicio Azure | Uso inicial |
| --- | --- | --- |
| Adjuntos de WhatsApp | Blob Storage | Guardar y recuperar medios procesados. |
| Trabajo asíncrono | Service Bus | Reintentos, procesamiento de medios y notificaciones. |
| Secretos de despliegue | Key Vault | Solo producción; Floci lo simula localmente. |

- Los módulos dependen de clientes propios, como `cliente-almacenamiento-azure.ts` o `cliente-cola-azure.ts`; nunca importan Floci.
- El entorno elige el endpoint mediante variables validadas en `configuracion/entorno.ts`.
- Desarrollo y CI apuntan a `http://localhost:4577`; producción apunta a Azure real.
- No se usan credenciales reales de Azure en desarrollo local. La cadena local pertenece a `.env.local`, nunca a Git.

## Contrato global de errores

Todos los endpoints retornan errores en este formato:

```json
{
  "error": {
    "code": "CONVERSACION_NO_ENCONTRADA",
    "message": "No se encontró la conversación solicitada.",
    "details": [],
    "requestId": "req_..."
  }
}
```

- `code` es estable y legible por máquina (`ERROR_VALIDACION`, `NO_AUTORIZADO`, `NO_ENCONTRADO`, `ERROR_INTERNO`).
- `message` es seguro para mostrar al usuario.
- `details` se usa solo para errores de validación con campo, regla y mensaje seguro.
- `requestId` se genera o propaga por solicitud y se registra para trazabilidad.

### Reglas de manejo

1. Los servicios lanzan únicamente instancias de `ErrorAplicacion` o subtipos; nunca strings ni objetos literales.
2. `ErrorAplicacion` contiene código y semántica de aplicación, pero no conoce HTTP.
3. Un único `manejador-errores.plugin.ts` global mapea `ErrorAplicacion` a HTTP.
4. Fastify registra una sola vez `setErrorHandler` en el nivel raíz y un `setNotFoundHandler` global para 404.
5. El manejador registra errores inesperados con `requestId`; en producción responde `ERROR_INTERNO` sin mensaje original, stack ni datos del proveedor.
6. Los controladores no usan `try/catch` para formatear respuestas. Solo capturan si pueden añadir contexto y relanzan un error tipado con causa.
7. Repositorios y clientes traducen fallos técnicos esperables a errores tipados; el servicio decide si los propaga o los traduce a un error de negocio.

Los webhooks de Meta responden rápido: validan, deduplican por identificador de evento y disparan el servicio o encolan trabajo. Las operaciones lentas y los reintentos pasan al worker.

## Datos, transacciones y eventos

- El servicio define el límite transaccional; los repositorios no abren transacciones por decisión propia si participan en una operación mayor.
- Introducir una abstracción de unidad de trabajo únicamente cuando una operación requiera atomicidad entre varios repositorios.
- Los mensajes entrantes son idempotentes: persistir el identificador externo de Meta con una restricción única antes de procesar el flujo.
- Publicar eventos después de confirmar la transacción; tareas reintentables deben ser idempotentes.
