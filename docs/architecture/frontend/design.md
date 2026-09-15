# Diseño del frontend

## Propósito

Este documento es la fuente de verdad visual para `apps/panel`. El panel debe sentirse claro, tranquilo y operativo: una herramienta de trabajo para atender conversaciones, no una aplicación de marketing.

El panel incluye tema claro y oscuro. Ambos se construyen con los mismos tokens semánticos, no mediante colores definidos dentro de componentes.

## Principios

- La prioridad visual es leer y responder conversaciones con rapidez.
- El azul comunica acción principal y control; el verde identifica el canal WhatsApp o éxito, pero no reemplaza el color principal de la aplicación.
- Los estados críticos usan color, icono y texto. El color nunca es la única señal.
- No se escriben valores hexadecimales, RGB ni clases de color arbitrarias dentro de componentes de funcionalidades.
- Cada color debe tener un rol semántico y un token; si no existe un rol, no se agrega un color.

## Paleta base aprobada

La identidad combina azul, púrpura y blanco en modo claro; el modo oscuro usa negro puro como fondo. El azul identifica acciones y mensajes salientes. El púrpura distingue navegación seleccionada, acentos y automatización. Las superficies neutrales permiten leer conversaciones sin saturar la interfaz.

La separación entre fondos, estados interactivos y texto sigue el criterio de [composición de paletas de Radix](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette). Los valores siguientes son tokens propios del panel y se declaran en `styles.css`.

| Token | Claro | Oscuro |
| --- | --- | --- |
| `--background` | `#f7f8fc` | `#000000` |
| `--foreground` | `#181826` | `#f5f5fa` |
| `--card` | `#ffffff` | `#111115` |
| `--card-foreground` | `#181826` | `#f5f5fa` |
| `--popover` | `#ffffff` | `#19191f` |
| `--popover-foreground` | `#181826` | `#f5f5fa` |
| `--primary` | `#2563eb` | `#8ab4ff` |
| `--primary-foreground` | `#ffffff` | `#08152d` |
| `--secondary` | `#eaf0ff` | `#152443` |
| `--secondary-foreground` | `#1e3a8a` | `#c7d9ff` |
| `--muted` | `#f0f1f7` | `#202027` |
| `--muted-foreground` | `#606174` | `#b0b0c0` |
| `--accent` | `#f0eaff` | `#2b1942` |
| `--accent-foreground` | `#6b21a8` | `#dec5ff` |
| `--destructive` | `#b91c1c` | `#fca5a5` |
| `--destructive-foreground` | `#ffffff` | `#350b0b` |
| `--border` | `#d9dce8` | `#34343f` |
| `--input` | `#85899c` | `#717183` |
| `--ring` | `#2563eb` | `#8ab4ff` |
| `--sidebar` | `#ffffff` | `#0b0b0e` |
| `--sidebar-foreground` | `#24243a` | `#f5f5fa` |
| `--sidebar-primary` | `#6d28d9` | `#c4a0ff` |
| `--sidebar-primary-foreground` | `#ffffff` | `#1c0b35` |
| `--sidebar-accent` | `#f0eaff` | `#2b1942` |
| `--sidebar-accent-foreground` | `#6b21a8` | `#dec5ff` |
| `--sidebar-border` | `#d9dce8` | `#34343f` |
| `--sidebar-ring` | `#6d28d9` | `#c4a0ff` |

## Interacción y conversaciones

- Acciones principales: `primary` con `primary-foreground`; foco con `ring`.
- Navegación activa: `sidebar-accent` con `sidebar-accent-foreground`; acción destacada del sidebar con `sidebar-primary`.
- Mensaje entrante: `card` con `card-foreground`, alineado a la izquierda.
- Mensaje saliente: `secondary` con `secondary-foreground`, alineado a la derecha.
- Mensaje del bot: `accent` con `accent-foreground`, acompañado por icono y texto de identificación.
- Texto secundario: `muted-foreground` sobre superficies neutrales.
- Bordes decorativos: `border`; campos editables: `input`, con mayor contraste.
- Errores: `destructive` más un mensaje o icono. El verde se reserva para WhatsApp conectado o éxito cuando esos estados se implementen; cada estado nuevo debe definir tokens para ambos temas.
- La selección, el foco y los estados deben reconocerse también por su forma, texto o icono.

## Implementación con Tailwind y shadcn

- Tailwind CSS v4 es la única capa de estilos del panel. Se usa el enfoque mobile-first de Tailwind (`md:`, `lg:` y `xl:`); no se escriben media queries manuales en archivos CSS de componentes.
- Los tokens se declaran una única vez en `apps/panel/src/styles.css` como variables CSS y se conectan al tema de Tailwind v4 y shadcn.
- shadcn/ui es la fuente de todas las primitivas visuales. No se crean botones, menús, campos, diálogos, tooltips, avatares, paneles o controles de navegación desde cero.
- Los componentes de `features` componen variantes semánticas de shadcn (`default`, `secondary`, `destructive`, etc.) y nunca valores de color directos.
- Una nueva composición se crea solo cuando combina componentes shadcn para resolver una necesidad del dominio; no duplica primitivas que shadcn ya ofrece.
- Los iconos deben llevar texto visible o `aria-label` cuando expresen una acción o estado.

### Composición del layout

El marco del panel reutiliza componentes shadcn de esta forma:

| Necesidad | Componentes shadcn |
| --- | --- |
| Escritorio | `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarMenu` y `SidebarMenuButton`. |
| Usuario actual | `Avatar`, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent` y `DropdownMenuItem`. |
| Navegación móvil inferior | `Tabs`, `TabsList`, `TabsTrigger`, `Button` e iconos. Se compone como barra fija, no como una primitiva propia. |
| Confirmaciones y feedback | `AlertDialog`, `Dialog`, `Sonner` y `Tooltip`. |

La misma lista de opciones de navegación alimenta el `SidebarMenu` en escritorio y los `Tabs` en móvil. `Sidebar` y `SidebarInset` son hermanos: dentro de `SidebarInset`, la barra horizontal del usuario aparece antes de `main` y de `Outlet`. Alinea sus controles a la derecha en este orden: cambio de tema, selector de idioma, información visible del usuario y menú de acciones. Por tanto, pertenece al layout y no a una vista ni al sidebar. Tailwind decide visibilidad: el sidebar usa `hidden md:flex`; la navegación inferior usa `fixed inset-x-0 bottom-0 md:hidden`; el contenido usa `pb-20 md:pb-0`.

La Bandeja mantiene su encabezado independiente. Debajo, la cola, el panel de mensajes y el contexto son hermanos con `flex-col` en móvil y `xl:flex-row` en escritorio. La lista usa ancho fijo de `20rem`, el contexto `18rem` y la conversación ocupa el espacio flexible central.

La Bandeja ofrece un modo enfoque mediante `Collapsible` de shadcn: contrae su contexto superior y métricas sin ocultar la identidad mínima de la vista. En ese estado, la fila de conversaciones crece hasta el borde inferior disponible y el panel de mensajes ocupa toda esa altura.

No se permite crear un archivo CSS por componente para posicionar o hacer responsive el layout. Las excepciones son estilos globales, tokens del tema y casos que Tailwind no pueda representar; deben documentarse antes de agregarse.

Los dropdowns de Hilo conservan la accesibilidad de shadcn/Radix, pero se personalizan como parte de la marca: contenedor con radio `2xl`, borde visible, sombra elevada y opciones con radio `xl`. No se usa el menú rectangular genérico de la configuración inicial.

### Tema e internacionalización

- El tema se aplica con la clase `oscuro` en `html` y persiste en la cookie `tema-panel`. Es una preferencia no sensible y, por ello, es legible desde JavaScript y **no** usa `HttpOnly`; lleva `SameSite=Lax` y `Secure` cuando la aplicación se sirve por HTTPS.
- La sesión de Better Auth es independiente: sus cookies sí deben ser `HttpOnly`, `Secure` y no se reutiliza ninguna cookie de preferencias para autenticación.
- `react-i18next` gestiona los textos del panel. Los recursos viven en `src/internacionalizacion/recursos.ts`, el español es el idioma de reserva y la selección se guarda en la cookie `idioma-panel` con la misma política de seguridad de preferencias.

## Accesibilidad

- Texto normal: contraste mínimo WCAG AA de `4.5:1`.
- Texto grande y componentes gráficos: contraste mínimo de `3:1`.
- Todo control interactivo tiene foco visible usando `--ring`.
- Los estados se expresan mediante icono y texto, además del color.

Antes de aprobar una combinación nueva, validarla con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

## Exploración de paletas

Para explorar alternativas, usar [Coolors](https://coolors.co/) y bloquear como punto de partida `#2563EB`, `#6D28D9`, `#FFFFFF` y `#000000`. Una paleta exploratoria no se considera aprobada hasta que:

1. Se asignen roles semánticos a sus colores.
2. Pase la verificación de contraste.
3. Se actualice este documento antes de aplicarse en código.


### Contraste de la paleta aplicada

Comprobación de luminancia relativa sRGB de los tokens, sin opacidad: texto sobre acción principal 5,17:1 en claro y 8,70:1 en oscuro; texto sobre acento púrpura 7,44:1 y 10,25:1; texto secundario sobre superficie muted 5,39:1 y 7,57:1. Los bordes input sobre card alcanzan 3,47:1 y 3,94:1. Estos cálculos validan esos pares; los estados con transparencia requieren comprobar su mezcla efectiva y no equivalen a una auditoría visual completa.
