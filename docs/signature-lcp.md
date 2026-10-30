# T7 · Diagnóstico de LCP y comprobación de T1

Medición local del 30 de octubre de 2026, **sin aplicar las optimizaciones propuestas
para T7**. El ajuste de fuente y su precarga pertenecen a T1.

## Método

- Referencia: build de b547640, extraído con `git archive`, servido por Vite preview
  en 5188. Propuesta: build de esta rama, servido en 5189.
- Chrome 156.0.8078.79 en Windows, headless; viewport 375 × 900, DPR 1, modo móvil.
- CPU ×4 mediante CDP; red configurada a 10 Mbit/s de bajada, 5 Mbit/s de subida y
  40 ms de latencia. Caché deshabilitada, contexto nuevo por navegación, tema claro,
  movimiento activo. No son mediciones de usuarios reales ni resultados de Lighthouse.
- Tres rondas por página y versión: 48 navegaciones. Orden antes/después alternado
  en la segunda ronda. Sin otro navegador de pruebas ni compilaciones concurrentes.
- `PerformanceObserver` registra todos los candidatos LCP; se toma el último tras
  `load` + 6 s, sin interacción. Resource Timing y eventos CDP registran bytes,
  prioridades y tiempos. Se reporta la mediana; el desglose corresponde a la
  navegación que produjo esa mediana, no a medianas independientes que no sumen.
- Una primera pasada detectó el coste de la fuente de 40.172 bytes. La versión final
  usa 24.580 bytes y precarga con prioridad baja; los datos siguientes son de esa versión.

## Tres rondas y medianas

Todos los tiempos están en milisegundos. Un delta positivo es una subida.

| Página | Antes: 3 rondas | Después: 3 rondas | Mediana antes | Mediana después | Delta |
|---|---|---|---:|---:|---:|
| Inicio | 604 / 564 / 636 | 672 / 656 / 652 | 604 | 656 | +52 |
| Estudio | 828 / 708 / 724 | 768 / 732 / 768 | 724 | 768 | +44 |
| Negocios | 1280 / 1232 / 1192 | 1008 / 984 / 1016 | 1232 | 1008 | -224 |
| Invitaciones | 896 / 848 / 932 | 892 / 912 / 988 | 896 | 912 | +16 |
| Bodas | 976 / 988 / 1008 | 1024 / 996 / 1040 | 988 | 1024 | +36 |
| Cumpleaños | 976 / 1004 / 1004 | 960 / 964 / 996 | 1004 | 964 | -40 |
| Eventos | 1100 / 1108 / 1000 | 992 / 1036 / 1028 | 1100 | 1028 | -72 |
| Temporada | 1072 / 1092 / 996 | 960 / 964 / 940 | 1072 | 960 | -112 |

**El requisito estricto de T1 «que el LCP no empeore» no queda acreditado en todas
las páginas.** Inicio sube 52 ms, Estudio 44 ms, Invitaciones 16 ms y Bodas 36 ms;
las otras cuatro bajan. Hay variación entre rondas y solo tres muestras: no permiten
atribuir cada diferencia exclusivamente a Sora ni garantizar equivalencia en otros
dispositivos. El punto queda señalado para revisión antes de publicar, sin declarar
una mejora universal ni ampliar T7 a implementación.

## Elemento, bytes y prioridad

En las seis páginas solicitadas el candidato final es `.mobile-aurora img`, una
imagen decorativa creada por JavaScript; no es el titular ni la fotografía de portada.
Está bajo `/nordra/v541/assets/`. El elemento contiene `decoding="async"`, ancho 840
por alto 546 y `alt=""`. La prioridad inicial es **Low**, promovida a **High** durante
la carga; no tiene `fetchpriority` explícito. Inicio tiene otro LCP: la imagen de la
primera tarjeta de servicios, `.horizon-path-photo`.

Bytes de cuerpo transferido (`encodedBodySize`); la columna total usa `transferSize`
y añade los 300 bytes de cabeceras contabilizados por Resource Timing en esta prueba.

| Página | Archivo | Cuerpo, bytes | Transferencia, bytes | Prioridad inicial → final |
|---|---|---:|---:|---|
| Inicio | `negocios-720.webp` | 37444 | 37744 | Medium → High |
| Estudio | `aurora-mobile-0.webp` | 61404 | 61704 | Low → High |
| Negocios | `aurora-mobile-0.webp` | 61404 | 61704 | Low → High |
| Invitaciones | `aurora-mobile-0.webp` | 61404 | 61704 | Low → High |
| Bodas | `aurora-mobile-1.webp` | 61954 | 62254 | Low → High |
| Cumpleaños | `aurora-mobile-2.webp` | 62286 | 62586 | Low → High |
| Eventos | `aurora-mobile-3.webp` | 60458 | 60758 | Low → High |
| Temporada | `aurora-mobile-6.webp` | 62504 | 62804 | Low → High |

## Cadena hasta pintar

HTML → CSS y módulo de entrada → inicialización de `motion.js` →
`NordraMobileAurora.create()` en `mobile-aurora.js` → asignación de `img.src` →
descarga / decodificación → pintura. La imagen no es descubrible en el HTML inicial.
Los intervalos siguientes incluyen espera y ejecución; no se confunden con tiempo
puro de CPU del módulo.

| Página | TTFB | Espera hasta pedir imagen | Carga de imagen | Espera de pintura | LCP |
|---|---:|---:|---:|---:|---:|
| Negocios | 3.8 | 691.4 | 101.2 | 211.6 | 1008 |
| Invitaciones | 3.6 | 700.3 | 157.4 | 50.7 | 912 |
| Bodas | 3.6 | 860.2 | 108.2 | 52.0 | 1024 |
| Cumpleaños | 3.9 | 800.8 | 105.6 | 53.7 | 964 |
| Eventos | 3.9 | 846.4 | 126.1 | 51.6 | 1028 |
| Temporada | 3.4 | 761.8 | 108.7 | 86.1 | 960 |

Tiempos desde la navegación, para la ronda mediana de cada página:

| Página | CSS termina | Módulos terminan de descargar | Se pide la textura | Textura termina | Pintura LCP |
|---|---:|---:|---:|---:|---:|
| Negocios | 239 | 205 | 695 | 796 | 1008 |
| Invitaciones | 261 | 227 | 704 | 861 | 912 |
| Bodas | 273 | 239 | 864 | 972 | 1024 |
| Cumpleaños | 246 | 210 | 805 | 910 | 964 |
| Eventos | 238 | 209 | 850 | 976 | 1028 |
| Temporada | 272 | 239 | 765 | 874 | 960 |

El mayor intervalo está antes de descubrir la textura. La descarga de unos 60–63 KB
consume aproximadamente 100–157 ms en este perfil; comprimirla por sí sola no elimina
la dependencia de JavaScript. La fuente nueva añade una petición de 24.580 bytes;
la franja de T5 no pide sus tres imágenes durante la carga inicial.

## Propuestas para una etapa posterior

Estimaciones de ingeniería basadas en los intervalos anteriores, **no resultados
medidos ni garantías**. No son acumulables; habría que comparar cada cambio por separado.

| Propuesta | Dónde | Impacto estimado en este perfil | Condición |
|---|---|---|---|
| Precargar únicamente la textura inicial correcta con `as="image"`, media móvil / puntero grueso y prioridad alta | Negocios e Invitaciones: 0; Bodas: 1; Cumpleaños: 2; Eventos: 3; Temporada: 6 | 0–150 ms: solapar descarga con inicialización; no elimina la espera de pintura | Evitar descargar texturas móviles en escritorio o precargar todas las paletas |
| Perfilar y diferir la preparación de secciones fuera de pantalla antes de insertar la aurora | Las seis; atención a Bodas, Cumpleaños y Eventos | Hipótesis de 100–300 ms si el trabajo aplazado pertenece al camino crítico | Medir una traza de CPU y preservar orden, pausa, animaciones y navegación |
| Evaluar un póster móvil presente desde HTML, reutilizado por el renderer | Las seis | Potencial de 200–500 ms si logra pintar antes de la inicialización | Requiere propuesta propia y comparación visual; no alterar el renderer aprobado en esta etapa |
| Evaluar variantes de textura según tamaño real y DPR, conservando la suavidad | Las seis | Ahorrar 20 KB equivale a unos 16 ms de transferencia a 10 Mbit/s; LCP puede no variar | Medir el ancho real del campo: no asumir que equivale al viewport ni reducir calidad a ciegas |

La prioridad es descubrir y pintar antes el recurso existente, no esconder la aurora
para cambiar artificialmente el candidato LCP. Tampoco propongo más precargas de
fuentes: Sora ya tiene una y Manrope se descubre desde la hoja.

La separación entre espera, carga y pintura sigue el método de
[web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp). Los datos de laboratorio
sirven para diagnosticar; no sustituyen medición de usuarios reales.

## Evidencia reproducible local

Carpeta externa: `E:/Nordra Studio/Revision Signature/2026-10-30-etapa-1/`.

- `lcp.mjs`: harness CDP / Playwright; ejecución final `node lcp.mjs paired 5189`.
- `paired-lcp.json`: 48 registros finales, candidatos, Resource Timing y peticiones.
- `lcp-summary.json`: selección de medianas y desgloses.
- `paired-lcp-initial.json`: primera pasada conservada para trazabilidad, no usada
  en la tabla final.
- `before/`, `after/`, `galeria.html`: 32 pares visuales de la versión final.

Los puertos corresponden a dos compilaciones locales, sin conexión con producción.
