# Bandeja conectada

## Contratos

La API expone únicamente lectura:

- `GET /api/empresas/:idEmpresa/conversaciones?busqueda=&limite=20&cursor=`
- `GET /api/empresas/:idEmpresa/conversaciones/:idConversacion`

Los contratos Zod compartidos definen contacto, canal, resumen opcional y fecha ISO. El ID de conversación es UUID v7; la empresa conserva el ID textual de Better Auth. Una petición malformada devuelve 400; sin sesión, 401; sin MFA/cambio inicial completo o membresía autorizada, 403; recurso ausente o de otra empresa, 404.

La búsqueda admite 100 caracteres y compara nombre, teléfono y último resumen. No distingue mayúsculas; sí distingue acentos. Compara también los dígitos del teléfono. Los comodines se escapan y SQL está parametrizado. El límite es 1–100, predeterminado 20.

El cursor Base64URL firmado con HMAC SHA256 contiene versión, empresa, huella de búsqueda, posición y vencimiento de 15 minutos. No es cifrado ni contiene credenciales. La clave se deriva del secreto de autenticación con un contexto exclusivo. Alteración, vencimiento o filtros diferentes devuelven 400. La posición es última actividad descendente e ID descendente; se consulta un registro extra. No hay total ni número de página. La actividad concurrente puede mover conversaciones: no es una instantánea; el panel deduplica por ID y permite actualizar.

## Persistencia y aislamiento

[DBML](bandeja.dbml) describe contactos, canales_whatsapp y conversaciones. Fechas con zona horaria y precisión de milisegundos; UUID v7 para IDs propios. Las relaciones empresa/contacto y empresa/canal son claves compuestas. Una conversación por empresa/contacto/canal. El borrado de padres es restringido.

Drizzle CLI genera las migraciones; la migración personalizada de FORCE RLS también se registra mediante su CLI. El esquema de Better Auth sigue siendo salida de su CLI oficial, sin modificarlo manualmente.

Las tres tablas usan ENABLE y FORCE RLS. Cada consulta establece `hilo.id_empresa` con `set_config(..., true)` dentro de su transacción; además filtra por empresa explícitamente. Sin contexto no hay filas. La pertenencia y los roles owner/admin/member se comprueban en la aplicación antes del repositorio y en cada solicitud.

El runtime no debe ser propietario de tablas, esquema ni base, ni tener superusuario, BYPASSRLS, administración de roles, membresías heredadas o CREATE en public. El comando `pnpm db:configure-runtime` configura un rol separado; el arranque comprueba estas restricciones. Solo SELECT sobre bandeja; identidad conserva las escrituras necesarias para Better Auth. La conexión administrativa sirve para migraciones, bootstrap y seeder, nunca para arrancar la API.

## Frontend

La aplicación real compone el servicio HTTP al confirmar usuario y empresa; la instancia captura ese contexto. Las claves Query incluyen ambos IDs. Las rutas conservan archivos anidados, UUID validado antes del loader y `ensureQueryData`.

La búsqueda vive en URL, se normaliza y aplica tras 300 ms. El listado usa consultas infinitas y AbortSignal. Conserva páginas ante un fallo de carga adicional. No presenta pendientes ni no leídos ficticios. El detalle muestra contacto, canal, resumen y actividad; no llama a mensajes, SSE ni WebSocket.

Las pruebas antiguas de mensajes utilizan un router exclusivo de demostración dentro de `pruebas`; no se incluye en la entrada productiva.

## Seeder

`pnpm seed:inbox` requiere SEED_COMPANY_ID y URL_BASE_DE_DATOS_ADMIN. SEED_COUNT: 100 por defecto, rango 1–1000. SEED_VALUE: 20260915 por defecto, entero 0–2147483647.

Usa Faker español, UUID v7 de Faker y referencia fija de fecha. La misma empresa y semilla reproducen IDs y datos; ampliar cantidad conserva los registros anteriores. Una transacción y un bloqueo por empresa serializan ejecuciones. Se insertan filas faltantes y se verifican pertenencia/relaciones; no se sobrescriben cambios reales. Cambiar de semilla en una empresa ya sembrada puede producir conflictos telefónicos: se rechaza todo el lote.

Solo PostgreSQL local y entornos desarrollo/pruebas. No crea usuarios, credenciales, mensajes ni recursos externos.

## Pruebas

Vitest cubre contratos, firma, búsqueda y cursores, autorización HTTP, RLS con rol restringido, validación de ownership y seeder idempotente. PostgreSQL de pruebas debe ser local y terminar en _pruebas. Ejecutar migraciones antes de suites de repositorio aisladas.

Playwright verifica el panel mediante respuestas HTTP controladas, varias pestañas, recarga, errores y móvil. Las pruebas HTTP de Fastify usan Better Auth y PostgreSQL reales con inject; Playwright no sustituye esas verificaciones.
