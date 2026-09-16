# Arquitectura del frontend

## Objetivo y estilo

`apps/panel` aplica Screaming Architecture: las funcionalidades describen el producto (`bandeja`, `conversaciones`, `contactos`, `agentes`, `bot`). TanStack Router resuelve navegación mediante rutas basadas en archivos; TanStack Query administra estado remoto y mutaciones; React administra estado efímero de interfaz.

Todos los nombres propios del proyecto se escriben en español y son descriptivos. Por decisión explícita, las carpetas `routes`, `features`, `components`, `hooks`, `store`, `services` y `utils`, y los sufijos `.query.ts` y `.mutation.ts`, conservan esos nombres. Los nombres de las funcionalidades, archivos e identificadores propios siguen en español. También se conservan los nombres exigidos por React, TanStack, shadcn, el navegador y otros contratos externos.

Las decisiones visuales y los tokens de color se definen en [design.md](frontend/design.md). Ninguna funcionalidad define su propia paleta.

## Estructura por funcionalidad

`routes/` y `features/` son carpetas hermanas dentro de `src/`. Dentro de cada funcionalidad, `components/`, `hooks/`, `store/`, `services/` y `utils/` están al mismo nivel.

```text
apps/panel/
  index.html                      # Entrada HTML de Vite
  vite.config.ts                  # Plugin de TanStack Router antes del plugin de React
  src/
    routes/
      __root.tsx                  # Layout raíz y manejo global de errores
      index.tsx                   # Ruta /
      contactos.tsx               # Ruta /contactos
      bot.tsx                     # Ruta /bot
      configuracion.tsx           # Ruta /configuracion
    features/
      bandeja/
        components/               # Pantallas y componentes de la bandeja
        hooks/
          bandeja.query.ts        # Hooks de lectura con useQuery
          bandeja.mutation.ts     # Hooks de escritura con useMutation
        store/                    # Estado local compartido de la funcionalidad
        services/
          bandeja.service.ts      # Llamadas a la API mediante el cliente HTTP inyectado
        utils/
          bandeja.query-options.ts # Factorías de queryOptions y claves de consulta
        tipos/                    # Tipos reutilizables de la funcionalidad
        constantes/               # Constantes reutilizables de la funcionalidad
      conversaciones/
      contactos/
      agentes/
      bot/
      configuracion/
    componentes/
      ui/                         # Primitivas shadcn compartidas
      layout/                     # Marco del panel, sidebar y cabeceras
    lib/                          # Infraestructura transversal del panel
      cliente-consultas.ts
    proveedores/
    enrutador.tsx                 # Crea el router a partir del árbol generado
    routeTree.gen.ts              # Generado por TanStack Router; no editar a mano
    main.tsx                      # Montaje de React y composición de proveedores
```

El árbol describe la estructura acordada. Cada funcionalidad crea las carpetas y archivos cuando tiene una implementación real; no se agregan stores, servicios ni consultas ficticias para llenar la estructura. Los componentes compartidos del panel permanecen en `src/componentes`; los propios de una funcionalidad viven en `features/<nombre_feature>/components`.

No se crean carpetas globales `hooks`, `services`, `store` o `utils` como destino por defecto para código de negocio. Si algo pertenece a la bandeja, vive en `features/bandeja`. Los hooks técnicos de primitivas compartidas pueden permanecer junto a la infraestructura compartida.

## Rutas basadas en archivos

- Las rutas se declaran en `src/routes` con `createFileRoute`; `__root.tsx` usa `createRootRouteWithContext` para recibir el cliente de consultas compuesto en el arranque.
- El plugin `@tanstack/router-plugin` de Vite genera el árbol de rutas y se configura antes del plugin de React.
- `enrutador.tsx` consume `routeTree.gen.ts` y registra los tipos del router. No mantiene una lista manual de rutas con `createRoute` y `addChildren`.
- El árbol generado se excluye del formato y lint manuales. La generación debe ejecutarse antes de verificar tipos o compilar, incluso en un checkout limpio.
- Las rutas contienen URL, validación de parámetros, guardas, loaders y composición. Las pantallas y sus componentes pertenecen a `features/<nombre_feature>/components`.
- Los loaders pueden reutilizar las opciones de consulta de `features/<nombre_feature>/utils` con el cliente de TanStack Query compuesto en el arranque.
- `index.html` sigue siendo la entrada de Vite y carga `main.tsx`. `routes/index.tsx` representa la ruta `/`; ambos archivos tienen responsabilidades distintas.

## Responsabilidades

Las ubicaciones internas de esta tabla son relativas a `features/<nombre_feature>/`, salvo las rutas y los componentes compartidos.

| Ubicación | Debe contener | No debe contener |
| --- | --- | --- |
| `src/routes` | URL, parámetros, guardas, loaders y composición de la página. | Lógica de negocio, fetch manual o componentes extensos de la funcionalidad. |
| `components` | Pantallas, presentación y eventos de usuario que consumen los hooks de la funcionalidad. | Acceso directo a `fetch`, secretos o reglas de autorización del servidor. |
| `hooks/<nombre_feature>.query.ts` | Hooks de lectura que usan las opciones de `utils` con `useQuery`. | Definiciones duplicadas de queryOptions o transporte HTTP directo. |
| `hooks/<nombre_feature>.mutation.ts` | Hooks con `useMutation`, llamadas a servicios, actualización o invalidación de caché y feedback controlado. | JSX o llamadas `fetch` dispersas. |
| `store` | Estado de interfaz compartido dentro de la funcionalidad, cuando haga falta. | Copias de respuestas de la API o una segunda caché de datos remotos. |
| `services` | Funciones tipadas que llaman a la API mediante transporte inyectado, validan respuestas y adaptan contratos. | JSX, hooks React, toasts, gestión de caché o creación de clientes HTTP. |
| `utils` | Factorías de `queryOptions`, claves de consulta y funciones puras con nombres específicos. | Hooks React, estado mutable o I/O ejecutado al importar el módulo o construir las opciones. |
| `tipos` | Tipos e interfaces reutilizables de la funcionalidad. | I/O o implementaciones de servicios. |
| `constantes` | Constantes reutilizables de la funcionalidad. | Componentes o servicios. |
| `src/componentes/ui` | Primitivas shadcn reutilizables. | Conceptos de conversaciones, agentes o API. |

Las opciones de consulta definen `queryFn` delegando en los servicios; TanStack Query ejecuta esa función al consultar. Las mismas opciones se reutilizan en hooks, loaders y precargas. Los hooks se nombran por funcionalidad (`bandeja.query.ts`, `bandeja.mutation.ts`); si crecen, se separan por caso de uso con nombres descriptivos y el mismo sufijo.

`utils/` es una excepción aprobada como carpeta dentro de cada funcionalidad; sus archivos siempre describen su propósito, como `bandeja.query-options.ts`. No se crean archivos genéricos `utils.ts`.

## Contrato global de errores

El frontend consume el contrato definido por el backend y lo transforma una única vez en `lib/cliente-api` a `ErrorApi`:

```ts
class ErrorApi extends Error {
  readonly codigo: string;
  readonly estadoHttp: number;
  readonly detalles: DetalleValidacion[];
  readonly identificadorSolicitud?: string;
}
```

Reglas:

1. Todas las llamadas HTTP pasan por `cliente-api`; no se usa `fetch` directo desde componentes ni hooks de features.
2. Si la respuesta no cumple el contrato, el cliente crea un `ErrorApi` con `codigo: 'RESPUESTA_INESPERADA'` y mapea `requestId` a `identificadorSolicitud` si existe.
3. El `QueryClient` define una política global: errores de consultas se muestran en la vista correspondiente; mutaciones no se reintentan por defecto y muestran feedback mediante un adaptador central de notificaciones.
4. El root route de TanStack Router define `errorComponent` y `notFoundComponent`. Las rutas críticas pueden sustituirlo con una pantalla contextual que permita reintentar.
5. Los errores de renderizado de widgets se contienen con `CatchBoundary`; no se captura todo con `try/catch` dentro de componentes.
6. Formularios muestran `detalles` por campo; errores globales muestran un mensaje seguro y, si existe, el identificador de solicitud para soporte.
7. Un error `401` inicia el flujo de cierre/renovación de sesión centralizado; un `403` nunca se disfraza como un fallo de red.

### Alertas de interfaz

- La librería estándar de notificaciones es `sonner`.
- Se monta un único `<Toaster />` en el layout raíz; ningún feature monta su propio toaster.
- Los features invocan un adaptador pequeño (`lib/notificaciones.ts`) en lugar de importar `toast` de `sonner` de forma dispersa. El adaptador expone `exito`, `error`, `informacion` y `promesa`.
- Las alertas confirman acciones o comunican fallos transitorios; no sustituyen errores de validación dentro del formulario ni pantallas de error recuperables.

## TanStack Query y colas de mutaciones

TanStack Query ejecuta mutaciones en paralelo por defecto. Para operaciones que deben conservar orden, se usa `scope` con el mismo `id`; Query las serializa y mantiene en cola.

Los mensajes de una conversación usan siempre el mismo scope:

```ts
useMutation({
  mutationFn: enviarMensaje,
  scope: { id: `conversacion:${identificadorConversacion}` },
});
```

- No compartas el scope entre conversaciones: cada conversación puede enviar en paralelo.
- Envía un `clientMessageId` por mutación para que backend y UI dedupliquen reintentos.
- Actualiza de forma optimista el mensaje como `pending`; al confirmar, reemplázalo por el mensaje canónico del servidor; al fallar, márcalo `failed` y ofrece reintento.
- No serialices mutaciones que no dependen del orden, como cambios independientes de perfil o disponibilidad.
- Los eventos en tiempo real actualizan la caché de Query con `queryClient.setQueryData`; no mantengas una segunda fuente de verdad de mensajes.

## Reglas de dependencias

```text
routes → features → componentes compartidos/lib
features no dependen de otras features directamente
componentes/ui no depende de features
```

Cuando una funcionalidad requiere datos de otra, exponer un contrato pequeño en sus `tipos` o componerlas desde una ruta. No importa implementaciones internas ni rutas de archivos de otra feature.

Dentro de cada funcionalidad:

```text
components → hooks → utils (queryOptions) → services → transporte HTTP inyectado
                  → services (mutaciones)
components/hooks → store (estado local)
routes (loaders) → utils (queryOptions)
```

Los clientes y servicios se componen en el arranque y se inyectan; no se instancian dentro de componentes, hooks ni servicios. Los datos remotos pertenecen a TanStack Query y el estado local compartido pertenece a `store` solo cuando el estado de React del componente resulte insuficiente.

## Bandeja centrada en la conversación

- `/bandeja` muestra la cola y un estado de selección. `/` redirige a ella.
- `/bandeja/chat/$id` es hija del layout de bandeja: valida el identificador y carga el contacto; los identificadores desconocidos muestran 404.
- El layout ocupa el alto disponible hasta el borde inferior. La lista y los mensajes tienen scroll independiente; el encabezado del chat y el compositor permanecen visibles.
- Las filas de chats llegan al borde de la lista y se separan con divisores. La selección usa un indicador lateral y no tarjetas individuales.
- En móvil se muestra lista o conversación según la ruta; el chat oculta la navegación inferior y ofrece volver en su encabezado; volver a la lista conserva el layout y sus filtros.
- Se retiran métricas, encabezado promocional, contador duplicado y modo enfoque: el enfoque es el comportamiento predeterminado. Las métricas corresponden a una futura vista de estadísticas, que no se crea sin un caso de uso.
- Los detalles usan un Sheet cerrado por defecto. No se muestran tarjetas de asignación o contexto persistentes ni acciones falsas. Cuando exista asignación real, la acción principal aparecerá en el encabezado solo si el estado la requiere. Un resumen de transferencia breve se mostrará cuando exista ese dato, con opción de ampliar.
- `services/bandeja-demostracion.service.ts` implementa `ServicioBandeja`, compuesto en `main.tsx` e inyectado mediante el contexto del router.
- `utils/bandeja.query-options.ts` define `infiniteQueryOptions`; `hooks/bandeja.query.ts` usa `useInfiniteQuery`. La caché se separa por ID de chat.
- La primera página contiene los mensajes más recientes, ordenados cronológicamente; `cursorAnterior` solicita una página más antigua. `null` termina la paginación. Las páginas antiguas se anteponen conservando la posición visual del historial.
- El servicio recibe `AbortSignal`. El adaptador HTTP futuro deberá validar respuestas, mantener IDs estables y mapear su cursor opaco a este contrato. No se inventa un endpoint mientras no exista backend.
- La demostración ofrece 75 mensajes por chat en páginas de 20 para verificar scroll, fin del historial y aislamiento. No se simulan envíos ni asignaciones. No se crea un store ni una mutation sin operaciones reales.
