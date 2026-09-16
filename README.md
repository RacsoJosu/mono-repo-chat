# Hilo

Monorepo para un centro de conversaciones de WhatsApp. Incluye API Fastify, panel React 19 con TanStack Router/Query y proceso worker.

## Requisitos

- Node indicado en `.node-version`, administrado con fnm.
- pnpm indicado en `package.json`.
- Docker para PostgreSQL 17 y los servicios Azure locales de Floci.

```bash
fnm use
pnpm install
docker compose up -d
```

## Configuración local

Usa `.env.example` como referencia y carga sus valores en tu terminal; los comandos no cargan automáticamente ese archivo. No publiques secretos. Panel y API deben compartir origen: en desarrollo Vite reenvía /api a localhost:3000; URL_PUBLICA debe ser el origen del panel (normalmente http://localhost:5173).

1. Define URL_BASE_DE_DATOS_ADMIN para el propietario de la base.
2. Aplica migraciones y configura el rol runtime:

```bash
pnpm db:migrar
pnpm db:comprobar
pnpm db:configure-runtime
```

El último comando requiere DB_RUNTIME_ROLE y DB_RUNTIME_PASSWORD (mínimo 20 caracteres). Conserva la contraseña de un rol existente; rechaza roles privilegiados o propietarios. Define URL_BASE_DE_DATOS con las credenciales de ese rol para ejecutar la API.

3. Genera un SECRETO_AUTENTICACION de al menos 32 caracteres y conserva el mismo valor entre reinicios.
4. Para crear empresa y primer propietario, define BOOTSTRAP_EMPRESA, BOOTSTRAP_SLUG, BOOTSTRAP_NOMBRE, BOOTSTRAP_EMAIL y BOOTSTRAP_CLAVE. Ejecuta bootstrap con URL_BASE_DE_DATOS administrativa en esa terminal:

```bash
pnpm --filter @chatbot-whatsapp/api bootstrap
```

El bootstrap es explícito e idempotente. La cuenta debe cambiar contraseña e inscribir TOTP. Guarda los códigos de recuperación mostrados.

5. Consulta el ID de la empresa por su slug en PostgreSQL con la conexión administrativa (`SELECT id FROM organization WHERE slug = 'tu-slug';`). Define SEED_COMPANY_ID con ese ID y ejecuta:

```bash
pnpm seed:inbox
```

SEED_COUNT predeterminado 100 y SEED_VALUE predeterminado 20260915. Solo usa una base local de desarrollo/pruebas. Repetir la misma semilla no duplica ni sobrescribe datos.

6. Inicia con URL_BASE_DE_DATOS del runtime:

```bash
pnpm desarrollo
```

El panel requiere un navegador moderno con Web Locks y HTTPS en producción (localhost en desarrollo).

## Alcance actual de bandeja

- Lista de conversaciones con búsqueda y paginación por cursor.
- Consulta individual por UUID v7, aislada por empresa.
- Sesión mediante cookies, MFA, Zustand y sincronización entre pestañas.
- Detalle de contacto, canal, resumen y actividad.

No están implementados mensajes, envíos, estados de lectura, SSE ni sincronización con Meta. Los mensajes de demostración solo se usan en escenarios de pruebas.

## Verificación

```bash
pnpm formatear
pnpm verificar
pnpm probar
pnpm --filter @chatbot-whatsapp/panel verificar:navegador
pnpm compilar
```

Para integración PostgreSQL, configura URL_BASE_DE_DATOS_PRUEBAS con una base local exclusiva cuyo nombre termine en _pruebas. Aplica allí las migraciones antes de ejecutar suites aisladas. Playwright usa Edge instalado y arranca su servidor local.

## Documentación

- [Arquitectura](ARCHITECTURE.md)
- [Memoria de negocio](docs/negocio.md)
- [Bandeja, cursores, RLS y seeder](docs/architecture/bandeja.md)
- [Sesiones del panel](docs/architecture/frontend/sesion.md)
- [Backend](docs/architecture/backend.md) y [frontend](docs/architecture/frontend.md)

## Tecnologías

React 19, Vite, TanStack Router y Query, Tailwind CSS v4, shadcn/ui, Fastify, Zod, PostgreSQL y Drizzle. El monorepo usa pnpm, Turborepo y Biome; las pruebas usan Vitest, Testing Library y Playwright.

## Estructura

```text
apps/
  panel/           Interfaz de agentes
  api/             API HTTP y módulos de negocio
  worker/          Base para procesamiento asíncrono
packages/
  compartido/      Contratos, validaciones y tipos compartidos
  base-datos/      Base de infraestructura PostgreSQL y Drizzle
  interfaz/        Espacio para componentes compartidos
  configuracion/   Convenciones de configuración
docs/architecture/ Arquitectura y dirección visual
```

Las rutas del panel viven en `src/routes` y sus funcionalidades en `src/features`. El backend organiza sus capacidades en `src/modulos`.

## Comandos

| Comando | Propósito |
| --- | --- |
| `pnpm desarrollo` | Iniciar las aplicaciones en desarrollo |
| `pnpm compilar` | Compilar los paquetes y aplicaciones |
| `pnpm formatear` | Aplicar formato con Biome |
| `pnpm revisar` | Revisar formato y lint |
| `pnpm verificar` | Revisar formato, tipos y suites Vitest |
| `pnpm probar` | Ejecutar las suites Vitest mediante Turbo |
| `pnpm --filter @chatbot-whatsapp/panel probar:observar` | Observar las pruebas del frontend |
| `pnpm --filter @chatbot-whatsapp/api probar:observar` | Observar las pruebas del backend |
| `pnpm --filter @chatbot-whatsapp/panel verificar:navegador` | Ejecutar los flujos Playwright |

Playwright inicia su propio servidor local en el puerto 4181.

## Pruebas y contribución

- Frontend: `features/<funcionalidad>/pruebas`, con Vitest y Testing Library.
- Backend: `modulos/<modulo>/pruebas`, con Vitest y Fastify `inject`.
- Las pruebas transversales permanecen junto a su implementación.
- Los flujos Playwright se agrupan en `pruebas/navegador` dentro de la funcionalidad.
- Los cambios de comportamiento siguen TDD: prueba que reproduce el fallo, implementación mínima y refactorización.
- Antes de entregar cambios, ejecuta `pnpm verificar`; ejecuta Playwright cuando afectes flujos de navegador.

Consulta las [convenciones de contribución](AGENTS.md) antes de modificar el código.

## Licencia

[MIT](LICENSE).
