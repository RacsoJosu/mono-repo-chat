# Memoria de negocio de Hilo

Este documento conserva las decisiones de producto y las decisiones técnicas que afectan al negocio. Debe leerse antes de diseñar funcionalidades, contratos, tablas o permisos, junto con la [arquitectura](../ARCHITECTURE.md).

Una decisión acordada no significa que ya esté implementada. Las propuestas y los asuntos pendientes se distinguen expresamente para no convertir suposiciones en requisitos.

## 1. Empresas, usuarios y acceso — acordado

- Hilo atenderá a varias empresas con datos aislados. En este documento, empresa y organización representan el mismo concepto.
- Cada empresa puede tener varios usuarios de la plataforma, vinculados mediante membresías.
- En la primera versión, todos los miembros de una empresa pueden consultar los chats de esa empresa.
- Un chat pertenece a la empresa, no a un usuario concreto. Varios agentes pueden abrir y consultar el mismo chat y su historial.
- Los contactos, canales y conversaciones deben respetar el aislamiento entre empresas.
- No habrá restricciones de visibilidad por equipo ni por agente asignado en esta primera versión.
- La asignación futura de un responsable es distinta del permiso para consultar el chat; asignarlo no debe implicar automáticamente ocultarlo a sus compañeros.
- Una misma persona puede pertenecer a varias empresas con un rol diferente por membresía. Cambiar la empresa activa exige validar la membresía y separar o limpiar la caché del panel.

## 2. Identidad del chat — acordado

- Un chat es un hilo permanente por contacto y número de WhatsApp conectado, dentro de una empresa.
- Si el contacto vuelve a escribir después de terminar una atención, continúa el mismo hilo.
- Una atención o episodio de servicio es un concepto distinto del chat. Su registro separado es una posibilidad futura, no una tabla ni un flujo aprobados para esta entrega.
- El identificador público del chat es UUID v7. Se conserva la validación compartida, normalización a minúsculas y futura persistencia en una columna PostgreSQL `uuid`.
- Los mensajes de un chat son compartidos entre sus agentes; no se duplica el historial por usuario.

## 3. Lectura individual — acordado

- La posición de lectura pertenece a cada agente y chat.
- Que un agente abra o lea una conversación no marca sus mensajes como leídos para los demás.
- Los contadores de mensajes sin leer se calculan para el usuario autenticado.
- El DBML debe representar la relación entre chat y miembro lector, manteniendo el aislamiento de empresa.
- El contrato exacto para avanzar la posición de lectura, los mensajes que cuentan como no leídos y el tratamiento de miembros nuevos quedan pendientes de especificación.

## 4. Bandeja y búsqueda — acordado

- La lista de chats y el historial de mensajes usarán paginación por cursores para scroll infinito, sin paginación por número de página.
- El buscador de la bandeja buscará por nombre del contacto, teléfono y contenido o resumen del último mensaje.
- Buscar en todo el historial de mensajes queda fuera de esta primera versión.
- Se mantiene la intención del filtro de pendientes existente. Su regla de negocio y su relación con estado, atención y lectura deberán precisarse; pendiente no debe confundirse automáticamente con no leído.
- El panel se conectará a la API real para listado, búsqueda, detalle, historial y marcado de lectura.
- Al seleccionar un chat real, se mostrará su detalle e historial reales. No se mezclará una lista persistida con conversaciones o mensajes ficticios.

## 5. Autenticación y aislamiento — acordado

- Se utilizará Better Auth con correo y contraseña.
- Habrá alta administrada de empresas y usuarios, mediante un comando de administración. Los datos de demostración para desarrollo estarán separados.
- No se incluye registro público ni un flujo público de invitaciones en esta entrega.
- La autenticación real se incorporará antes de habilitar los endpoints de bandeja.
- Se adopta RLS (Row-Level Security) de PostgreSQL como refuerzo del aislamiento entre empresas. No sustituye la validación de sesión y membresía en la aplicación.
- La API debe obtener el contexto de empresa de una identidad autenticada y autorizada; no debe confiar por sí solo en un `idOrganizacion` enviado por el navegador.
- El rol de ejecución de la API no debe ser superusuario ni tener `BYPASSRLS`. Debe contemplarse también que el propietario de tablas puede omitir RLS.
- Las políticas concretas, roles de base de datos, contexto transaccional y comportamiento del pool se definirán junto con las migraciones y se probarán con acceso entre empresas.

## 6. Orden y alcance de la entrega — acordado

1. Diseñar primero el DBML y decidir las relaciones y restricciones.
2. A partir del modelo acordado, preparar esquemas y migraciones de PostgreSQL con Drizzle.
3. Incorporar la autenticación y membresías necesarias.
4. Implementar los endpoints de listado y búsqueda, detalle de chat, historial por cursor y marcado de lectura individual.
5. Conectar el panel, incluido un acceso mínimo con correo y contraseña, y verificar los flujos completos.

La primera entrega se probará con datos locales persistidos. No incluye recepción o envío mediante Meta, procesadores de integración, indicadores de escritura, presencia ni prevención de respuestas simultáneas duplicadas. Estos últimos se diseñarán cuando se implemente el envío.

El DBML debe contemplar organizaciones, usuarios y membresías, canales de WhatsApp, contactos, chats, mensajes y lectura por agente. Las tablas de identidad de Better Auth ya se describen en el DBML de identidad. El modelo físico de canales, contactos, chats, mensajes y lectura sigue pendiente.

## 7. Base técnica ya acordada

- Backend modular con responsabilidades separadas e inyección de dependencias; contratos y validaciones compartidos sin lógica de negocio del servidor en el frontend.
- Rutas del panel por carpetas, UUID v7 validado antes de consultar y errores seguros de navegación, recursos y API.
- Un único `queryClient` por arranque del panel, compartido por el proveedor de React y el contexto de todas las rutas.
- Los loaders de conversación usan `ensureQueryData`; los componentes consumen la misma caché con `useSuspenseQuery`. El historial usa consultas infinitas.
- Vitest y Testing Library para lógica e interacción; Playwright para flujos reales de navegador. Pruebas agrupadas por funcionalidad o módulo y TDD para cambios de comportamiento.
- Para detalles normativos, consultar [frontend](architecture/frontend.md), [backend](architecture/backend.md), [dirección visual](architecture/frontend/design.md) y [colas y resiliencia](architecture/colas-y-resiliencia.md).

## 8. Propuestas técnicas pendientes de cerrar

- Un único endpoint de listado con filtros y cursor para servir también al buscador.
- Orden por actividad reciente con ID de desempate. Debe definirse qué sucede al recibir mensajes mientras se recorren páginas: el cursor no congela por sí solo una lista cuyo orden cambia.
- Formato y validación del cursor, vinculación a filtros y empresa, límites de página y política de caducidad.
- Índices B-tree para orden y acceso; evaluar `pg_trgm` para búsqueda parcial, incluyendo el coste de términos cortos.
- Normalización de teléfono, mayúsculas y acentos; tamaño del resumen del último mensaje.
- Contratos HTTP definitivos, política de actualización de bandeja y validación de entradas.
- Implementación del bootstrap y recuperación administrativa según la estrategia de autenticación aprobada.
- Regla de lectura y actualizaciones concurrentes, integridad entre empresas y actualización consistente del último mensaje.

Estas propuestas no autorizan a inventar reglas de negocio ni se consideran un diseño final de base de datos.

## 9. Definition of Done — base para concretar con el DBML

La definición detallada de terminado todavía no se ha cerrado. Como base derivada del alcance acordado, deberá cubrir:

- DBML revisado, restricciones e índices explícitos y migraciones reproducibles en PostgreSQL local.
- Sesión y membresía verificadas; pruebas negativas de acceso entre empresas con el rol real de la API.
- Dos agentes de una empresa pueden consultar el mismo chat y conservan posiciones de lectura independientes.
- Listado, búsqueda y cursores probados; definir y verificar el comportamiento bajo cambios concurrentes.
- Detalle e historial reales; marcado de lectura validado y aislamiento de caché por identidad y empresa.
- Panel conectado con carga, ausencia de resultados, errores y reintentos, conservando los mensajes ya cargados.
- Pruebas de servicios, integración HTTP y base de datos, y navegación de escritorio y móvil.
- Formato, tipos, pruebas y compilación aprobados; documentación actualizada y sin secretos ni datos internos en respuestas.

Los tamaños de datos de prueba, presupuestos de rendimiento y criterios concretos de concurrencia quedan por acordar. No se considera completada esta entrega por haber documentado sus decisiones.

## Referencias consultadas

- [RLS en PostgreSQL 17](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
- [Índices y búsqueda con pg_trgm](https://www.postgresql.org/docs/17/pgtrgm.html)
- [Paginación por cursores en Slack](https://slack.engineering/evolving-api-pagination-at-slack/)
- [Sintaxis DBML](https://dbml.dbdiagram.io/docs/)
- [Migraciones con Drizzle](https://orm.drizzle.team/docs/migrations)
- [Organizaciones y membresías de Better Auth](https://better-auth.com/docs/plugins/organization)

## Mantenimiento de esta memoria

Actualizar este documento cuando se acuerde o cambie una regla de negocio. Registrar aquí la decisión y su alcance, reflejar sus consecuencias técnicas en arquitectura y conservar explícitos los asuntos pendientes. Las instrucciones nuevas del usuario tienen prioridad sobre decisiones anteriores.

## Autenticación aprobada para implementación

Se incorporan sesiones Better Auth en PostgreSQL sin caché positiva de sesión, correo y contraseña, cambio obligatorio de contraseña inicial y TOTP obligatorio para todos, con recuperación mediante códigos de un solo uso. Las integraciones usan OAuth client_credentials, tokens opacos de cinco minutos, permisos explícitos y una sola empresa. No hay registro público ni delegación de identidades humanas a integraciones.

Las personas pueden pertenecer a varias empresas; los roles fijos propietario, administrador y agente pertenecen a la membresía. Administradores gestionan agentes e integraciones, nunca propietarios. Solo propietarios gestionan propietarios y se protege al último propietario mediante serialización transaccional.

El bootstrap es explícito e idempotente, sin contraseñas predeterminadas, sin ascensos al arrancar y sin restablecer credenciales existentes. Los cambios sensibles requieren contraseña y segundo factor recientes. El contexto de empresa se verifica en cada solicitud, la caché del panel se limpia al cambiar de identidad/empresa y RLS refuerza la separación.

Se rechazan identidades simultáneas de cookie y Bearer. CSRF y orígenes permitidos se verifican en operaciones con cookies. El alta, revocación y cambios de permisos se auditan sin secretos. Los tokens se verifican sin caché positiva y no se emiten refresh tokens para integraciones. La recuperación sin factores requiere un procedimiento administrativo auditado; no habrá un bypass público.

El modelo de identidad se define en DBML antes de generar las migraciones Drizzle versionadas en el repositorio. No se ejecutan migraciones automáticas al iniciar la API.


### Estado de las migraciones de identidad

El [DBML de identidad](architecture/identidad.dbml) y el [procedimiento de migraciones](architecture/migraciones.md) fijan el modelo físico inicial de Better Auth 1.7.5. Incluyen membresía única por persona y empresa. Las migraciones no habilitan aún autenticación, permisos, bootstrap ni RLS; esas garantías deben implementarse y probarse antes de exponer datos de negocio.



### Avance de acceso de personas

Se implementaron sesiones Better Auth con PostgreSQL, cambio de clave inicial, TOTP, códigos de recuperación de un uso, CSRF y bootstrap idempotente. Continúan pendientes autorización por membresía, RLS, auditoría persistida, OAuth externo y conexión del panel. El detalle y los comandos están en arquitectura backend. No se considera completado el plan de autenticación.

## Bandeja conectada y sesiones — implementación inicial

Se implementan exclusivamente lectura de lista con búsqueda/cursor y detalle por UUID v7. Contactos y canales pertenecen a empresas; las claves compuestas y RLS impiden relaciones cruzadas. No hay mensajes, estados de lectura ni tiempo real en esta entrega. Los roles owner/admin/member existentes permiten lectura dentro de su membresía; no se habilitan integraciones OAuth de negocio todavía.

Se confirma sesión Better Auth por cookie, sin access/refresh tokens en el panel. Zustand coordina interfaz, expiración y empresa; Query conserva los datos remotos. Inicio y cierre se sincronizan entre pestañas del mismo origen, con confirmación de servidor. La renovación no borra empresa ni caché. Un 401 viejo no puede cerrar una sesión nueva. Cerrar cancela solicitudes y oculta datos de inmediato; el fallo de revocación se informa y ofrece reintento.

La conexión runtime tiene lectura sobre bandeja y no es propietaria ni puede desactivar RLS. Migraciones y semillas usan conexión administrativa separada. `seed:inbox` usa Faker reproducible y no cambia identidades ni datos ya existentes. Los contratos, límites y comandos están en docs/architecture/bandeja.md; la sesión en docs/architecture/frontend/sesion.md.
