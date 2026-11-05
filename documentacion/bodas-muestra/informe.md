# Bodas · composición de pareja y muestra

Rama `codex/bodas-muestra`, creada desde `origin/main` actualizado en `1b5afc9`. Mismo worktree. Sin push ni despliegue.

## Resultado y alcance

Se implementó la opción «Con la pareja» de `E:\Nordra Studio\Maquetas\bodas-muestra\index.html`. Se abrió en Chrome y se revisaron Computadora, Teléfono y ambos pasos. El hero real conserva su escena; sólo se añadió el fundido inferior. No se copió la imagen «Final del hero» de la maqueta.

La foto conserva el recurso aprobado, ahora con `height:auto`, proporción 4:5, encuadre `50% 30%`, arco y ancho máximo de 380 px. La pareja queda al lado del texto en escritorio y encima en móvil. Se amplió la fuente Pinyon WOFF2 alojada para los nombres, incluida la á. La frase nueva está traducida mediante el diccionario de Bodas.

Título, nota, pasos, enlaces y dispositivos comparten una composición de escritorio inferior a 900 px de alto. En móvil el orden es título, nota, pasos, dispositivo activo, crédito y enlaces. El teléfono mide 190 px; el panel ocupa el ancho disponible. Se conservan las imágenes, srcset, alt, enlaces, ARIA, teclado, selección del dispositivo posterior y el ancla `#bodas-panel-muestra`.

El sello existente conserva su entrada de trazo bajo el hero, con hilo vertical. Un sello pequeño sustituye la división antes de Planes. Se eliminan sólo en estas dos secciones las líneas generadas por `scroll-travel`. Los textos y precios de Planes y las demás secciones no cambian. Los colores de la muestra son locales; no se modificaron los tokens globales.

## Adaptaciones respecto de la maqueta

- «01 / 02» es una excepción limitada y expresamente solicitada en este encargo a la preferencia general de AGENTS.md. Se ocultan al lector de pantalla por ser decorativos.
- El escenario móvil usa la altura del dispositivo activo en vez de los 440 px fijos y los 70 px superiores del panel de la maqueta: así no deja un hueco grande al cambiar de paso.
- Se conserva íntegro el crédito existente «Valentina & Sebastián · Un diseño de Nordra · Ciudad de México», aunque la maqueta sólo presenta la segunda parte. También se conservan las indicaciones de idioma que añade el sitio a sus enlaces en inglés.
- El hilo móvil empieza debajo del hero, sin el margen negativo de la maqueta, para no invadir «Ver en movimiento». En escritorio se conserva el solape de 34 px.
- Los movimientos de dispositivos usan `translate`, `scale` y `rotate` independientes. Ningún control se centra con `transform`, para que la presión global no sustituya su posición. Pausa y movimiento reducido eliminan las transiciones.
- El indicador horizontal genérico de `interaction-motion` se oculta sólo en estos pasos: la indicación activa es la barra de la maqueta.
- La referencia original sólo existe en español y claro. Las comparativas oscuras aplican a la referencia únicamente los neutros cálidos pedidos, sin editar el archivo original; la referencia sigue en español para contrastar también la distribución inglesa. La franja superior de referencia sigue siendo una imagen; la versión implementada usa el hero real.

## Archivos tocados

- `bodas.html`: separación de pareja y muestra, sello/hilo, pasos y sello de Planes.
- `src/site/styles/wedding-sample.css`: composición, tamaños, colores locales, estados, animaciones y adaptaciones móviles.
- `src/site/entries/weddings.js`: inclusión de esa hoja en el bundle único de Bodas.
- `src/site/wedding-rings/rings.css`: retirada de la antigua distribución de `.rings-story-head`; se conserva la animación del sello.
- `src/i18n/bodas.en.json`: frase nueva y nombres separados en dos líneas.
- `public/fonts/wedding/pinyon-script-subset.woff2` y `Pinyon-source.txt`: subconjunto ampliado y procedencia.
- `scripts/check-wedding-rings-browser.mjs`: única ampliación, prueba de proporción 0,8 ± 0,01 en la foto a 1440 y 390 px, ambos idiomas/temas. No se relajó ninguna comprobación previa.
- `scripts/check-wedding-sample-browser.mjs`: matriz visual, toque real, teclado, ancla, geometría, errores, pausa y movimiento reducido.
- `scripts/site-modules.test.mjs`: registra la nueva hoja en el orden esperado del bundle de Bodas. `check-site-bundles` sigue exigiendo una única hoja compilada por página.

`wedding-stage.js`, shaders, motor de anillos, auroras, dependencias y precios no cambiaron.

## Alturas antes y después

Altura de `#bodas-respuesta`, en CSS px, medida con las fuentes cargadas. Claro y oscuro dan el mismo resultado. El escenario móvil ya no reserva espacio para el dispositivo oculto.

| Viewport | Antes ES | Después ES teléfono / panel | Después EN teléfono / panel |
|---|---:|---:|---:|
| 1440×900 | 2639,70 | 1496,50 / 1496,50 | 1506,70 / 1506,70 |
| 390×844 | 2501,84 | 1668,20 / 1530,58 | 1642,70 / 1505,08 |
| 375×667 | 2487,00 | 1654,31 / 1504,97 | 1628,81 / 1479,47 |

La medida móvil inicial difiere de los 2522 px orientativos del encargo: aquí se midieron 2501,84 px en 390×844, locale es-MX, sin aviso de idioma y con movimiento reducido. `before.json` conserva la geometría exacta. Antes, la foto medía 524×1500, 306×1500 y 291×1500 respectivamente. Después, su cociente ancho/alto es 0,8 en los doce casos.

## Verificación

Commit final de código y pruebas: `883cdfd` (hash completo en `verified-commit.txt`). Worktree limpio antes de eliminar `dist/` y ejecutar:

- `npm run typecheck`: aprobado.
- `npm test`: 305 + 38 = **343 pruebas**, más Posada, aprobadas.
- `npm run check:build`: aprobado, incluidos bundles y presupuestos.
- Matriz de muestra: **12 casos aprobados** (1440×900, 390×844, 375×667 × ES/EN × claro/oscuro), sin scroll horizontal ni errores de consola o de página. Toque real mediante `page.touchscreen.tap` en ambos pasos móviles; el dispositivo activo queda completo por encima de la barra inferior. Teclado de escritorio: flechas, Home/End, y pulsación de dispositivos posteriores. Ancla de panel comprobada.
- Pausa y movimiento reducido: doce comprobaciones suplementarias independientes, registradas en `motion-preferences.json`.
- Regresiones completas de auroras y anillos: pendientes de incorporar al terminar.

Las capturas y la matriz de muestra usan el build de producción local. Los servicios de telemetría exclusivos de Vercel se simulan vacíos en la prueba local; los demás errores de recursos siguen provocando un fallo. La última modificación del script separa movimiento reducido de pausa; esa aserción se ejecutó adicionalmente en los doce casos sin mantener la pausa activa.

## Evidencia y commits

Carpeta externa: `C:\Users\USER\.codex\visualizations\2026\11\05\01a1ab9a-d1f4-7e71-b46c-e156d8b307df\bodas-muestra`.

- Índice visual navegable externo: `comparativas.html`.
- Comparativas: `{es,en}-{light,dark}-{1440,390,375}-{transition,couple,cover,panel}-comparison.jpg`: referencia a la izquierda, implementación a la derecha. 48 comparativas.
- Las capturas individuales usan el mismo nombre sin `-comparison`; la referencia añade `-reference`. Capturas completas adicionales de cada paso: `*-cover-full.jpg` y `*-panel-full.jpg`.
- `before.json`, `results.json`, `motion-preferences.json`, `sample.log`, `typecheck.log`, `tests.log`, `build.log`, `verified-commit.txt`.

Commits locales:

- `7f17626`: composición y primera matriz.
- `7dd1877`: registro de nombres divididos en el diccionario inglés.
- `c54d696`: variables locales y registro de la hoja en la prueba del bundle.
- `6ded219`: simulación de telemetría en la prueba local.
- `883cdfd`: comprobación independiente de movimiento reducido.

No se probó Safari/iPhone físico ni se publicó para validar producción remota. Chrome del sistema y toque emulado de Playwright cubren la matriz solicitada.
