# Arquitectura del frontend

## Objetivo y estilo

`apps/dashboard` aplica Screaming Architecture: el primer nivel describe el producto (`inbox`, `conversations`, `contacts`, `agents`, `bot`), no su tecnología. TanStack Router resuelve navegación; TanStack Query administra estado remoto y mutaciones; React administra estado efímero de interfaz.

Todos los nombres propios del proyecto se escriben en español y son descriptivos. Se conservan los nombres que exige React, TanStack, shadcn, el navegador y otros contratos externos.

```text
src/
  routes/                         # Declaración de URL, layout, guard y loader de ruta
  features/
    inbox/
      api/                        # cliente y mapeo de contratos de esta funcionalidad
      queries/                    # queryOptions, query keys y hooks Query
      mutations/                  # hooks Mutation y actualización de caché
      components/                 # UI específica de la funcionalidad
      model/                      # tipos de UI, selectores y lógica pura
      lib/                        # helpers propios de inbox, sin I/O
    conversations/
    contacts/
    agents/
    bot/
  components/
    ui/                           # componentes shadcn sin lógica de negocio
    layout/                       # shell, sidebar y cabeceras
  lib/
    api-client/                   # transporte HTTP, ApiError y normalización global
    query-client.ts
    realtime-client.ts
  providers/
  main.tsx
```

No se crean carpetas globales `hooks`, `services`, `types` o `utils` como destino por defecto. Si algo pertenece a `inbox`, vive en `features/inbox`.

## Responsabilidades

| Ubicación | Debe contener | No debe contener |
| --- | --- | --- |
| `routes` | URL, parámetros, guardas, loaders y composición de la página. | Lógica de negocio, fetch manual, componentes extensos del feature. |
| `features/<feature>/api` | Funciones HTTP tipadas de ese feature. | JSX, toasts o caché de Query. |
| `queries` | `queryOptions`, claves y hooks de lectura. | Mutaciones, estado de formulario o duplicar datos remotos en Zustand/Context. |
| `mutations` | Hooks que ejecutan cambios, actualizan/invalida caché y muestran feedback controlado. | JSX y llamadas `fetch` dispersas. |
| `components` del feature | Presentación y eventos de usuario. | Acceso directo a `fetch`, secretos o reglas de autorización del servidor. |
| `components/ui` | Primitivas shadcn reutilizables. | Conceptos de `Conversation`, `Agent` o API. |
| `model` | Adaptadores de visualización, selectores y lógica pura. | I/O, React Query o acceso al navegador. |

## Contrato global de errores

El frontend consume el contrato definido por el backend y lo transforma una única vez en `lib/api-client` a `ApiError`:

```ts
class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ValidationDetail[];
  readonly requestId?: string;
}
```

Reglas:

1. Todas las llamadas HTTP pasan por `api-client`; no se usa `fetch` directo desde componentes ni hooks de features.
2. Si la respuesta no cumple el contrato, el cliente crea un `ApiError` con `code: 'UNEXPECTED_RESPONSE'` y conserva el `requestId` si existe.
3. El `QueryClient` define una política global: errores de consultas se muestran en la vista correspondiente; mutaciones no se reintentan por defecto y muestran feedback mediante un adaptador central de notificaciones.
4. El root route de TanStack Router define `errorComponent` y `notFoundComponent`. Las rutas críticas pueden sustituirlo con una pantalla contextual que permita reintentar.
5. Los errores de renderizado de widgets se contienen con `CatchBoundary`; no se captura todo con `try/catch` dentro de componentes.
6. Formularios muestran `details` por campo; errores globales muestran un mensaje seguro y, si existe, el identificador de solicitud para soporte.
7. Un error `401` inicia el flujo de cierre/renovación de sesión centralizado; un `403` nunca se disfraza como un fallo de red.

### Alertas de interfaz

- La librería estándar de notificaciones es `sonner`.
- Se monta un único `<Toaster />` en el layout raíz; ningún feature monta su propio toaster.
- Los features invocan un adaptador pequeño (`lib/notifications.ts`) en lugar de importar `toast` de `sonner` de forma dispersa. El adaptador expone `success`, `error`, `info` y `promise`.
- Las alertas confirman acciones o comunican fallos transitorios; no sustituyen errores de validación dentro del formulario ni pantallas de error recuperables.

## TanStack Query y colas de mutaciones

TanStack Query ejecuta mutaciones en paralelo por defecto. Para operaciones que deben conservar orden, se usa `scope` con el mismo `id`; Query las serializa y mantiene en cola.

Los mensajes de una conversación usan siempre el mismo scope:

```ts
useMutation({
  mutationFn: sendMessage,
  scope: { id: `conversation:${conversationId}` },
});
```

- No compartas el scope entre conversaciones: cada conversación puede enviar en paralelo.
- Envía un `clientMessageId` por mutación para que backend y UI dedupliquen reintentos.
- Actualiza de forma optimista el mensaje como `pending`; al confirmar, reemplázalo por el mensaje canónico del servidor; al fallar, márcalo `failed` y ofrece reintento.
- No serialices mutaciones que no dependen del orden, como cambios independientes de perfil o disponibilidad.
- Los eventos en tiempo real actualizan la caché de Query con `queryClient.setQueryData`; no mantengas una segunda fuente de verdad de mensajes.

## Reglas de dependencias

```text
routes → features → shared UI/lib
features no dependen de otras features directamente
components/ui no depende de features
```

Cuando una funcionalidad requiere datos de otra, exponer un contrato pequeño en su `model` o componerlas desde una ruta. No importa implementaciones internas ni rutas de archivos de otra feature.
