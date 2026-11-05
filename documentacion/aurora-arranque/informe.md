# Arranque de auroras en escritorio

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

Chrome del sistema, ejecutable `C:/Program Files/Google/Chrome/Application/chrome.exe`, escritorio 1440×900. **Un proceso nuevo de navegador por página y tema**, doce procesos por versión. Builds de producción servidos localmente; sin limitación artificial de CPU o red. No se utilizaron navegaciones repetidas dentro del mismo navegador para medir en frío.

La baseline es una copia externa del build limpio verificado de `1fedffc`; el código de ejecución, recursos, HTML y configuración de build es idéntico a `origin/main` en `1fa1ff3` (el commit posterior sólo documenta resultados). El build corregido corresponde al commit verificado indicado abajo.

`PerformanceObserver` recoge `longtask` con `buffered:true`. La instrumentación de prueba identifica los contextos cuyo canvas pertenece a `.aurora-field` o `.theatre-ribbon` y cronometra creación, compilación, enlace, consultas de estado y primer dibujo. Una tarea se atribuye a auroras si se solapa con una de esas llamadas. El JSON conserva también todas las tareas de la página y las llamadas medidas, para auditar la atribución. La instrumentación sólo existe en el navegador de pruebas.

Se registra el número de contextos de aurora a los 8 segundos y después de recorrer todas las secciones con tamaño. Cada sección debe dibujar; los campos temporales deben avanzar y las cintas deben responder al desplazamiento. Se comprueban pausa, movimiento reducido y el botón real de pausa/reanudación, y se capturan ambas versiones en claro y oscuro. La tabla presenta el máximo de ambos temas durante toda la navegación, incluyendo el recorrido. **Cero significa ninguna tarea de ≥50 ms detectada, no coste de ejecución nulo**.

Los contextos de los anillos y de otros productos se excluyen de los recuentos de aurora. Los resultados corregidos incluyen además `allContexts`, para distinguir ambas medidas. Tampoco se cuentan como contextos visibles los temporales del worker, que se liberan al finalizar el calentamiento.

## Antes y después

Pendiente de incorporar los resultados finales de las seis páginas.

En `/` no hay campos de estos dos controladores en el recorrido actual; su resultado cero no implica que otros efectos de Inicio no utilicen WebGL.

## Verificación funcional

Una prueba separada vuelve visible un campo de Bodas que empieza con tamaño cero: antes de hacerlo recibe apertura, pausa, tema oscuro e intensidad mediante un mensaje del padre. Al crear el contexto se consultan sus uniforms reales y se comprueba que prevalece la última apertura emitida por el cambio de tamaño, intensidad 0,6, tema oscuro y pausa. `pagehide` retira el canvas. Evidencia: `deferred-events.json`.

Las pruebas unitarias cubren espera por tamaño/proximidad, cola de un trabajo por callback, cancelación de trabajo sin inicializar, sondeo de compilación en futuros cuadros y cancelación sin leer `LINK_STATUS`.

Desde el worktree limpio en `e7256da66970f5a1beb6a271477a979fb31e25b9`, eliminando previamente sólo su `dist/`:

- `npm run typecheck`: aprobado.
- `npm test`: **303 + 38 = 341 pruebas**, más la comprobación de Posada, aprobadas.
- `npm run check:build`: aprobado.
- Matriz de auroras y regresión de anillos: pendientes de incorporar al terminar.

## Evidencia externa y reproducción

Carpeta: `C:\Users\USER\.codex\visualizations\2026\11\05\01a1ab9a-d1f4-7e71-b46c-e156d8b307df\aurora-arranque`.

`before-results.json` y `after-results.json` contienen medidas, errores y el inventario de capturas por sección. Las imágenes siguen el patrón `{before,after}-{ruta}-{light,dark}-{índice}.jpg`; se omiten los campos de tamaño cero porque no tienen una sección visible que capturar. `before.log`, `after.log`, `typecheck.log`, `tests.log`, `build.log` y `verified-commit.txt` conservan las ejecuciones.

Para reproducir: hacer el build, definir `AURORA_EVIDENCE` como carpeta externa y ejecutar `node scripts/check-aurora-startup-browser.mjs`. `AURORA_ROOT` permite seleccionar la baseline externa y `AURORA_LABEL=before` guardarla aparte. Las variables opcionales `AURORA_PAGES` y `AURORA_THEMES` limitan el recorrido. Para anillos, servir Vite en 5198 y ejecutar el script existente con `RINGS_EVIDENCE` apuntando a una carpeta externa.

## Límites

Medición local de builds de producción, no nueva medición del dominio publicado. No se publicó para verificarlo. Un proceso nuevo de Chrome evita reutilizar su sesión; no se borran cachés del sistema operativo ni del driver. Los límites se verifican en este equipo y navegador, no se garantizan para todos los drivers.

Sin `KHR_parallel_shader_compile` se difiere la lectura de estado al siguiente cuadro, pero el driver podría bloquear allí; sin Worker/OffscreenCanvas se mantiene la inicialización perezosa sin calentamiento. No se ensayaron esos navegadores alternativos ni dispositivos físicos. Las capturas muestran estados durante la animación y no pretenden igualdad de píxeles entre instantes distintos.

## Commits

- `55fa42485de465abfe5fd561ce3d779ad2b34ebd`: inicialización perezosa, compilación asíncrona y pruebas.
- `be8ece3`: prueba del último estado de apertura tras cambios de tamaño.
- `e7256da66970f5a1beb6a271477a979fb31e25b9`: calentamiento separado de WebGL/WebGL2; commit verificado en limpio.
