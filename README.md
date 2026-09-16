# Hilo

Centro de conversaciones de WhatsApp con automatización y atención humana. Monorepo TypeScript con un panel para agentes, una API modular y una base para procesamiento asíncrono.

## Estado actual

- Panel React 19 con bandeja de demostración, filtros en la URL, rutas por chat y carga paginada del historial.
- Interfaz adaptable a escritorio y móvil, con temas claro y oscuro.
- API Fastify con endpoint de salud y contrato global de errores.
- Estructura inicial de worker, almacenamiento y contratos compartidos.

La integración real con WhatsApp, la persistencia de conversaciones y los procesadores de colas están pendientes. El panel usa servicios de demostración; el envío de mensajes permanece deshabilitado.

## Tecnologías

React 19, Vite, TanStack Router y Query, Tailwind CSS v4, shadcn/ui, Fastify, Zod, PostgreSQL y Drizzle. El monorepo usa pnpm, Turborepo y Biome; las pruebas usan Vitest, Testing Library y Playwright.

## Requisitos

- Node.js **24.15.0**, indicado en `.node-version`, administrado con fnm.
- pnpm **11.0.9**, indicado en `package.json`.
- Docker con Compose para PostgreSQL y el emulador local de Azure.
- Microsoft Edge instalado para las pruebas de Playwright.

## Inicio rápido

Desde la raíz del repositorio:

```sh
fnm use
pnpm install --frozen-lockfile
pnpm compilar
pnpm desarrollo
```

Si la versión de Node todavía no está instalada, ejecuta primero `fnm install`. En PowerShell, si fnm no está inicializado en tu perfil:

```powershell
fnm env --shell powershell | Out-String | Invoke-Expression
fnm use
```

Direcciones predeterminadas:

- Panel: http://localhost:5173 (Vite indica el puerto efectivo en la terminal).
- Salud de la API: http://localhost:3000/salud.

Para ejecutar solo el panel:

```sh
pnpm --filter @chatbot-whatsapp/panel desarrollo
```

### Configuración e infraestructura local

`.env.example` documenta las variables previstas y los valores locales de desarrollo. Puedes copiarlo a `.env` sin sobrescribir uno existente; los archivos de entorno locales están excluidos de Git.

Los scripts actuales no cargan automáticamente el archivo `.env`: la API lee las variables del proceso y usa los valores predeterminados `ENTORNO=desarrollo` y `PUERTO_API=3000`. Para cambiarlos, expórtalos en tu terminal antes de arrancar.

Cuando necesites la infraestructura local:

```sh
docker compose up -d
```

Compose inicia PostgreSQL en el puerto 5432 y Floci AZ para emular servicios Azure. Las pruebas actuales de bandeja y errores HTTP no requieren estos contenedores. El desarrollo y las pruebas de integración deben usar Floci, sin apuntar a una suscripción real de Azure.

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

## Arquitectura

- [Mapa y principios del proyecto](ARCHITECTURE.md)
- [Frontend](docs/architecture/frontend.md)
- [Backend](docs/architecture/backend.md)
- [Identidad visual de Hilo](docs/architecture/frontend/design.md)
- [Colas y resiliencia](docs/architecture/colas-y-resiliencia.md)

## Licencia

MIT.
