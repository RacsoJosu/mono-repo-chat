# Migraciones de identidad

El modelo está en [identidad.dbml](identidad.dbml). El esquema ejecutable está en
[packages/base-datos/src/esquema](../../packages/base-datos/src/esquema/index.ts)
y el historial SQL en [packages/base-datos/migraciones](../../packages/base-datos/migraciones).

## Flujo

1. Actualizar plugins y extensiones en `apps/api/auth.config.ts`; ejecutar `pnpm db:identidad` (CLI oficial `auth@1.7.5`). No editar el esquema generado ni convertir metadatos con scripts propios.
2. Ejecutar `fnm use` desde la raíz.
3. Generar: `pnpm db:generar --name nombre_del_cambio`.
4. Revisar y versionar el SQL, snapshots y `meta/_journal.json`.
5. Comprobar coherencia: `pnpm db:comprobar`.
6. Configurar `URL_BASE_DE_DATOS` para el destino y aplicar: `pnpm db:migrar`.

La URL se proporciona por variable de entorno; Drizzle no carga automáticamente el
archivo `.env` de la raíz con esta configuración. No publicar credenciales en Git.
El comando de generación no necesita conexión a PostgreSQL.

Las migraciones son pasos explícitos de administración o despliegue. La API no
ejecuta migraciones al arrancar. No usar `drizzle-kit push` ni la migración automática
de Better Auth: omitirían el historial revisable de este repositorio.
Una migración aplicada no se reescribe; los cambios posteriores generan otra.

## Modelo inicial

- Tablas físicas y propiedades en inglés: contrato de Better Auth y OAuth Provider
  1.7.5. Se conservan los identificadores emitidos por el CLI oficial, incluidos nombres físicos en snake_case, relaciones, defaults y actualizaciones automáticas.
- Identificadores de identidad: `text`, compatibles con los plugins. Los futuros
  identificadores de chat siguen siendo PostgreSQL `uuid`, versión 7.
- Una persona puede tener membresías en varias empresas. El índice único
  `membresia_empresa_usuario_unica` evita dos roles simultáneos en la misma empresa.
- Los valores de rol propios del plugin son `owner`, `admin` y `member`; corresponden
  a propietario, administrador y agente. La autorización efectiva requiere reglas
  del servidor; el esquema no las sustituye.
- Las sesiones reservan fechas de segundo factor y reautenticación. Los usuarios
  nuevos tienen `debeCambiarClave = true`. Estos campos por sí solos no protegen rutas.
- Se conserva el esquema completo de los plugins, incluidas tablas auxiliares de
  invitaciones, consentimientos y renovación. Crear esas tablas no habilita
  registro público, invitaciones, delegación ni emisión de refresh tokens.

## Pruebas locales

Las pruebas viven en `apps/api/src/modulos/acceso/pruebas/migraciones.test.ts`.
Usan Vitest, el migrador de Drizzle y PostgreSQL real. Configurar
`URL_BASE_DE_DATOS_PRUEBAS` con una base exclusiva, local y terminada en
`_pruebas`; ejecutar:

```sh
pnpm --filter @chatbot-whatsapp/api probar migraciones
```

La suite aplica el historial existente, verifica integridad y reaplicación.
Sus datos se insertan en transacciones que se revierten al terminar.
Sin la variable, la suite se omite explícitamente; esto no constituye una
verificación de integración aprobada.

## Alcance pendiente

Esta base de identidad no completa la autenticación. Ya se implementaron el adaptador, las sesiones con TOTP y el bootstrap. Restan autorización por
membresía, vinculación y revocación de integraciones, auditoría y protección del
último propietario. Tampoco se declaran completadas políticas RLS: requieren el
contexto transaccional verificado y pruebas con el rol real de ejecución.
Las migraciones no contienen datos iniciales ni credenciales.

## Referencias

- [Migraciones con Drizzle](https://orm.drizzle.team/docs/migrations).
- [Adaptador Drizzle de Better Auth](https://better-auth.com/docs/adapters/drizzle).


## Corrección del origen del esquema

Las migraciones anteriores se eliminaron por instrucción del usuario. La nueva base procede del CLI oficial de Better Auth y de Drizzle Kit. El DBML se obtiene del SQL con `@dbml/cli sql2dbml --postgres`. La base de pruebas anterior no es compatible con este historial reemplazado; usar una base nueva, nunca aplicar este historial sobre la anterior. La configuración del CLI no habilita autenticación productiva.
