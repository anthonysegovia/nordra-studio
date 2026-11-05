# Bodas · Los dos anillos

Implementado en `/bodas` y `/en/bodas`, sin push ni despliegue. Rama `codex/bodas-anillos`, creada desde `origin/main` actualizado, `0c161cfd7868ee3f53c1f165268eec820e252428`.

Worktree: `C:\Users\USER\.codex\worktrees\bodas-anillos\nordra-studio-premium`.

La referencia fue exclusivamente `E:\Nordra Studio\Maquetas\bodas-anillos\index.html`. Se estudió el código completo y se ejecutaron «Repetir entrada» y «Modo oscuro» en Chrome del sistema. El navegador integrado bloqueaba `file://`; la revisión se realizó sirviendo la carpeta original por HTTP local con Playwright y Chrome, sin modificarla.

## Implementación y fidelidad

La geometría, materiales, luces, shaders, mezclas, cantidades, tiempos y cálculos de `resize()` provienen de la maqueta. Se conservan el diamante con cuatro garras y entorno propio, la entrada macro, el trazo premultiplicado One/One, motas, polvo con DOF, bokeh, seda/reflejo/ondas/cáusticas, grabado, pétalos, rayos/velas, MSAA y los cuatro niveles de bloom con composición ACES. No se sustituyó el bloom ni se redujeron los valores de escritorio para obtener los FPS.

El perfil móvil conserva LITE: 520 partículas, 9 pétalos, 160 motas, 10 discos de bokeh y DPR máximo 1,5. Se preservaron el arrastre con resorte, toque con giro y chispas, apertura al desplazarse, sello y `touch-action:pan-y`. El sonido se sintetiza localmente, empieza apagado y requiere un clic explícito.

Se conserva la subnavegación, el eyebrow, el texto y los dos enlaces del hero. La fotografía aprobada pasa a la primera sección, en arco, junto a la introducción y controles existentes de la muestra; el escenario de invitación/panel continúa debajo. No se añadieron textos de demostración ni se duplicó contenido. Precios, planes, FAQ y demás textos permanecen intactos. Inglés usa el sistema de plantillas/traducción existente; no mantiene un segundo hero independiente.

### Adaptaciones necesarias al sitio

- Texto y botones son legibles desde el primer pintado, en lugar de esperar la aparición de la maqueta: es la adaptación requerida para LCP. El trazo dorado conserva su entrada cuando empieza la escena. Las comparativas muestran esa diferencia deliberada en 0,4 s y 2 s.
- Se mantiene Cormorant Wedding ya alojada en Bodas. Pinyon Script es un subconjunto WOFF2 local para «para siempre» y «forever», con licencia OFL y procedencia en `public/fonts/wedding/`. No hay solicitudes a Google Fonts desde la página.
- Se utiliza Three.js **0.181.0**, ya declarada en el proyecto, en lugar de la CDN 0.169.0 de la maqueta, conforme al encargo. No se añadieron dependencias npm.
- La navegación existente ocupa el espacio superior del hero. Los controles se sitúan en ese espacio, lejos del diamante: Chrome táctil ajustaba un toque cercano al botón de pausa cuando éste estaba debajo del texto.
- La entrada ocurre una vez por sesión; las siguientes visitas empiezan en reposo. Móvil requiere «Ver en movimiento». El loader espera carga, primer pintado y tiempo libre; Three y la escena quedan en importación dinámica.
- Pausa/reducción/perfil estático muestran el retrato final, sin indicación interactiva. Pausar detiene RAF y audio; ocultar la pestaña o salir del hero también detiene RAF/audio. `pagehide` libera renderer, targets, geometrías, materiales, texturas, observadores, listeners y AudioContext; la restauración persistida reconstruye el loader.
- La verificación de escritorio descubrió WebGL en dos controladores decorativos anteriores (`motion.js` y `nordra-theatre.js`). Sólo para Bodas en pausa inicial, movimiento reducido o hardware/Save-Data estático, ahora seleccionan su alternativa ligera existente. Así el perfil estático de la página completa crea cero contextos WebGL; otras páginas conservan su selección anterior.
- La hoja de estilos se importa desde el entry de Bodas y se consolida mediante el mecanismo existente de `build/site-styles.mjs`. `check-site-bundles` también impide que `rings-scene` entre en los imports iniciales.

No se encontró un elemento de la escena que exigiera cambiar los parámetros aprobados. Partículas y bokeh tienen posiciones aleatorias; comparar cuadros no implica igualdad de píxeles entre motores/versiones. Los tamaños y cantidades permanecen iguales.

## Verificación

Los tres comandos se ejecutaron después del commit de implementación, con `git status --short` vacío y eliminando previamente únicamente `dist/` del worktree:

- `npm run typecheck`: aprobado.
- `npm test`: 297 + 38 pruebas aprobadas; comprobación adicional de la demo Posada aprobada.
- `npm run check:build`: aprobado, incluida hoja única, carga diferida, entradas de despliegue y presupuestos de los otros módulos.

Chrome del sistema: `C:/Program Files/Google/Chrome/Application/chrome.exe`, versión 156.0.8078.80. `scripts/check-wedding-rings-browser.mjs` usa un servidor Vite local y sólo instrumenta respuestas interceptadas por Playwright; no se publica ninguna variable de depuración en la escena.

La matriz ES/EN × claro/oscuro × 1440×900/390×844 táctil pasó: título accesible con el texto completo, sonido inicialmente `false`, sin desbordamiento horizontal ni errores del hero, canvas tras carga, toque con giro completo, arrastre y regreso a vuelta completa, pausa sin cambios durante un segundo, foto y sello al desplazarse. Media de render: **59,9956–60,0064 fps**, superior a 50 fps en los cuatro casos de escritorio. Error angular residual del resorte inferior a 0,00012 rad.

Las **40 combinaciones** de ES/EN, tema, tamaño y perfil (reduce, 3 núcleos, memoria 2 GB, Save-Data, pausa inicial) dieron **0 contextos WebGL**, retrato correcto e indicación oculta. El recorrido móvil incluyó activación explícita, toque, arrastre y desplazamiento hasta foto/sello.

Prueba adicional de ciclo de vida: no hay AudioContext antes del clic; el clic lo activa; ocultar el documento suspende audio y RAF; salir del hero detiene RAF; una visita repetida inicia en reposo; `pagehide` elimina el canvas y la restauración persistida reconstruye la escena. La visibilidad y restauración persistida se estimularon con eventos/propiedades del navegador de pruebas.

En local, `/_vercel/insights/script.js` devuelve 404 porque pertenece al hosting. El navegador de pruebas lo sustituye por una respuesta vacía; la analítica no forma parte de esta comprobación. No se ocultaron errores de los recursos del hero.

## Rendimiento antes/después

Tres navegaciones por versión y perfil, sobre builds de producción: baseline extraído de `origin/main` y build del worktree. Contexto nuevo y caché HTTP desactivada en cada navegación. Los recursos públicos sin cambios se compartieron con la baseline; los nuevos retratos no están referenciados por su HTML. Ambos perfiles exponen cuatro núcleos y 8 GB. Escritorio: 40 ms de latencia, 10 Mbps, CPU ×1. Móvil: 150 ms, 1,6 Mbps, CPU ×4, sin activar el 3D.

Medianas:

| Perfil | LCP antes | LCP después | Diferencia | TBT observado antes | TBT observado después |
|---|---:|---:|---:|---:|---:|
| Escritorio 1440×900 | 656 ms | 700 ms | +44 ms | 0 ms | 170 ms |
| Móvil 390×844 | 3400 ms | 2784 ms | -616 ms | 54 ms | 0 ms |

El incremento de LCP de escritorio es **+44 ms**; móvil mejora **616 ms**. Se cumple el límite de +100 ms en ambos perfiles.

LCP se recoge con PerformanceObserver. **TBT observado** es la suma de `max(0, duración − 50 ms)` de las long tasks desde FCP hasta los primeros 10 segundos de navegación; no es una puntuación Lighthouse ni una medición de campo/TTI. En escritorio la primera preparación de shaders produjo **1817 ms** acumulados, frente a 136 y 170 ms en las siguientes muestras. Ese pico permanece: no se alteraron los parámetros de la maqueta para disimularlo. La carga del 3D se realiza después del primer pintado. Datos y método completos: `E:\Nordra Studio\Revision Signature\bodas-anillos\performance.json` y `measure.mjs`.

## Retratos

Captura reproducible: `npm run dev -- --port 5198`, después `node scripts/capture-wedding-rings-posters.mjs`. El script usa el módulo real, reloj fijado a reposo, semilla para las partículas, Chrome y Sharp ya declarado. Oculta texto, controles y navegación, y amplía sólo el área de captura manteniendo las dimensiones del hero para evitar el recorte del compositor de Chrome. No escribe PNG en el repositorio.

| Archivo | Tamaño |
|---|---:|
| `rings-poster-dark-desktop.webp` | 46,556 B |
| `rings-poster-dark-mobile.webp` | 11,360 B |
| `rings-poster-dark-wide.webp` | 62,784 B |
| `rings-poster-light-desktop.webp` | 32,286 B |
| `rings-poster-light-mobile.webp` | 7,776 B |
| `rings-poster-light-wide.webp` | 44,888 B |

Todos están por debajo de 150 KB. FontTools/Brotli se usaron únicamente fuera del repositorio para convertir el subconjunto Pinyon recibido en TTF a WOFF2; no son dependencias de ejecución ni de build.

## Comparativas y evidencia externa

Cada pareja muestra maqueta a la izquierda y port a la derecha, con hero de 1440×900 y reloj de escena fijado en 0,4 s, 2 s, 3,9 s y reposo (7,8 s). Se revisaron las ocho: encuadre macro, cámara, cierre, geometría, trazo y postproceso se conservan. Texto inicial visible, controles del sitio, tipografía existente y distribución aleatoria del fondo explican las diferencias visibles. Se retiró la navegación ajena al hero de la captura, no del sitio.

- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-light-0.4s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-light-2s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-light-3.9s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-light-rest.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-dark-0.4s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-dark-2s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-dark-3.9s.jpg`
- `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\side-by-side-dark-rest.jpg`

Hoja de las ocho: `E:\Nordra Studio\Revision Signature\bodas-anillos\comparisons\contact-sheet.jpg`.

En `E:\Nordra Studio\Revision Signature\bodas-anillos\` quedan también `compare.mjs`, `inspect-reference.mjs`, `measure.mjs`, `lifecycle.mjs`, los logs `typecheck-final.log`, `tests-final.log`, `build-final.log`, la baseline y los resultados `browser/browser-results.json`, `browser/browser-static-results.json`, `browser/lifecycle.txt`. Las capturas del recorrido ES/EN y foto/sello están en `browser/`.

## Límites

No se probó un iPhone físico ni Safari. Chrome táctil emula tamaño/entrada, no representa todos los dispositivos. No se escuchó la salida de audio: se comprobó opt-in y estado del AudioContext. La restauración BFCache se ejercitó mediante eventos sintéticos, no una navegación nativa de Safari. El benchmark es local, no producción ni datos de usuarios reales. No se hizo push ni despliegue.

## Archivos tocados y commits

- `AGENTS.md`
- `bodas.html`
- `public/artwork/wedding-rings/rings-poster-dark-desktop.webp`
- `public/artwork/wedding-rings/rings-poster-dark-mobile.webp`
- `public/artwork/wedding-rings/rings-poster-dark-wide.webp`
- `public/artwork/wedding-rings/rings-poster-light-desktop.webp`
- `public/artwork/wedding-rings/rings-poster-light-mobile.webp`
- `public/artwork/wedding-rings/rings-poster-light-wide.webp`
- `public/fonts/wedding/Pinyon-OFL.txt`
- `public/fonts/wedding/Pinyon-source.txt`
- `public/fonts/wedding/pinyon-script-subset.woff2`
- `scripts/capture-wedding-rings-posters.mjs`
- `scripts/check-site-bundles.mjs`
- `scripts/check-wedding-rings-browser.mjs`
- `scripts/wedding-rings-browser-support.mjs`
- `scripts/wedding-rings.test.mjs`
- `src/i18n/bodas.en.json`
- `src/site/entries/weddings.js`
- `src/site/scripts/motion.js`
- `src/site/scripts/nordra-theatre.js`
- `src/site/wedding-rings/rings-hero.js`
- `src/site/wedding-rings/rings-scene.js`
- `src/site/wedding-rings/rings.css`
- `src/site/wedding-rings/state.js`
- `documentacion/bodas-anillos/informe.md` (este informe).

Commits de implementación:

- `d44e3ea316a5889777bb0a4c370b374948856fb0` — hero, loader, retratos, tipografía, pruebas y documentación de diseño.
- `9da93db8c4f394a00adbd8f6dfb4f77404d1df59` — perfiles estáticos heredados y captura completa de retratos.

El informe se añade en un commit documental posterior. El checkout principal sigue en `codex/inicio-brillo-telefono`, `858035ace8640c77a36c15440e3b4ae071ee53d7`, conservando sus tres carpetas no rastreadas previas. No se modificó.
