# Cumpleaños: correcciones de la revisión de Claude

Revisión del 06/11/2026 sobre `codex/cumple-neon`, después de `9d66f3e` y `9f27435`. Commits locales, sin push ni despliegue. Este informe complementa y actualiza las verificaciones pendientes de `cumple-neon-verificacion.md`.

Commits de código y pruebas: `f6ffffe2093f1c29493999ac8ba86f5846e70f6b` (controles, estilos y optimización) y `0b841928078d956d112b3492f9f8c411fe0455b3` (geometría durante la rotación). El informe se guarda en un commit posterior; su hash se identifica con `git log -1 --format=%H -- docs/cumple-neon-revision-claude.md`.

## Cambios

- `cumpleanos.html`: navegación nativa `.occasion-path`, botones de probar fuera de la figura que gira, eliminación de las tres pastillas interiores duplicadas, prioridad de las fuentes del encabezado y espera de fuentes después del primer pintado. La versión inglesa se genera desde esta fuente por el proceso existente.
- `sign.css` y `worlds.css`: área de clic inmóvil; pausa junto al eyebrow; composición móvil; astronauta oculto hasta 900 px; guirnalda sin filtro en su ancestro; animaciones de opacidad/transformación; pausa de todas las decoraciones fuera del viewport. Los estilos de los otros cuatro mundos se descargan al elegirlos. `transitions.css` se carga con las transiciones.
- `sign-hero.js`, `sign-runtime.js`, `work.js` y `styles/neon.js`: arranque repartido en tareas de idle, pared pintada por filas, carga de fuentes según la variante elegida, partículas ambientales limitadas a 30 fps y desactivadas en móvil/perfil estático. El bucle móvil termina cuando no hay chispas ni confeti de interacción.
- `lighting.js`: geometría de iluminación guardada en caché; solo se repintan ladrillos afectados. Variables de luz no heredadas, actualizadas exclusivamente en los elementos que las consumen, para evitar invalidar todo el hero durante cada parpadeo.
- El final del calentamiento de cada letra ya no dispara el recálculo de cables del letrero. Se agrupan las solicitudes de geometría, se elimina el segundo ajuste del mismo nombre y se calculan los extremos de los números SVG antes de insertar sus nodos en el DOM.
- Adaptaciones móviles de coste: guirnalda mecida como una sola capa, pista de XV con una capa de opacidad, grano de argón mediante máscara estática y eliminación de filtros en ancestros del letrero. Las transiciones móviles del hero interpolan transformación y opacidad; los colores y sombras cambian sin interpolación para evitar repintar cada descendiente durante la rotación. Los colores, textos, controles y cambios automáticos de nombre se conservan.
- `transitions.js`: Caja usa 300 ms para las mitades, 140 ms para los listones/moño, 200 ms para el jalón y 300 ms para la apertura.
- `birthday-sign.test.mjs`: comprobación del cálculo incremental de luz contra la suma de contribuciones y de la exclusión de ladrillos fuera de alcance.
- `check-birthday-sign-browser.mjs`: clic real en las cuatro tarjetas, con pausa y movimiento reducido; regreso al inicio antes de abrir el selector; anchura del texto de las ocasiones; letrero y fecha por encima de la barra inferior a 390×664.
- La prueba reducida encontró además que el moño de Caja interceptaba opciones del selector. El selector queda por encima del moño y su foco inicial no desplaza la página. El control móvil de pausa tiene fondo discreto y no lleva subrayado, para conservar contraste sobre los banderines. `--mobile-layout` permite repetir las 20 vistas de 390×664, comprobar la alineación de la pausa y verificar que las animaciones CSS se detengan fuera del viewport.
- `measure-birthday-sign.mjs`: mediciones repetibles de LCP, tareas largas, CPU y fps, con URL base y `CHROME_PATH`.

La maqueta externa `E:/Nordra Studio/Maquetas/cumpleanos-neon/index.html` recibió los mismos arreglos de tarjetas, astronauta móvil y tiempos de Caja. No se copió al repositorio. SHA-256: `DCDC3774B41B34DA799C5F5CA5F262224F7548B6E6CF69D84E36CC7D9FBD08DE`. Las capturas de referencia anteriores conservan los defectos corregidos.

## Verificación técnica

`npm run typecheck`, `npm test` y `npm run check:build` aprobados: 314 pruebas generales, 38 comprobaciones de invitaciones y las comprobaciones de Posada. El último se ejecutó después de verificar la ruta absoluta y eliminar exclusivamente el `dist` de este worktree. No se añadieron dependencias.

La ejecución completa inicial aprobó las **60 combinaciones principales** y se detuvo en el primer caso reducido por la intercepción del moño. Tras corregirla, se repitió Caja móvil y se aprobaron **12 combinaciones reducidas y 5 perfiles estáticos** (18 casos en esa tanda). No se usó `evaluate(click)` ni clic forzado. Se conservan tanto el resultado inicial con su fallo como la repetición aprobada; no se presenta como una única ejecución de 77 casos sin incidencias.

| Transición | Revisión anterior de Claude | Corrección, 12 mediciones por estilo |
|---|---:|---:|
| Neón | 1167–1210 ms | 1135–1153 ms |
| Caja | 1217–1323 ms | 1037–1153 ms |
| Bar | 1100–1123 ms | 1084–1119 ms |
| XV | 1224–1286 ms | 1177–1219 ms |
| Espacio | 1201–1208 ms | 1200–1204 ms |

Todas las transiciones medidas quedaron por debajo de 1300 ms. Las reducidas usan fundido y no insertan cohete, telón ni iris. Las cuatro tarjetas respondieron con clic real tanto en pausa como con movimiento reducido.

Después de los últimos ajustes de contraste y capas, se aprobaron otras **20 verificaciones a 390×664** (ES/EN × claro/oscuro × cinco estilos): navegación sin texto encimado, pausa en la línea del eyebrow, letrero/fecha sobre la barra, clic de pausa y todas las animaciones CSS del hero pausadas fuera del viewport. Se inspeccionaron visualmente capturas de los cinco estilos en escritorio y móvil, incluidos inglés, oscuro y las tarjetas. Las capturas móviles finales están en `browser-mobile-final`.

Tras optimizar la construcción SVG se repitieron XV en inglés con 15/30, las 12 combinaciones reducidas, los 5 perfiles estáticos y las 20 vistas móviles: todo aprobado. Esa última tanda funcional está en `browser-svg-final` y `browser-mobile-final`.

## Método de medición

Edge 156.0.4314.58, build de Vite preview en `http://127.0.0.1:5217`, escritorio 1440×900 y móvil táctil 390×844 con CPU ×4. Contexto nuevo y caché desactivada en cada carga; mediana de tres cargas para LCP/bloqueo. CPU: `Performance.getMetrics`, diferencia de `TaskDuration` en una ventana de 10 segundos, tras esperar el letrero listo y otros 10 segundos; cuadros contados con `requestAnimationFrame`. Las rotaciones de nombres siguen funcionando durante la muestra. Las pruebas de navegador y compilaciones no se ejecutaron simultáneamente con la medición final.

El JSON guarda tanto el bloqueo posterior a FCP (suma de la parte bloqueante de tareas largas dentro de la ventana de carga de 10 s) como la suma completa incluyendo tareas anteriores a FCP. No es una auditoría Lighthouse con detección de TTI. Los valores de main y de la rama anterior proceden de la revisión de Claude; no se ha vuelto a medir main en este entorno. Esta distinción evita presentar métodos potencialmente distintos como una comparación exacta.

La [definición de TBT de Chrome](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time) comienza en FCP y termina en TTI. Aquí se conserva una ventana fija de 10 s y se informa también del trabajo previo, sin llamar a esa suma completa TBT de Lighthouse.

## Resultados de rendimiento

| Métrica | main (Claude) | Rama anterior (Claude) | Corrección (Edge) |
|---|---:|---:|---:|
| LCP escritorio | 164 ms, h1 | 220 ms, h1 | 180 ms, h1 |
| LCP móvil ×4 | 508 ms, img | 616 ms, p.lead | 516 ms, p.lead |
| TBT escritorio | 0 ms | 0 ms | 0 ms posterior a FCP |
| TBT móvil ×4 | 9 ms | 541 ms | 76 ms posterior a FCP |
| Bloqueo móvil incluyendo antes de FCP | No aportado | No aportado | 409 ms |

LCP móvil: +8 ms frente a la base de Claude, dentro del margen de 100 ms. Las tres cargas móviles finales fueron 524/504/516 ms; el valor publicado es la mediana, sin descartar la primera. TBT posterior a FCP: 75/76/80 ms, dentro de 150 ms. **La suma que incluye tareas previas a FCP no cumple 150 ms**: 409/76/418 ms, mediana 409 ms. Claude no aportó su fórmula de TBT; si incluyó esas tareas en sus 541 ms, debe comparar con 409 ms, no con 76 ms. No se declara equivalencia entre esas dos métricas.

| Estilo | Antes escritorio: % · ms/cuadro | Después escritorio: % · ms/cuadro | Antes móvil ×4: % · ms/cuadro · fps | Después móvil ×4: % · ms/cuadro · fps |
|---|---|---|---|---|
| main | 1,1 · 0,19 | No repetido | 5 · 0,84 · 60 | No repetido |
| Neón | 20 · 3,35 | 8,33 · 1,40 | 54 · 10,4 · 52 | 21,18 · 3,61 · 58,63 |
| Caja | 9,7 · 1,61 | 2,53 · 0,42 | 40 · 6,6 · 60 | 8,29 · 1,38 · 60,01 |
| Bar | 14,5 · 2,41 | 5,55 · 0,92 | 43 · 7,3 · 58 | 13,92 · 2,33 · 59,82 |
| XV | 23 · 3,88 | 9,26 · 1,54 | 62 · 12,0 · 52 | 15,16 · 2,54 · 59,65 |
| Espacio | 18 · 2,96 | 8,81 · 1,47 | 58 · 10,3 · 57 | 13,75 · 2,30 · 59,82 |

Los cinco estilos cumplen ≤4 ms/cuadro y ≥58 fps en la muestra móvil final. Se repitió la serie completa de escritorio y móvil sobre el build definitivo de `0b84192`. Neón tiene el menor margen: se hicieron además tres ventanas móviles de 10 s sobre ese mismo código, con 3,689/3,759/3,738 ms por cuadro y 58,505/58,678/58,459 fps. Las tres cumplen; conviene repetirlo en el equipo de Claude y en teléfono físico.

Datos finales sin redondear: `performance-release.json`; repeticiones de Neón en `performance-neon-layout-1.json`, `performance-neon-layout-2.json` y `performance-neon-layout-3.json`. Las mediciones intermedias de investigación no son resultados finales.

Evidencia fuera del repositorio: `E:/Nordra Studio/Maquetas/cumpleanos-neon/verificacion-codex/`. Incluye los JSON, las capturas de las tandas descritas, este informe y los logs de `typecheck`, `test` y `check:build` en `checks/`.

## Reproducir

```powershell
$env:CHROME_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$env:BIRTHDAY_EVIDENCE = 'E:/Nordra Studio/Maquetas/cumpleanos-neon/verificacion-codex/browser'
node scripts/check-birthday-sign-browser.mjs http://127.0.0.1:5217
$env:BIRTHDAY_EVIDENCE = 'E:/Nordra Studio/Maquetas/cumpleanos-neon/verificacion-codex/mobile-layout'
node scripts/check-birthday-sign-browser.mjs http://127.0.0.1:5217 --mobile-layout
$env:BIRTHDAY_PERFORMANCE_OUTPUT = 'E:/Nordra Studio/Maquetas/cumpleanos-neon/verificacion-codex/performance-release.json'
node scripts/measure-birthday-sign.mjs http://127.0.0.1:5217
```

## Alcance visual y revisión adicional

La comprobación en Edge ahora está disponible. Las capturas e interacciones comprobadas se detallan en los resultados anteriores. **No verificado visualmente** en WebKit/iPhone físico ni en otros motores; sonidos no comprobados audiblemente. Tampoco se ha hecho una comparación de píxel de todos los fotogramas intermedios contra las 100 referencias.

Claude debe revisar especialmente la equivalencia perceptual del grano de argón móvil, las sombras del letrero sin filtro en sus ancestros, el movimiento conjunto de la guirnalda móvil, la iluminación incremental de los ladrillos y la pista de XV con una capa en vez de 96 animaciones. Son los cambios donde la optimización exige mayor atención visual. Las tres portadas siguen pendientes de la aprobación del usuario.
