# Sesión del panel

Better Auth es la autoridad de autenticación. Se mantienen sesiones PostgreSQL y cookie HttpOnly, SameSite=Lax y Secure en producción. No se añaden access/refresh tokens al panel ni se exponen tokens en JSON. La caché de sesión en cookie permanece desactivada. Duración: siete días; actualización permitida a partir de un día.

## Estado y responsabilidades

Zustand conserva exclusivamente la proyección de sesión necesaria para la interfaz: usuario, etapa, empresa elegida, vencimiento, errores y modal. Una instancia por aplicación, inyectable en pruebas. No se usa persist ni almacenamiento del navegador para credenciales/sesiones. TanStack Query conserva los datos de negocio.

Un coordinador central deduplica comprobaciones. Consulta al montar y al recuperar visibilidad/foco si han pasado 60 segundos; permite comprobaciones forzadas tras eventos de acceso. Sin polling. La API valida la sesión y membresía en cada operación; el store nunca concede permisos.

GET /api/acceso/estado devuelve usuario, etapa, venceEn, horaServidor y segundoFactorConfigurado, con disableRefresh. La renovación explícita utiliza GET /api/auth/get-session y su respuesta Set-Cookie oficial. Una prueba verifica que consultar no renueva y renovar sí propaga la cookie. La autorización de las rutas reutiliza la identidad validada durante esa solicitud, sin caché positiva entre peticiones.

## Expiración

Dos minutos antes de vencer aparece un AlertDialog con Cerrar sesión/Continuar. Continuar pide renovación al servidor. Una sesión expirada o revocada oculta los datos y requiere iniciar sesión de nuevo con sus factores.

Un 401 de una petición protegida activa el flujo. Un 403 de permisos, fallo de red o credenciales incorrectas en el formulario no significa sesión expirada. No se repiten mutaciones automáticamente. Las peticiones y mutaciones se vinculan a una generación local: respuestas anteriores no pueden restaurar o cerrar una identidad posterior.

## Pestañas y carreras

BroadcastChannel anuncia eventos, sin tokens ni datos personales. Como alternativa se usan eventos de almacenamiento con un identificador transitorio; el registro se elimina inmediatamente. Un aviso de inicio provoca una comprobación en servidor; no autentica por sí mismo. La renovación conserva la empresa/caché si la identidad sigue siendo la misma.

Cerrar sesión bloquea y limpia todas las pestañas antes de la revocación. Se comunica confirmación o fallo; el fallo ofrece reintento. Mientras el cierre está pendiente no se habilita ingreso. Las operaciones que cambian cookies se serializan con Web Locks del mismo origen, evitando que una respuesta tardía de logout elimine una cookie de un login posterior. El panel requiere un navegador moderno con Web Locks y contexto seguro (HTTPS o localhost).

La sincronización es entre pestañas del mismo perfil y origen. No implica eventos en tiempo real entre dispositivos; una revocación externa se detecta al consultar, al recuperar foco o al vencer. No se añade SSE.

## Acceso y empresas

Ingreso administrado, cambio inicial de contraseña, inscripción TOTP y recuperación mediante códigos de un solo uso. Los secretos de inscripción se muestran solo durante ese flujo y no se persisten. Una sola empresa se selecciona automáticamente; varias requieren elección. Cambiar empresa cancela consultas, limpia datos privados y compone un servicio vinculado a la nueva empresa.

## Pruebas

Vitest usa stores y QueryClient independientes, respuestas diferidas y canales inyectados para comprobar deduplicación, errores de red, respuestas tardías, renovación y cierre. Playwright usa dos páginas del mismo contexto para comprobar sincronización. PostgreSQL y Fastify verifican por separado cookies, CSRF, MFA, revocación y expiración reales.
