# Convenciones para agentes y contribuyentes

## Fuente de verdad

- La memoria de negocio está en [docs/negocio.md](docs/negocio.md). Léela antes de diseñar o modificar funcionalidades, contratos, tablas o permisos. Respeta las decisiones acordadas y no trates propuestas pendientes como requisitos aprobados.
- Cuando se acuerde o cambie una regla de negocio, actualiza esa memoria y la arquitectura afectada en el mismo cambio; distingue lo decidido de lo implementado.

- La arquitectura del proyecto se define en [ARCHITECTURE.md](ARCHITECTURE.md).
- Las reglas específicas están en [backend](docs/architecture/backend.md) y [frontend](docs/architecture/frontend.md).
- Antes de crear, mover o modificar código, identifica la funcionalidad de negocio afectada y respeta la capa a la que pertenece.
- Si una solicitud contradice estos documentos, la instrucción explícita del usuario tiene prioridad. Actualiza la documentación en el mismo cambio si la decisión es permanente.

## Reglas generales

- Usa TypeScript estricto. No uses `any`; usa `unknown` y redúcelo mediante validación cuando sea necesario.
- Usa la versión de Node indicada en `.node-version` mediante fnm. Antes de instalar o ejecutar dependencias, ejecuta `fnm use` si tu terminal no cambia de versión automáticamente.
- Biome es el formatter y linter único del repositorio. No agregues Prettier, ESLint ni configuraciones paralelas sin una decisión de arquitectura explícita.
- Ejecuta `pnpm formatear` después de cambios de código y `pnpm verificar` antes de entregar cambios.
- Los colores y componentes visuales deben respetar `docs/architecture/frontend/design.md`. Usa tokens semánticos; no escribas valores de color directos dentro de componentes.
- El panel usa Tailwind CSS v4 para estilos responsive y shadcn/ui para primitivas visuales. No crees componentes base ni media queries manuales cuando Tailwind o shadcn ya cubran la necesidad.
- Todos los nombres propios del proyecto (carpetas, archivos, variables, funciones, tipos, clases, errores y eventos) deben estar en español y describir su intención. Ejemplos: `conversaciones.service.ts`, `crearServicioConversaciones`, `mensajeEntrante`, `ErrorConversacionNoEncontrada`.
- `worker` es una excepción técnica aprobada para el proceso asíncrono y su aplicación (`apps/worker`). Sus módulos internos siguen usando nombres descriptivos en español.
- En el panel son excepciones aprobadas las carpetas `routes`, `features`, `components`, `hooks`, `store`, `services` y `utils` según la arquitectura del frontend, los sufijos `.query.ts` y `.mutation.ts` y el archivo generado `routeTree.gen.ts`. Las funcionalidades y los archivos propios mantienen nombres descriptivos en español.
- Conserva únicamente los nombres exigidos por una dependencia o estándar externo (`package.json`, `src`, `useQuery`, `errorComponent`, APIs de Meta). No traduzcas identificadores de terceros.
- Evita abreviaturas ambiguas y nombres genéricos como `data`, `item`, `handler`, `utils` o `manager`; nombra qué representa o hace cada elemento.
- Declara las constantes reutilizables en archivos dedicados dentro de `constantes/`; no las mezcles con componentes, servicios o rutas salvo que sean estrictamente locales y de una sola línea.
- Declara tipos e interfaces reutilizables en archivos dedicados dentro de `tipos/`. Un archivo de implementación solo conserva los tipos locales que no se comparten y cuya extracción no mejora la lectura.
- Un componente no puede superar 300 líneas. Cuando se acerque al límite, sepáralo por composición en componentes con una responsabilidad concreta, manteniendo el componente padre como orquestador visual.
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

## Rutas y validación del panel

- Organiza las rutas por carpetas de funcionalidad con `route.tsx`, `index.tsx` y segmentos dinámicos descriptivos. Conserva generación de `routeTree.gen.ts` y carga diferida automática del plugin Vite.
- Valida parámetros y búsquedas con Zod; `idChat` es UUID v7 mediante el esquema compartido. Un ID inválido no consulta servicios. Los filtros inválidos recuperan valores predeterminados y la URL se normaliza mediante reemplazo del historial.
- Los errores de navegación, recursos, API y cliente usan las composiciones de `componentes/errores` y el contrato seguro de `ErrorApi` descritos en la arquitectura.

## Dirección visual del frontend

- En tareas de interfaz, actúa como Lead UI/UX Engineer y Diseñador Frontend Senior especializado en Tailwind CSS y shadcn/ui. Diseña pantallas modernas y refinadas con identidad propia de Hilo.
- Aplica obligatoriamente la [dirección de UI/UX de Hilo](docs/architecture/frontend/design.md#dirección-de-uiux-de-hilo): personalización de shadcn, jerarquía tipográfica, bordes precisos, composición intencional, estados completos y microinteracciones accesibles.
- Adapta las referencias visuales a la paleta azul/púrpura/blanco/negro y a los tokens semánticos existentes. No copies colores directos ni patrones decorativos que reduzcan la legibilidad de las conversaciones.

## Cambios de estructura

- Crea una carpeta nueva solo cuando represente una capacidad de negocio, una capa definida en la arquitectura o una integración externa.
- No crees capas, abstracciones, eventos, colas o repositorios sin un caso de uso real.
- No dupliques contratos entre apps: comparte esquemas y tipos de transporte en `packages/compartido` cuando ambos consumidores los necesiten.
- No compartas lógica de negocio del backend con el frontend. Solo pueden compartirse contratos, validaciones sin I/O, constantes y tipos.

## Checklist antes de terminar

- ¿La responsabilidad del archivo coincide con su capa?
- ¿Las dependencias se inyectan y apuntan hacia adentro?
- ¿Los errores siguen el contrato global?
- ¿Las mutaciones invalidan o actualizan la caché correcta?
- ¿El cambio actualizó la documentación cuando introdujo una convención o decisión nueva?

## Pruebas y TDD

- Vitest ejecuta las pruebas unitarias y de integración del panel y API; Playwright conserva los flujos reales de navegador.
- Agrupa las pruebas de frontend en `features/<funcionalidad>/pruebas` y las de backend en `modulos/<modulo>/pruebas`. Las pruebas transversales viven junto a su implementación, en su propia carpeta `pruebas`.
- Usa `*.test.ts` / `*.test.tsx` para Vitest y `pruebas/navegador/*.spec.ts` para Playwright. No disperses suites junto a cada archivo ni crees carpetas vacías.
- Para comportamiento nuevo o correcciones, aplica TDD: prueba que falla por la causa esperada, cambio mínimo y refactorización. Una migración de ejecutor conserva las pruebas y el comportamiento existentes.
- Prueba resultados observables con dependencias reales o fronteras inyectadas; no inspecciones texto de código o configuración ni dupliques lógica productiva en expectativas.
- Aísla y limpia QueryClient, proveedores e instancias de servidor por prueba. Ninguna prueba ni escenario se incluye en artefactos productivos.
- `pnpm probar` ejecuta Vitest mediante Turbo; `pnpm verificar` comprueba formato, tipos productivos, tipos de pruebas y suites. Ejecuta Playwright cuando se afecten flujos de navegador.
- El nombre `queryClient` y la factoría `crearQueryClient` son excepciones aprobadas. Crea una instancia por arranque del panel y compártela entre el proveedor de React y el contexto de todas las rutas; cada prueba usa una instancia aislada.
