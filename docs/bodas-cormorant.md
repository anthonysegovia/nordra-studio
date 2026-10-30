# Bodas · Títulos con Cormorant

Propuesta local del 30 de octubre de 2026. Rama `codex/bodas-cormorant`, creada
desde `main` en `02bed81`. Sin push ni despliegue.

## Cambio

- Los h1, h2 y h3 editoriales de `body[data-scene="bodas"]` usan la Cormorant
  romana existente, con el alias CSS `Cormorant Wedding`. El alias limita los
  ajustes ópticos a estos títulos; no cambia la familia Ivory de la invitación.
- Peso 450, ampliación óptica del 20% mediante `size-adjust`, espaciado −0,035em;
  las dos líneas del hero usan −0,045em. Se conservan los tamaños CSS responsivos,
  interlineados, márgenes y estructura de la página.
- Las métricas del alias compensan la ampliación: ascendente 80,833333%, descendente
  24,166667%, espacio entre líneas 0%. El resultado conserva las cajas de línea
  anteriores: 0,97em y 0,29em tras aplicar el factor 1,2.
- La frase «algo muy suyo» permanece unida para conservar el salto móvil
  «Hagamos / algo muy suyo», sin modificar el texto ni introducir un salto en escritorio.
- Los títulos editoriales de la sección de planes también usan Cormorant. Nombres,
  precios, descripciones, tablas, navegación y botones permanecen en Manrope.
  El encabezado del mini panel está excluido del tratamiento editorial y queda en
  Manrope. Su estructura y funcionamiento, y el panel independiente, no se modifican.
- `bodas.html` precarga únicamente `cormorant-latin-roman.woff2`, con `crossorigin`
  y `fetchpriority="low"`. No se usa cursiva: no se descarga ni se precarga.
- Sin fuentes nuevas ni conexiones a Google Fonts. En la entrada directa se solicitan
  Cormorant romana (80.624 bytes) y Manrope (36.228 bytes); Sora no se descarga en Bodas.
  La fuente romana supone 56.044 bytes más que la Sora anterior, con el mismo número
  de peticiones de fuente.

Los cambios de ejecución están únicamente en `bodas.html` y
`src/site/styles/signature.css`. La foto aprobada, sus atributos, los marcadores de
precios, AGENTS.md, tokens, src/styles, public/, la invitación marfil y el panel
independiente permanecen sin modificaciones.

## Verificación visual y navegación

- Cuatro capturas completas antes y cuatro después: claro/oscuro × 375/1440 px.
- Ocho capturas de navegación por versión: desde Inicio e Invitaciones, en ambos
  temas y tamaños. Desde Inicio se sigue Inicio → Invitaciones → Bodas mediante
  los enlaces `data-go` existentes. Atrás y adelante conservan fuente, tema y pausa.
- Los títulos visibles conservan sus palabras por línea, alturas y posiciones
  verticales a 375 y 1440 px. Cambian las formas y anchos propios de la tipografía.
- Paletas calculadas idénticas, también en oscuro. La posición y dimensiones del
  contenedor de la foto coinciden exactamente en entrada directa y navegación:

| Ancho | X antes/después | Y antes/después | Contenedor, ancho × alto antes/después |
|---|---:|---:|---|
| 375 px | 22 / 22 | 413,4375 / 413,4375 | 331 × 377 / 331 × 377 px |
| 1440 px | 750 / 750 | 338 / 338 | 626 × 620 / 626 × 620 px |

El contenedor incluye el pie de foto; ni la imagen ni su recorte se modifican.

- Las otras siete páginas se compararon antes/después en los cuatro escenarios:
  28 casos con estilos calculados y geometría idénticos. Conservan Sora, incluida
  la tarjeta Valentina y Sebastián de Inicio; no solicitan Cormorant.
- 72 casos de navegador en total: 36 por versión. Sin errores de consola,
  ejecución ni respuestas HTTP fallidas. Una sola hoja CSS compilada por página.

## LCP de Bodas

Mismo método que `docs/signature-lcp.md`: build de producción con Vite preview,
Chrome 156.0.8078.79, viewport 375 × 900 / DPR 1, CPU ×4, red de 10 Mbit/s de bajada,
5 Mbit/s de subida y 40 ms de latencia, caché fría y contexto nuevo. Tema claro,
movimiento activo; último candidato tras `load` + 6 segundos. Tres rondas por
versión, orden alternado en la segunda, sin otros navegadores de prueba ni builds
concurrentes. Referencia 02bed81 en puerto 5388; propuesta en 5389.

| Versión | Ronda 1 | Ronda 2 | Ronda 3 | Mediana |
|---|---:|---:|---:|---:|
| Antes, Sora | 976 ms | 988 ms | 960 ms | 976 ms |
| Después, Cormorant | 960 ms | 972 ms | 944 ms | 960 ms |

Diferencia: **−16 ms (−1,6%)**. No se observa empeoramiento en estas rondas; una
diferencia tan pequeña no demuestra una mejora de rendimiento para usuarios reales.
El LCP sigue siendo `aurora-mobile-1.webp`, sin cambiar el renderer ni la textura.

## Checks y evidencias

- `npm run typecheck`: correcto.
- `npm test`: 116 pruebas principales + 34 checks, todos correctos; Posada correcto.
  Incluye design-tokens y las siete pruebas de horizon-flow.
- `npm run check:build`: compilación de las 15 entradas y ambos verificadores correctos.
- `git diff --check`: correcto. Material no rastreado previo intacto y excluido.

Capturas para aprobación y datos completos fuera del repositorio:
`E:/Nordra Studio/Revision Signature/2026-10-30-bodas-cormorant/`.

- `galeria.html`: 12 comparaciones, 24 capturas; entrada directa y navegación interna.
- `before/`, `after/`: PNG completos y datos de captura.
- `before-geometry.json`, `after-geometry.json`: medidas y saltos de títulos / foto.
- `before-verification.json`, `after-verification.json`: 72 casos de navegador.
- `paired-lcp.json`, `lcp.mjs`: las seis mediciones y el harness reproducible.
- Logs de typecheck, test y check:build.

Pendiente únicamente de aprobación visual antes de autorizar una publicación por Git.
