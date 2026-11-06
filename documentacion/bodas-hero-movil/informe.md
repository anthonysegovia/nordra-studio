# Hero de Bodas en teléfono

Fecha: 5 de noviembre de 2026. Rama: `codex/bodas-hero-movil`, creada desde `origin/main` actualizado, `dd9881a`. Sin push ni publicación.

## Implementación

Commit de implementación: `95808d4`. Ajuste de aislamiento de telemetría en la prueba: `8d4b11f`. Corrección del nombre del campo de altura en los resultados: `5ac5860`.

`6daebd2` añade la comprobación de orientación y hace que el encuadre siga `narrowQ.matches`, no el perfil de calidad fijado al crear la escena. `57f0ca0` registra las comprobaciones terminadas antes de repetir la validación limpia final.

- `bodas.html`: iconos de pausa/reproducción y de inicio; texto accesible; retrato móvil independiente del alto de pantalla; grupos SVG con límites de pintura explícitos.
- `src/site/wedding-rings/rings.css`: composición de teléfono, fila superior, pastillas, tipografía 11/40/56/16 px, acciones apiladas, escenario de 380 px, controles circulares, estados de interacción y transición sin separador al sello. Se conserva la hoja compilada única de Bodas.
- `src/site/wedding-rings/rings-hero.js`: elimina `fitPhone`, `--rings-available-height` y sus observadores. Coloca la navegación existente dentro del flujo móvil y la devuelve a su lugar al cruzar 700 px; limpia y reconstruye correctamente esa colocación al restaurar desde BFCache. El botón de sonido conserva su nombre accesible cuando su texto queda oculto visualmente.
- `src/site/wedding-rings/rings-scene.js`: la cámara LITE toma el escenario móvil como referencia, sin incluir el texto en el cálculo de su centro. Conserva materiales, shaders, calidad y cronología.
- `src/site/scripts/business-motion.js`: actualiza el texto accesible sin borrar el SVG del botón. Las demás páginas mantienen sus botones de texto.
- Seis retratos `public/artwork/wedding-rings/rings-poster-{light,dark}-mobile*.webp`, regenerados con `scripts/capture-wedding-rings-posters.mjs`. El sitio usa el retrato móvil común: ya no elige encuadre por altura del teléfono. Se conservan los nombres short/tall para las capturas reproducibles del script.
- `scripts/check-wedding-rings-browser.mjs`: sustituye las aserciones de altura igual a la pantalla por altura estable según contenido; desplaza el botón a la vista antes de tocarlo y conserva la comprobación de que recibe el toque, carga el canvas y no queda bajo la barra.
- `scripts/check-wedding-mobile-hero-browser.mjs`: matriz móvil Chrome/WebKit, capturas comparativas y comprobación del título con/sin máscara.

La pareja, la muestra, los precios, el encabezado y la barra inferior no se modificaron. La versión inglesa sigue generándose desde la plantilla compartida.

## Causas y decisiones

**«p» en WebKit.** Se reprodujo con el mismo archivo de fuente y el mismo texto. Al retirar la máscara directamente aplicada al `<text>`, reaparecía el descendente; Chrome lo mostraba en ambos casos. Mover la máscara a un grupo por sí solo no bastaba: WebKit seguía calculando una superficie que excluía el trazo saliente. Un rectángulo transparente dentro del grupo amplía sus límites de pintura (`x=-100`, `y=-40`, `1100×280`), conservando la máscara y la animación. La comprobación final compara las capturas con y sin máscara, tolerando únicamente diferencias de rasterización de hasta 16 niveles por canal.

**Línea suelta.** `scroll-travel.js` añade un `.travel-thread` de 1 px a cada `.home-continuation`. En `#bodas-respuesta` quedaba exactamente en la unión hero/sello. Se oculta solo ese separador, conservando el degradado y el sello; los demás separadores del sitio permanecen.

**Solapamiento del encabezado.** La regla móvil con `margin-top:-132px`, combinada con el relleno fijo y el cálculo de alto disponible, levantaba el hero por debajo de la navegación. Se elimina esa regla, el relleno compensatorio y la compresión para pantallas de menos de 720 px. En teléfono, el hero y el aviso de idioma participan en el flujo normal.

**Diferencias deliberadas respecto a la maqueta.** Se conserva el encabezado real, de 68 px, frente a los 64 px de la referencia. Las pastillas miden 40 px para cumplir el área táctil mínima solicitada, frente a 34 px visuales en la maqueta. Se mantiene la fuente Cormorant local del sitio, además de Pinyon y Manrope, sin nuevas dependencias ni peticiones de fuentes externas. El SVG móvil reserva una caja de 57 px para Pinyon a escala de 56 px, con desbordamiento visible para sus descendentes. El escenario contiene la escena real y su retrato regenerado; no se sustituye por la imagen plana de la maqueta.

## Verificación

En `95808d4`, con `git status --porcelain` vacío y eliminando el `dist/` del worktree antes de empezar:

- `npm run typecheck`: correcto.
- `npm test`: 305 + 38 pruebas correctas, más comprobaciones de Posada; cero fallos.
- `npm run check:build`: correcto, incluidos bundles, entradas de Vercel y presupuestos de recursos.

Los tres comandos se repitieron correctamente en limpio en `57f0ca0`, que incluye la corrección de orientación de `6daebd2`, de nuevo sin `dist/` previo. Logs: `typecheck-final.log`, `tests-final.log`, `build-final.log`.

La misma escena creada en escritorio se comprobó después a 390 → 800 → 1440 → 390 px. Todos los puntos proyectados de los anillos permanecieron dentro del escenario; en teléfono este siguió midiendo 380 px. La prueba conserva el perfil de calidad original y cambia únicamente el cálculo de composición según el ancho actual. Resultados: `mobile-results-resize-chrome.json`. Los encuadres de las cargas iniciales ya verificados no cambian con este ajuste.

`check-wedding-sample-browser.mjs`: 12 combinaciones correctas (1440, 390 y 375 px; ES/EN; claro/oscuro), incluidas pestañas, teclado, toque, captura real del panel y ausencia de desbordamiento.

La matriz nueva cubrió las cuatro resoluciones, ambos temas y cuatro estados por resolución: `/bodas` en español sin aviso, `/bodas` con `en-US` y aviso visible, el mismo caso después de cerrar el aviso y `/en/bodas`.

| Motor | Casos móviles | Título / texto / eyebrow | Toques y canvas | Errores del sitio / desbordamiento |
|---|---:|---|---|---|
| Chrome del sistema | 32 | 40 / 16 / 11 px | Correctos | 0 / ninguno |
| Playwright WebKit | 32 | 40 / 16 / 11 px | Correctos | 0 / ninguno |

En cada caso se comprobó `elementFromPoint` sobre Invitaciones, la posición del hero después del encabezado, pausa y reanudación con toque real, las cuatro pastillas y el botón de movimiento. Para comprobar las pastillas sin abandonar cada documento, un listener de prueba cancela su navegación después de recibir el clic generado por `touchscreen.tap`; se comprueba el destino real de cada enlace. No se generan clics sintéticos. El botón de movimiento se desplaza a la vista antes de tocarlo y se exige un canvas WebGL.

Las ocho comparaciones del título (dos motores × 390/1440 px × claro/oscuro) tuvieron **cero canales de píxel con diferencia superior a 16/255** entre la versión enmascarada y la versión sin máscara, incluido el descendente. Los recortes reservan margen exterior para no cortar el propio trazo en la captura.

`verified-mobile-results.json` reúne los 64 casos y las ocho comparaciones. El primer JSON usaba `height` tanto para el viewport como para el hero: el consolidado recupera la altura del viewport del orden fijo de casos y comprueba la existencia de cada captura correspondiente; conserva la altura del hero en `heroHeight`. `5ac5860` corrige ese nombre para futuras ejecuciones. No se modificaron los resultados de las aserciones.

`check-wedding-rings-browser.mjs`: **64 casos correctos**: ocho recorridos ES/EN, claro/oscuro y escritorio/móvil; cuatro tamaños/temas móviles adicionales; 12 combinaciones del aviso de idioma; 40 perfiles estáticos. Giro por toque, arrastre, retorno, pausa, foto y sello conservan sus resultados. Los recorridos animados midieron 59,8–60 fps. La mayor tarea durante la preparación de la escena de escritorio fue 68 ms en la primera visita ES/claro; las demás mediciones de primera visita y repetición no registraron tareas largas en ese intervalo. Se mantiene el límite de 200 ms del script.

`check-aurora-startup-browser.mjs`: **12 combinaciones correctas**, sin modificar el script ni sus límites, sobre el build final. Un Chrome nuevo por página y tema, 1440×900; observación de tareas largas e instrumentación de llamadas WebGL; recorrido de todas las secciones, pausa y movimiento reducido.

| Página | Máxima atribuible claro | Máxima atribuible oscuro | Contextos aurora/cintas al cargar | Al terminar el recorrido |
|---|---:|---:|---:|---:|
| `/` | 0 ms | 0 ms | 0 | 0 |
| `/bodas` | 0 ms | 0 ms | 0 | 3 |
| `/eventos` | 72 ms | 0 ms | 2 | 5 |
| `/temporada` | 0 ms | 0 ms | 1 | 2 |
| `/invitaciones` | 0 ms | 0 ms | 2 | 5 |
| `/en/bodas` | 0 ms | 0 ms | 0 | 3 |

`0 ms` significa que no hubo entradas de tarea larga (≥50 ms) atribuibles, no que la ejecución no consumiera tiempo. Los contextos de esta tabla son los de auroras y cintas; no incluyen la escena de anillos. Ninguna tarea atribuible superó 100 ms; todos los campos comprobados dibujaron y respetaron pausa y movimiento reducido, sin errores de página.

La primera pasada se detuvo en `/eventos` oscuro con `Visible field animates`, mientras se ejecutaba también la comprobación adicional de orientación. Se conserva `aurora.log` con ese fallo; no se atribuye una causa definitiva. Se repitió la matriz completa aislada, con los otros navegadores de prueba cerrados y el build final, y pasó sin cambiar aserciones. La tabla corresponde exclusivamente a `aurora-final/after-results.json`.

## Evidencias y reproducción

Carpeta fuera del repositorio:

`C:\Users\USER\.codex\visualizations\2026\11\05\01a1ab9a-d1f4-7e71-b46c-e156d8b307df\bodas-hero-movil`

- `typecheck.log`, `tests.log`, `build.log`.
- `verified-mobile-results.json`: los 64 casos móviles y las ocho comparaciones del título.
- `rings/browser-results.json` y `rings.log`: regresión completa de anillos.
- `sample/results.json` y `sample.log`: regresión de pareja y muestra, sin modificar su script.
- `aurora-final/after-results.json` y `aurora-final.log`: matriz fría final y capturas de sus secciones.
- `compare-{ancho}x{alto}-{tema}.png`: maqueta a la izquierda y sitio a la derecha, para 390×664, 390×844, 375×667 y 412×915.
- `{motor}-{ancho}x{alto}-{tema}-{estado}-initial.png`, `-title.png`, `-scene.png`: estado inicial, título y escena tras toque real. Estados: `es`, `notice`, `closed`, `en`.
- `{motor}-{ancho}-{tema}-title-complete.png` y `-title-unmasked.png`: comparación de máscara a 390 y 1440 px.
- `webkit-390-title-before.png` y `webkit-390-unmasked.png`: reproducción original del recorte y aislamiento de su causa.

El script móvil usa `RINGS_URL`, `HERO_EVIDENCE` (obligatoria, fuera del repo), `HERO_WEBKIT_MODULE` y `PLAYWRIGHT_BROWSERS_PATH` cuando se necesita el WebKit ya instalado. Chrome es el del sistema. El WebKit disponible corresponde al paquete Playwright 1.48.2 del entorno de auditoría; el paquete principal del proyecto no se cambió. `HERO_SUITE=visual` ejecuta solo las comparaciones del título y de la maqueta.

No se ha comprobado Safari en un iPhone físico ni las barras dinámicas de Safari real. La verificación solicitada usa WebKit de Playwright y contextos móviles con toque; 390×664 representa el espacio reducido por las barras.

En la primera ejecución WebKit encontró un 403 externo de `https://va.vercel-scripts.com/v1/speed-insights/script.debug.js`. La prueba final responde con un script vacío a ese dominio y a `/_vercel/`, sin enviar telemetría ni depender de su servicio de depuración. No filtra los errores del producto; todos siguen haciendo fallar la prueba. La carga del SDK externo de telemetría queda fuera de esta verificación local.
