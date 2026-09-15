# Convenciones para agentes y contribuyentes

## Fuente de verdad

- La arquitectura del proyecto se define en [ARCHITECTURE.md](ARCHITECTURE.md).
- Las reglas específicas están en [backend](docs/architecture/backend.md) y [frontend](docs/architecture/frontend.md).
- Antes de crear, mover o modificar código, identifica la funcionalidad de negocio afectada y respeta la capa a la que pertenece.
- Si una solicitud contradice estos documentos, la instrucción explícita del usuario tiene prioridad. Actualiza la documentación en el mismo cambio si la decisión es permanente.

## Reglas generales

- Usa TypeScript estricto. No uses `any`; usa `unknown` y redúcelo mediante validación cuando sea necesario.
- Usa la versión de Node indicada en `.node-version` mediante fnm. Antes de instalar o ejecutar dependencias, ejecuta `fnm use` si tu terminal no cambia de versión automáticamente.
- Biome es el formatter y linter único del repositorio. No agregues Prettier, ESLint ni configuraciones paralelas sin una decisión de arquitectura explícita.
- Ejecuta `pnpm formatear` después de cambios de código y `pnpm verificar` antes de entregar cambios.
- Todos los nombres propios del proyecto (carpetas, archivos, variables, funciones, tipos, clases, errores y eventos) deben estar en español y describir su intención. Ejemplos: `conversaciones.service.ts`, `crearServicioConversaciones`, `mensajeEntrante`, `ErrorConversacionNoEncontrada`.
- `worker` es una excepción técnica aprobada para el proceso asíncrono y su aplicación (`apps/worker`). Sus módulos internos siguen usando nombres descriptivos en español.
- Conserva únicamente los nombres exigidos por una dependencia o estándar externo (`package.json`, `src`, `useQuery`, `errorComponent`, APIs de Meta). No traduzcas identificadores de terceros.
- Evita abreviaturas ambiguas y nombres genéricos como `data`, `item`, `handler`, `utils` o `manager`; nombra qué representa o hace cada elemento.
- Organiza el código por funcionalidad de negocio, no por tipo técnico global. El árbol debe comunicar que este es un sistema de conversaciones, agentes y WhatsApp.
- Mantén dependencias dirigidas hacia el dominio: interfaces y reglas de aplicación no importan Fastify, Drizzle, Redis, React ni SDKs de Meta.
- Usa inyección de dependencias por constructor o por factoría. Las dependencias se componen en el punto de arranque de cada aplicación.
- Aplica inversión de dependencias: la lógica de alto nivel define el contrato que necesita y no depende de Drizzle, Azure, Meta, Redis ni otra implementación concreta. La infraestructura implementa ese contrato y se inyecta desde composición.
- No instancies clientes de base de datos, HTTP, Redis o servicios dentro de controladores, servicios, repositorios o componentes.
- No hagas I/O en módulos de tipos, validaciones, componentes presentacionales ni lógica de dominio pura.
- Valida toda entrada que cruza una frontera: HTTP, webhook, variables de entorno, colas y datos de formularios.
- No expongas secretos, stacks, consultas SQL, payloads completos de Meta ni mensajes internos de infraestructura a usuarios.
- En desarrollo local y pruebas de integración, usa `floci-az` para servicios Azure. No apuntes agentes, pruebas ni scripts a una suscripción real de Azure.
- El código de negocio no importa Floci: usa los SDKs o clientes Azure habituales detrás de clientes propios e inyectados; Floci se selecciona únicamente mediante configuración de entorno.
- Los trabajos asíncronos siguen la política definida en `docs/architecture/colas-y-resiliencia.md`: idempotencia, reintentos acotados, DLQ por cola y reproceso auditado.
- Los interruptores de circuito se crean con `crearInterruptorCircuito` en composición, uno por dependencia remota. No se crean por petición ni se usan como sustituto de validación o lógica de negocio.
- Evita archivos "utils" genéricos. Toda utilidad debe tener un propósito y un nombre de dominio o técnico preciso.
- Una funcionalidad nueva debe incluir pruebas proporcionadas al riesgo: dominio y servicios con pruebas unitarias; flujos HTTP críticos con pruebas de integración.

## Cambios de estructura

- Crea una carpeta nueva solo cuando represente una capacidad de negocio, una capa definida en la arquitectura o una integración externa.
- No crees capas, abstracciones, eventos, colas o repositorios sin un caso de uso real.
- No dupliques contratos entre apps: comparte esquemas y tipos de transporte en `packages/shared` cuando ambos consumidores los necesiten.
- No compartas lógica de negocio del backend con el frontend. Solo pueden compartirse contratos, validaciones sin I/O, constantes y tipos.

## Checklist antes de terminar

- ¿La responsabilidad del archivo coincide con su capa?
- ¿Las dependencias se inyectan y apuntan hacia adentro?
- ¿Los errores siguen el contrato global?
- ¿Las mutaciones invalidan o actualizan la caché correcta?
- ¿El cambio actualizó la documentación cuando introdujo una convención o decisión nueva?
