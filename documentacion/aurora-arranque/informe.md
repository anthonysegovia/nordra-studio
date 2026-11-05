# Arranque de auroras en escritorio

## Seguimiento BFCache

Rama `codex/aurora-bfcache`, creada tras actualizar `origin/main` en `2f833916b7f959c05bd28ec6698be00e1b2dd110`. Commit de código verificado: **`c3962b74c9605097a5a7d164f202f1f27457fc76`**. Mismo worktree, sin push ni despliegue.

### Ciclo de vida y archivos tocados

- `src/site/webgl/page-lifecycle.js`: distingue `pagehide.persisted` de una salida definitiva. La primera pausa; `pageshow.persisted` reanuda; la segunda libera y retira sus listeners. Admite varias idas y vueltas sin perder los handlers.
- `src/site/webgl/lazy-aurora.js`: conserva el controlador y los contextos al entrar en BFCache, desconecta sus observadores y vuelve a observar al regresar. Espera una nueva intersección antes de iniciar campos pendientes, por si cambió el viewport. `reset()` cancela sólo el intento del campo perdido y lo devuelve a la cola perezosa, sin duplicar campos sanos. La compilación también detecta contextos perdidos durante su espera.
- `src/site/scripts/motion.js`: pausa RAF y observadores sin retirar el canvas ni llamar a `loseContext()` en una salida persistente. Al volver redibuja con los valores actuales y reanuda según visibilidad, pausa y movimiento reducido. Comprueba tanto el evento `webglcontextlost` como `gl.isContextLost()`. Si hace falta, sustituye sólo ese canvas, conserva tiempo/paleta/apertura/intensidad y vuelve a cargar con el fundido normal.
- `src/site/scripts/nordra-theatre.js`: conserva capítulos y contextos en BFCache; restablece observadores y listeners de scroll/resize, redibuja y recupera cintas perdidas por el mismo flujo perezoso.
- `scripts/aurora-lifecycle.test.mjs`: pruebas de pausa, conservación, restauración repetida, liberación definitiva y reanudación/reset de trabajos pendientes. `scripts/lazy-aurora.test.mjs` y `scripts/mobile-aurora.test.mjs` adaptan sus entornos simulados al helper de ciclo de vida.
- `scripts/check-aurora-bfcache-browser.mjs`: navegación real, comprobación de `pageshow.persisted`, identidad y dibujo de los canvas, recorrido posterior hasta las cintas y prueba separada de recuperación de contexto.

No cambiaron GLSL, colores, perfiles de calidad, `src/site/scripts/mobile-aurora.js` ni ningún archivo del hero de anillos. Los wrappers conservan también la textura móvil al pausar temporalmente, usando su API existente; su renderer no se modifica. Los cuatro hashes GLSL coinciden con `origin/main`. Tampoco se modificaron `check-aurora-startup-browser.mjs` ni `check-wedding-rings-browser.mjs`.

### Prueba de Atrás real

Build de producción servido localmente, 1440×900, claro y oscuro. Se abre cada página, se desplaza hasta una aurora intermedia, se navega mediante navegación completa a `/cumpleanos` y se ejecuta `page.goBack()`. No hay interceptación de red ni eventos sintéticos en esta parte. La instrumentación registra el `pageshow` nativo y una identidad de documento; para una restauración real exige también conservar los canvas sanos.

| Navegador | `/eventos` | `/invitaciones` | `/bodas` | Cobertura real de BFCache |
|---|---|---|---|---|
| Chrome 156.0.8078.80, sistema | `persisted=true`, ambos temas | `persisted=true`, ambos temas | `persisted=true`, ambos temas | **Sí: seis restauraciones reales** |
| Playwright WebKit 18.0, Windows | `persisted=false`, ambos temas | `persisted=false`, ambos temas | `persisted=false`, ambos temas | **No: las seis vueltas recargaron** |

En Chrome se conservaron las identidades de documento y de los canvas sanos. Todas las auroras visibles volvieron con `data-renderer="webgl"`, opacidad 1 y nuevos dibujos; las cintas respondieron al desplazamiento tras volver. El recorrido posterior hasta el cierre también pasó. Bodas recuperó su canvas de anillos al regresar al hero, sin cambios en su implementación. No se registraron errores de página en los doce casos.

Chrome se lanzó quitando el argumento de Playwright que deshabilita BFCache y habilitando esa función; el resultado se acredita con `persisted=true`, no con esos argumentos. WebKit usa el navegador instalado `webkit-2083` y su `playwright-core` 1.48.2 compatible, seleccionado mediante `PLAYWRIGHT_BROWSERS_PATH` y `BFCACHE_WEBKIT_MODULE`. No se afirma por qué ese WebKit recargó ni se presenta ese resultado como cobertura de BFCache.

Después de cada navegación se ejecuta **otra prueba explícitamente sintética**: `pagehide` persistente, pérdida real mediante `WEBGL_lose_context` y `pageshow` persistente. En las auroras se deja pasar el evento de pérdida; en las cintas se intercepta para exigir la detección por `isContextLost()`. Ambos motores recrearon los canvas visibles y recuperaron renderer/opacidad. Esta prueba cubre la recuperación, pero no se usa como evidencia de BFCache real.

### Verificación limpia y regresiones

Con `git status --porcelain` vacío en `c3962b7` y eliminando previamente sólo `dist/` del worktree:

- `npm run typecheck`: aprobado.
- `npm test`: **305 + 38 = 343 pruebas**, más la comprobación Posada, aprobadas.
- `npm run check:build`: aprobado.
- Atrás/recuperación: doce casos aprobados, con la distinción de cobertura real indicada arriba.
- `scripts/check-aurora-startup-browser.mjs`, sin modificar: doce navegaciones en frío aprobadas, un Chrome nuevo por página y tema. Pasaron dibujo, pausa, movimiento reducido y estados diferidos.
- `scripts/check-wedding-rings-browser.mjs`, sin modificar: **64 casos aprobados**, ES/EN, claro/oscuro, escritorio/móvil, toque real, aviso de idioma visible/cerrado y perfiles estáticos. Los ocho casos animados principales registraron aproximadamente 60 fps. Evidencia: `rings/browser-results.json`, `rings/matrix.log` y capturas en `rings/`.

Máximos de claro/oscuro en esta revisión, con el mismo método de atribución descrito en el informe original:

| Página | Tarea larga máxima atribuible | Contextos al cargar / al final |
|---|---:|---:|
| `/` | Ninguna ≥50 ms | 0 / 0 |
| `/bodas` | Ninguna ≥50 ms | 0 / 3 |
| `/eventos` | 53 ms | 2 / 5 |
| `/temporada` | Ninguna ≥50 ms | 1 / 2 |
| `/invitaciones` | Ninguna ≥50 ms | 2 / 5 |
| `/en/bodas` | Ninguna ≥50 ms | 0 / 3 |

El máximo fue **53 ms**, inferior al límite de 100 ms. Los recuentos excluyen los anillos y los contextos temporales del worker. «Ninguna ≥50 ms» no significa coste de ejecución nulo. Datos completos: `cold/after-results.json` y `cold/after.log`.

### Evidencia y límites de este seguimiento

Carpeta externa: `C:\Users\USER\.codex\visualizations\2026\11\05\01a1ab9a-d1f4-7e71-b46c-e156d8b307df\aurora-bfcache`.

`bfcache-results.json` conserva los eventos reales antes de la prueba sintética, identidades, renderer, opacidad, contadores de dibujo y los estados recuperados. Capturas: `{chrome,webkit}-{eventos,invitaciones,bodas}-{light,dark}-{before,after}.jpg`. `bfcache.log`, `shader-hashes.json`, `verified-commit.txt`, `typecheck.log`, `tests.log` y `build.log` documentan las ejecuciones. `cold/` contiene la medición en frío; `rings/`, la regresión existente de los anillos.

Para reproducir: construir `dist/`, definir `BFCACHE_EVIDENCE` fuera del repositorio y ejecutar `node scripts/check-aurora-bfcache-browser.mjs`. Para el WebKit ya instalado en esta máquina se usó `C:\Users\USER\AppData\Local\Temp\claude\3b6cb55ef0e2e1b2\a8d29861-4083-430c-920b-976829c904ee\scratchpad\audit\browsers` como `PLAYWRIGHT_BROWSERS_PATH`, y el `node_modules\playwright-core\index.mjs` de ese mismo directorio `audit` como `BFCACHE_WEBKIT_MODULE`. Sin esta última variable se usa el Playwright del repositorio y su revisión de WebKit correspondiente.

No se comprobó Safari real en macOS o iPhone ni la expulsión de BFCache por presión real de memoria/GPU. WebKit en Windows no produjo una restauración real en estas pruebas. Las pérdidas de contexto se forzaron mediante la extensión del navegador. Se verificaron builds locales; no se publicó para probar producción.

## Informe de arranque publicado en 2f83391

Rama `codex/aurora-arranque`, creada tras `git fetch origin main` desde `1fa1ff32fe7df59a03802b07309e49f7d98d7aa1`. Se reutilizó el worktree limpio `C:\Users\USER\.codex\worktrees\bodas-anillos\nordra-studio-premium`. Sin push ni despliegue.

## Cambios

- `src/site/scripts/motion.js`: conserva el estado de apertura, paleta, intensidad, pausa y tema antes de crear WebGL. Sólo inicializa campos con ancho y alto positivos, próximos al viewport. Mantiene los listeners de apertura, temporada/vitrina, movimiento local, mensajes del padre, tema y cierre de página.
- `src/site/scripts/nordra-theatre.js`: aplica la misma inicialización perezosa a las cintas; la apertura y los colores siguen actualizándose mientras espera el contexto.
- `src/site/webgl/lazy-aurora.js`: observación de tamaño y proximidad, margen de una pantalla, cola compartida con un campo por callback de tiempo libre y alternativa con `setTimeout`. Compila y enlaza sin consultar estados bloqueantes en la tarea de envío; consulta `COMPLETION_STATUS_KHR` en cuadros sucesivos y sólo después lee `LINK_STATUS`. El primer cuadro aparece con un fundido de 600 ms, sin transición con movimiento reducido. Cancela los trabajos pendientes al salir.
- `src/site/webgl/warmup.js` y `warmup.worker.js`: calentamiento compartido fuera del hilo principal, separado y reutilizado por backend. Las auroras solicitan WebGL; los anillos solicitan WebGL2. El worker temporal se termina al acabar, fallar, agotar su tiempo de espera o cerrar la página.
- `src/site/wedding-rings/rings-hero.js`: importa el calentamiento compartido. Se retiraron las dos copias anteriores de `prepare-context.js` y `context-warmup.worker.js`.
- Pruebas: `scripts/lazy-aurora.test.mjs`, `scripts/check-aurora-startup-browser.mjs` y adaptación del harness VM de `scripts/mobile-aurora.test.mjs` a los imports. **`scripts/check-wedding-rings-browser.mjs` no se modificó**.

No se cambiaron shaders, paletas, colores, perfiles de FPS/DPR/píxeles ni `NordraMobileAurora`. Los cuatro textos GLSL coinciden con `origin/main`, normalizando únicamente finales de línea; sus hashes SHA-256 están en `shader-hashes.json`.

## Método

Chrome del sistema **156.0.8078.80**, ejecutable `C:/Program Files/Google/Chrome/Application/chrome.exe`, escritorio 1440×900. **Un proceso nuevo de navegador por página y tema**, doce procesos por versión. Builds de producción servidos localmente; sin limitación artificial de CPU o red. No se utilizaron navegaciones repetidas dentro del mismo navegador para medir en frío.

La baseline es una copia externa del build limpio verificado de `1fedffc`; el código de ejecución, recursos, HTML y configuración de build es idéntico a `origin/main` en `1fa1ff3` (el commit posterior sólo documenta resultados). El build corregido corresponde al commit verificado indicado abajo.

`PerformanceObserver` recoge `longtask` con `buffered:true`. La instrumentación de prueba identifica los contextos cuyo canvas pertenece a `.aurora-field` o `.theatre-ribbon` y cronometra creación, compilación, enlace, consultas de estado y primer dibujo. Una tarea se atribuye a auroras si se solapa con una de esas llamadas. El JSON conserva también todas las tareas de la página y las llamadas medidas, para auditar la atribución. La instrumentación sólo existe en el navegador de pruebas.

Se registra el número de contextos de aurora a los 8 segundos y después de recorrer todas las secciones con tamaño. Cada sección debe dibujar; los campos temporales deben avanzar y las cintas deben responder al desplazamiento. Se comprueban pausa, movimiento reducido y el botón real de pausa/reanudación, y se capturan ambas versiones en claro y oscuro. La tabla presenta el máximo de ambos temas durante toda la navegación, incluyendo el recorrido. **Cero significa ninguna tarea de ≥50 ms detectada, no coste de ejecución nulo**.

Los contextos de los anillos y de otros productos se excluyen de los recuentos de aurora. Los resultados corregidos incluyen además `allContexts`, para distinguir ambas medidas. Tampoco se cuentan como contextos visibles los temporales del worker, que se liberan al finalizar el calentamiento.

## Antes y después

Máximos entre claro y oscuro. Los recuentos son de **contextos de aurora**, al cargar / al final del recorrido:

| Página | Tarea larga máxima antes | Después | Contextos antes | Contextos después |
|---|---:|---:|---:|---:|
| `/` | Ninguna ≥50 ms | Ninguna ≥50 ms | 0 / 0 | 0 / 0 |
| `/bodas` | 579 ms | Ninguna ≥50 ms | 5 / 5 | **0 / 3** |
| `/eventos` | 351 ms | Ninguna ≥50 ms | 5 / 5 | 2 / 5 |
| `/temporada` | 440 ms | Ninguna ≥50 ms | 2 / 2 | 1 / 2 |
| `/invitaciones` | 381 ms | Ninguna ≥50 ms | 5 / 5 | 2 / 5 |
| `/en/bodas` | 332 ms | Ninguna ≥50 ms | 5 / 5 | **0 / 3** |

Se cumple el objetivo de ninguna tarea atribuible a las auroras superior a 100 ms en estas doce navegaciones finales. En Bodas, los dos campos sin tamaño permanecen sin contexto; los tres campos visibles se crean al aproximarse a sus secciones. En todas las páginas se mantiene el dibujo, la respuesta al desplazamiento y los controles comprobados, sin errores de página.

En `/` no hay campos de estos dos controladores en el recorrido actual; su resultado cero no implica que otros efectos de Inicio no utilicen WebGL.

## Verificación funcional

Una prueba separada vuelve visible un campo de Bodas que empieza con tamaño cero: antes de hacerlo recibe apertura, pausa, tema oscuro e intensidad mediante un mensaje del padre. Al crear el contexto se consultan sus uniforms reales y se comprueba que prevalece la última apertura emitida por el cambio de tamaño, intensidad 0,6, tema oscuro y pausa. `pagehide` retira el canvas. Evidencia: `deferred-events.json`.

Las pruebas unitarias cubren espera por tamaño/proximidad, cola de un trabajo por callback, cancelación de trabajo sin inicializar, sondeo de compilación en futuros cuadros y cancelación sin leer `LINK_STATUS`.

Desde el worktree limpio en `5f0a73c5c80c5cf980e1ec98545458dc6c7b7d1c`, eliminando previamente sólo su `dist/`:

- `npm run typecheck`: aprobado.
- `npm test`: **303 + 38 = 341 pruebas**, más la comprobación de Posada, aprobadas.
- `npm run check:build`: aprobado.
- Matriz de auroras: **doce navegaciones finales aprobadas**, con un proceso nuevo por página y tema, más la prueba independiente de tamaño/eventos previos.
- Regresión de anillos: **64 casos aprobados con el script original sin cambios**. Se mantienen los ocho recorridos ES/EN en claro/oscuro, los tamaños móviles adicionales, los doce casos de idioma y los cuarenta perfiles estáticos con cero contextos WebGL. Escritorio conserva aproximadamente 60 fps y supera sus comprobaciones existentes de carga, toque, arrastre, pausa y rendimiento.

## Evidencia externa y reproducción

Carpeta: `C:\Users\USER\.codex\visualizations\2026\11\05\01a1ab9a-d1f4-7e71-b46c-e156d8b307df\aurora-arranque`.

`before-results.json` y `after-results.json` contienen medidas, errores y el inventario de capturas por sección. **`comparativa.html` reúne 36 parejas, 72 imágenes**, con enlaces a cada captura completa. Las imágenes siguen el patrón `{before,after}-{ruta}-{light,dark}-{índice}.jpg`; se omiten los campos de tamaño cero porque no tienen una sección visible que capturar. `before.log`, `after.log`, `typecheck.log`, `tests.log`, `build.log` y `verified-commit.txt` conservan las ejecuciones. La regresión de anillos guarda sus archivos en la subcarpeta `rings/`.

Para reproducir: hacer el build, definir `AURORA_EVIDENCE` como carpeta externa y ejecutar `node scripts/check-aurora-startup-browser.mjs`. `AURORA_ROOT` permite seleccionar la baseline externa y `AURORA_LABEL=before` guardarla aparte. Las variables opcionales `AURORA_PAGES` y `AURORA_THEMES` limitan el recorrido. Para anillos, servir Vite en 5198 y ejecutar el script existente con `RINGS_EVIDENCE` apuntando a una carpeta externa.

## Límites

Medición local de builds de producción, no nueva medición del dominio publicado. No se publicó para verificarlo. Un proceso nuevo de Chrome evita reutilizar su sesión; no se borran cachés del sistema operativo ni del driver. Los límites se verifican en este equipo y navegador, no se garantizan para todos los drivers.

Sin `KHR_parallel_shader_compile` se difiere la lectura de estado al siguiente cuadro, pero el driver podría bloquear allí; sin Worker/OffscreenCanvas se mantiene la inicialización perezosa sin calentamiento. No se ensayaron esos navegadores alternativos ni dispositivos físicos. Las capturas muestran estados durante la animación y no pretenden igualdad de píxeles entre instantes distintos.

## Commits

- `55fa42485de465abfe5fd561ce3d779ad2b34ebd`: inicialización perezosa, compilación asíncrona y pruebas.
- `be8ece3cb593560368c5bd14296ce0ae9905a396`: prueba del último estado de apertura tras cambios de tamaño.
- `e7256da66970f5a1beb6a271477a979fb31e25b9`: calentamiento separado de WebGL/WebGL2.
- `5f0a73c5c80c5cf980e1ec98545458dc6c7b7d1c`: creación dentro del callback de tiempo libre una vez calentado el backend; commit final de código verificado en limpio.
