# Arquitectura

Este monorepo implementa un centro de conversaciones de WhatsApp con automatización por flujos y atención humana. Su estructura debe expresar esas capacidades de negocio (Screaming Architecture), no una agrupación global por controladores, servicios o componentes.

## Mapa del monorepo

```text
apps/
  api/          API HTTP, webhooks y casos de uso
  panel/        Panel de agentes y administradores
  worker/       Procesamiento asíncrono y reintentos
packages/
  base-datos/   Esquema, migraciones y adaptador de PostgreSQL
  compartido/   Contratos API, esquemas Zod, tipos y constantes
  interfaz/     Primitivas visuales reutilizables
  configuracion/ Configuración compartida de herramientas
docker-compose.yml # Floci AZ para servicios Azure locales
biome.json         # Formato y lint únicos del monorepo
.node-version      # Versión de Node administrada por fnm
docs/
  architecture/
    backend.md
    frontend.md
```

## Principios no negociables

1. Las dependencias se inyectan y se componen únicamente en el composition root de cada aplicación.
2. La regla de negocio no depende de frameworks ni de infraestructura; define los contratos que necesita y las implementaciones concretas dependen de esos contratos.
3. Cada capa tiene una única responsabilidad y no salta capas.
4. Todo borde del sistema valida datos y transforma errores a contratos seguros.
5. La interfaz de usuario trata a TanStack Query como estado remoto; el estado local efímero no se coloca en la caché remota.

## Documentos vinculados

- [Arquitectura del backend](docs/architecture/backend.md)
- [Arquitectura del frontend](docs/architecture/frontend.md)
- [Colas, reintentos, DLQ e interruptores de circuito](docs/architecture/colas-y-resiliencia.md)
- [Convenciones para agentes y contribuyentes](AGENTS.md)
