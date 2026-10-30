# Signature Nordra · Hero de paisaje

## Revisión del arranque sobre main actualizado · 30/10/2026

**Rama `codex/hero-paisaje`, rebaseada sobre `origin/main = 9b7e9f6`, local, sin
push ni despliegue.** La parte visual y robustez de la integración anterior están
aprobadas según el responsable. Esta revisión conserva ese diseño y reduce el
coste de arranque, pero **no alcanza los dos umbrales de rendimiento solicitados**.

| Indicador | Antes | Después |
|---|---:|---:|
| TBT Lighthouse móvil CPU ×4, mediana de 3 | 801,7 ms | **393,2 ms** |
| Puntuación Lighthouse, mediana | 74 | **83** |
| LCP Inicio, método Signature, mediana de 3 | 880 ms | **844 ms** |
| Mayor tarea observada sin throttling | 315 ms | **169 ms** |
| Intervalo entre dibujos, móvil CPU ×4, mediana / p95 | — | **33,3 / 33,4 ms** |

La mejora de TBT es de aproximadamente el 51 %. Sigue por encima de 150 ms y
queda una tarea mayor de 100 ms en el arranque previo al paisaje. No se presenta
esta entrega como cumplimiento del objetivo completo ni como autorización para publicar.

### Rebase y convivencia con analítica

Se hizo `git fetch origin` y rebase de los tres commits del hero. Solo
`src/site/entries/home.js` produjo un conflicto real: se conservan tanto
`../analytics/entry.js` como `../landscape/landscape-hero.js`. Los otros archivos
indicados se integraron sin conflicto textual y se revisaron igualmente.

- `package.json` y el lockfile conservan `@vercel/analytics = 2.0.1` y añaden
  `three = 0.181.0`, sin otros cambios de dependencias frente a main.
- `src/site/analytics`, el aviso público y su control no tienen diferencias
  respecto a `origin/main`. El `no-referrer` y la anotación WhatsApp de Inicio permanecen.
- El verificador recorre imports estáticos y modulepreloads de las ocho páginas;
  continúa rechazando `three-*` y `landscape-scene-*` entre los recursos iniciales.
  `check:build` y su prueba de protección pasan.
- Red interceptada con el SDK real: Inicio produce una vista canónica y un
  `whatsapp_click` con `{page: 'index', button: 'closing'}` al activar con Enter.
  Sin enlace, teléfono, mensaje ni token de fixture en el payload; sin duplicados
  ni cabecera Referer. No se enviaron datos a Vercel ni a WhatsApp.

### Diagnóstico por programa

La instrumentación se añadió **solo al navegador de prueba**, interceptando el
módulo compilado para envolver `compileAsync`; no hay hooks de revisión en producción.
Se capturaron Long Tasks, Long Animation Frames, perfil CPU y llamadas WebGL.
`KHR_parallel_shader_compile` está disponible.

El diagnóstico inicial apuntaba al polling. La traza local precisa el punto:
el timer termina la promesa de compilación y su continuación realiza el primer
render; **el lago necesita variantes de programa para su render target lineal**.
Solo se habían preparado las variantes de pantalla. Las del reflejo se creaban
sincrónicamente durante ese primer render y bloqueaban en `getProgramInfoLog`
dentro de la inicialización de Three. SVGLoader y ExtrudeGeometry no explican
la tarea conjunta de 315 ms.

Tiempos de pared de `compileAsync`, en ms, sin throttling. Incluyen espera al
driver: **no son tiempo de bloqueo del hilo principal**. La segunda banda y el
glaciar reutilizan programas ya compilados.

| Objeto | Antes: pantalla | Antes: bloqueo tardío del reflejo | Después: reflejo | Después: pantalla |
|---|---:|---:|---:|---:|
| Cielo | 123,7 | 116,1 | 129,8 | 131,1 |
| Banda cercana | 42,8 | 35,9 | 43,6 | 43,1 |
| Banda lejana | 0,2 | programa compartido | 0,1 | 0,1 |
| Malla de montaña | 118,9 | 108,8 | 130,1 | 117,7 |
| Malla de glaciar | 0,0 | programa compartido | 0,1 | 0,1 |
| Cordillera | 32,3 | 29,1 | 44,3 | 42,1 |
| Agua | 76,5 | no se refleja a sí misma | — | 87,7 |

En el candidato no se observan llamadas WebGL bloqueantes mayores de 10 ms en
la compilación ni la tarea conjunta del primer render. En algunas ejecuciones
el driver tarda alrededor de un segundo adicional en completar el cielo, con
el hilo principal libre; se espera su finalización real, sin temporizadores
añadidos para trasladar trabajo fuera de Lighthouse.

### Cambios conservando el aspecto

- El ruido reutiliza una textura R8 de **1024 × 1024, 1 MiB en GPU y cero descarga**.
  Se genera una vez por contexto con un shader mínimo que calcula la misma
  retícula original. Usar la GPU conserva la aritmética del hash del shader;
  una aproximación de `sin` en JavaScript alteraría su patrón. Se regenera al
  recuperar el contexto y se libera al salir.
- Se eligió una retícula mayor que la sugerencia de 128–256 px para cubrir las
  coordenadas firmadas de montaña y orilla sin repetir visiblemente el relieve.
  Las cuatro octavas conservan sus frecuencias y amplitudes, con muestras de
  textura e interpolación suave, sin el bucle de cálculo procedural repetido.
  No se redujeron octavas que pudieran cambiar el acabado aprobado.
- **La textura por sí sola no resolvió el arranque**: el primer render seguía
  agrupando variantes sin preparar (339 ms en el ensayo intermedio). La mejora
  decisiva es compilar también las variantes del reflejo, esperar a cada programa
  y ceder una tarea antes del siguiente. El agua se excluye de su propio reflejo.
- Se mantiene la detección de errores de shader. Cancelar o perder el contexto
  interrumpe la preparación; una generación nueva evita continuar la anterior.
- El contexto que comprueba el cargador se entrega al renderer, en lugar de
  destruirlo y abrir otro. Si falla la importación se libera. El canvas se
  dimensiona una sola vez por cambio de tamaño/DPR, sin cambiar sus límites.
- No cambian el ruido de estrellas, los colores, iluminación, encuadre, textos,
  geometrías, tiempos, movimiento ni parámetros del agua. `horizon-flow.js` no
  se modifica en esta revisión. No se oculta el paisaje a Lighthouse.

### Comparación visual

Referencias tomadas del hero rebaseado **antes** de optimizar, con la analítica
ya incorporada. Escena asentada y pausada, 900 px de alto, DPR 1. Se revisaron
los cuatro pares: no se aprecia cambio de composición, día ártico o noche.
Hay diferencias mínimas de muestreo por la textura R8; no se afirma identidad
byte a byte de los píxeles.

| Ancho / tema | Antes | Después | Diferencia media RGB, escala 0–255 | Píxeles con diferencia >8 en algún canal |
|---|---|---|---:|---:|
| 375 / claro | [Antes](hero-paisaje/compilacion/before-375-light.png) | [Después](hero-paisaje/compilacion/after-375-light.png) | 0,0390 | 0,0317 % |
| 375 / oscuro | [Antes](hero-paisaje/compilacion/before-375-dark.png) | [Después](hero-paisaje/compilacion/after-375-dark.png) | 0,0283 | 0,0510 % |
| 1440 / claro | [Antes](hero-paisaje/compilacion/before-1440-light.png) | [Después](hero-paisaje/compilacion/after-1440-light.png) | 0,0442 | 0,0508 % |
| 1440 / oscuro | [Antes](hero-paisaje/compilacion/before-1440-dark.png) | [Después](hero-paisaje/compilacion/after-1440-dark.png) | 0,0453 | 0,1183 % |

### Rendimiento y límites pendientes

Builds locales servidos en 5688/5689 mediante el mismo servidor estático de
comparación. Chrome 156, 375 × 900, DPR 1, CPU ×4, red 10 Mbit/s de bajada,
5 Mbit/s de subida, 40 ms de latencia. Sin compilaciones ni otro navegador de
pruebas simultáneos. El SDK se sirve como fixture local y sus endpoints se
interceptan; ambas versiones contienen la misma analítica. No son datos de campo.

Lighthouse usa throttling DevTools, contexto/perfil nuevo por ejecución, tema
claro y movimiento activo. La referencia ahora incluye analítica y se vuelve a
medir: los 563 ms del informe histórico no se utilizan como control de esta prueba.

| Ronda | TBT antes | TBT después | Puntuación antes | Puntuación después |
|---|---:|---:|---:|---:|
| 1 | 845,5 ms | 405,7 ms | 73 | 83 |
| 2 | 793,7 ms | 367,4 ms | 74 | 84 |
| 3 | 801,7 ms | 393,2 ms | 74 | 82 |
| Mediana | **801,7 ms** | **393,2 ms** | **74** | **83** |

LCP: mismo protocolo de observación de `docs/signature-lcp.md`, caché desactivada,
contexto nuevo, último candidato a load + 6 s; orden alternado en la segunda ronda.
El candidato sigue siendo `horizon-900.webp`.

| Ronda | LCP antes | LCP después |
|---|---:|---:|
| 1 | 880 ms | 824 ms |
| 2 | 884 ms | 876 ms |
| 3 | 860 ms | 844 ms |
| Mediana | **880 ms** | **844 ms** |

No hay regresión de LCP en esta muestra. En móvil CPU ×4 y DPR solicitado 3,
242 cuadros: intervalo mediano 33,3 ms, p95 33,4 ms; callback JS mediano 1,5 ms,
p95 3,4 ms. Buffer 562 × 1243, dentro del máximo DPR 1,5. Se sostiene el objetivo
de **30 fps en esta máquina**, sin inferir el rendimiento de una GPU de teléfono.

**Lo que sigue sin cumplir:** TBT <150 ms y ninguna tarea >100 ms sin throttling.
La traza final sin throttling registra 169 ms en la inicialización anterior de
`horizon-flow`, además de tareas de 57, 69 y 78 ms; no aparecen las compilaciones
síncronas del reflejo. Esto no significa que todo el TBT restante provenga del
respaldo: en la tercera ejecución Lighthouse quedan tareas de 265,6 ms sin
atribución, 136,1 ms en Three y 76,0 ms en el módulo de escena, además de trabajo
de Inicio. Un perfil CPU ×4 separado confirma costes de layout y arranque nativo
que no se eliminan al simplificar el shader. Haría falta otra revisión del
arranque completo, fuera de los programas pesados aquí corregidos; no se ha
quitado el respaldo ni diferido artificialmente la escena para ocultar esos costes.

### Verificación final y commits

- `npm run typecheck`: correcto.
- `npm test`: **140 + 34 pruebas correctas**, más checks Posada. Se añaden cuatro
  pruebas: programas secuenciales, cancelación/restauración del destino, perfil
  sin reflejo y transferencia/liberación del contexto del cargador.
- `npm run check:build`: correcto, 15 entradas, una hoja CSS por página y
  protecciones de bundles e inputs Vercel correctas.
- Navegador: pausa/reanudación, tema en vivo, offscreen, movimiento reducido,
  sin WebGL, shader inválido como fixture, pérdida/restauración real del contexto
  y navegación Inicio → Invitaciones → Inicio → Invitaciones, sin errores de consola.
- Analítica de Inicio comprobada con evento real de teclado y red interceptada.
- Chunks diferidos finales: Three + addons **548.147 B / 145.702 B gzip**;
  escena **34.226 B / 13.883 B gzip**. Permanecen fuera de la carga inicial.
- Rebase: `62e7ab5 → b9219e6`, `c237fb9 → 6ef9009`, `41b519f → f73f98b`.
- Optimización y pruebas: `39df271`. El informe y las capturas se guardan en un
  commit posterior de documentación.

[Evidencia compacta](hero-paisaje/compilacion/verification.json). Scripts, perfiles
CPU, Lighthouse completos y capturas de estados en
`E:\Nordra Studio\Revision Signature\2026-10-30-hero-compilacion`.
La base de producción `9b7e9f6` permanece intacta. Material de trabajo y carpetas
sin rastrear quedan fuera de commits. **Estado: local, sin publicar.**

## Informe de integración original · histórico

Los apartados siguientes conservan el registro de la integración inicial desde
`a65199d`, sus capturas aprobadas y sus mediciones originales. Las cifras y el
estado actuales son los de la revisión anterior de este documento.

Se copió y adaptó el prototipo aprobado de `codex/signature-prototipo-hero`
(`af9ab90`), sin fusionar esa rama ni su configuración temporal. El isotipo de
`src/site/assets/isotipo.svg` coincide byte a byte con el SVG aprobado.

## Resultado

- Inicio muestra el día ártico en claro y la aurora nocturna en oscuro, detrás
  de los textos existentes. Conserva montaña extruida, glaciar, cielo, cordillera,
  reflejo del lago, ondas, témpanos y orilla del prototipo.
- Ubicación, título, oferta, detalle, botones y frase de confianza conservan su
  contenido, dimensiones y coordenadas en las cuatro comparaciones: 375/1440 px,
  claro/oscuro. Se amplía únicamente el espacio inferior del hero para el paisaje:
  su borde inferior pasa de 672,875 a 896,875 px en móvil y de 747,969 a 914 px en
  escritorio, con viewport de 900 px de alto. El espacio se reserva desde el CSS;
  la aparición del canvas no mueve contenido (CLS observado: 0).
- El encuadre calcula el punto superior de la geometría real, incluidos los
  biseles, y lo sitúa a **56 px bajo los botones en reposo**, en ambos tamaños.
  Observa `.horizon-title` y `.horizon-actions` para reajustarse tras cambios de
  fuente o tamaño. El vuelo de scroll es pequeño y no existe parallax del cursor.
- `horizon-900.webp` / `horizon-1920.webp` permanecen en el HTML, con prioridad
  alta. La imagen permanece pintada bajo los renderers. La escena entra con un
  fundido cuando está preparada; `horizon-flow` se oculta y deja de dibujar solo
  entonces. Ante un fallo vuelve el respaldo, sin retirar sus recursos públicos.
- Se conserva el tema claro predeterminado. El selector existente cambia la luz
  en vivo. La pausa congela el reloj; movimiento reducido renderiza una escena
  asentada sin intro, ondas ni vuelo. Cambiar el tema sigue siendo posible en pausa.
- El lago ignora título, texto, botones, enlaces, cabecera, navegación y cielo.
  Las ondas solo se generan sobre el agua en primer plano.
- Se detiene fuera de pantalla y con la pestaña oculta. No empieza dentro de un
  iframe de navegación oculto. Al abandonar Inicio se liberan geometrías,
  materiales, render target del reflejo, renderer, contexto y observadores, incluso
  si el documento raíz permanece detrás de un iframe.
- Se verificaron ausencia de WebGL2, fallo de shader y pérdida/restauración real
  del contexto mediante `WEBGL_lose_context`. En todos esos casos el contenido
  sigue disponible y no hay errores de consola del hero.
- DPR máximo: 2 en escritorio, 1,5 en móvil; límites adicionales por píxeles y
  dispositivo. Móvil apunta a 30 fps, escritorio a 60. El perfil limitado conserva
  el lago simplificado del prototipo.
- No se copiaron `?at`, `window.__landscape`, controles de revisión ni archivos de
  `prototipos/`. No cambian Bodas, precios, invitaciones de clientes ni AGENTS.md.

## Capturas para aprobación

Capturas a 900 px de alto, con movimiento pausado y la escena asentada, para poder
comparar composición. Los pares conservan el mismo viewport, tema y tipografía.

| Ancho | Tema | Referencia a65199d | Propuesta |
|---|---|---|---|
| 375 | Claro | [Antes](hero-paisaje/before-375-light.png) | [Después](hero-paisaje/after-375-light.png) |
| 375 | Oscuro | [Antes](hero-paisaje/before-375-dark.png) | [Después](hero-paisaje/after-375-dark.png) |
| 1440 | Claro | [Antes](hero-paisaje/before-1440-light.png) | [Después](hero-paisaje/after-1440-light.png) |
| 1440 | Oscuro | [Antes](hero-paisaje/before-1440-dark.png) | [Después](hero-paisaje/after-1440-dark.png) |

![Día ártico, escritorio](hero-paisaje/after-1440-light.png)

![Aurora nocturna, escritorio](hero-paisaje/after-1440-dark.png)

Otros estados comprobados:

- Cambio de tema en vivo: [oscuro](hero-paisaje/theme-live-dark.png) y
  [regreso a claro](hero-paisaje/theme-live-light.png).
- [Movimiento reducido](hero-paisaje/reduced.png), [sin WebGL](hero-paisaje/noWebgl.png)
  y [fallo de shader provocado como fixture](hero-paisaje/shaderFailure.png).
- [Contexto perdido](hero-paisaje/context-lost.png) y
  [contexto recuperado](hero-paisaje/context-restored.png).
- Navegación interna: [llegada a Inicio](hero-paisaje/navigation-home.png) y
  [regreso a Invitaciones](hero-paisaje/navigation-back.png).
- Mismo recorrido conservando oscuro: [Inicio](hero-paisaje/navigation-home-dark.png)
  y [regreso](hero-paisaje/navigation-back-dark.png).

## Carga y tamaño

`three` está fijado exactamente a `0.181.0`, también en el lockfile. El pequeño
cargador es un módulo propio de Inicio; el módulo de escena se importa después
de `load` y un turno idle, siempre que el hero esté visible. Three y sus addons
constituyen un chunk separado, alcanzado solo desde esa importación dinámica.

| JavaScript | Bytes minificados | Bytes gzip (nivel 9) |
|---|---:|---:|
| Three + SVGLoader + Reflector, diferido | 548.066 | 144.967 |
| Escena + isotipo, diferido | 32.974 | 13.334 |
| Total JS inicial de Inicio, antes | 22.728 | 8.321 |
| Total JS inicial de Inicio, después | 27.248 | 10.132 |
| Incremento inicial | **4.520** | **1.811** |

El incremento inicial corresponde al cargador, política/puente de estados y helper
de importación dinámica de Vite. No incluye Three ni geometrías/shaders del paisaje.
El verificador de bundles sigue las importaciones estáticas y los modulepreloads
de las ocho páginas y falla si encuentra `three-*` o `landscape-scene-*` en ellos.
Una prueba demuestra que detecta una dependencia estática indebida.

En las tres rondas finales, el chunk de escena empezó a solicitarse a 706,4 / 686,2 /
674 ms, después de `load` a 649,2 / 649,7 / 638,2 ms. Three se solicitó a continuación.
Se conserva **una sola hoja CSS compilada por página**.

El HTML compilado y todos los JS/CSS iniciales de Estudio, Negocios, Invitaciones,
Bodas, Cumpleaños, Eventos y Temporada coinciden byte a byte con la referencia.

## Rendimiento local

### LCP: método de `docs/signature-lcp.md`

Referencia extraída con `git archive` desde a65199d, Vite preview en 5488; propuesta
en 5489. Chrome 156.0.8078.79, headless, Windows, viewport 375 × 900, DPR 1,
modo móvil, CPU ×4, 10 Mbit/s de bajada, 5 Mbit/s de subida, latencia de 40 ms,
caché desactivada y contexto nuevo por navegación. Tema claro y movimiento activo.
Tres rondas alternando el orden antes/después en la segunda; sin compilaciones
ni otro navegador de pruebas en paralelo. Último candidato tras `load` + 6 s.

| Versión | Ronda 1 | Ronda 2 | Ronda 3 | Mediana |
|---|---:|---:|---:|---:|
| Referencia | 648 ms | 636 ms | 628 ms | **636 ms** |
| Paisaje final | 628 ms | 632 ms | 616 ms | **628 ms** |

No hay regresión de LCP en esta muestra: −8 ms de mediana. Es una diferencia pequeña,
no una garantía de mejora en producción. En la referencia el LCP era la imagen de
Negocios (`horizon-path-photo`); en las tres rondas de la propuesta es la imagen
`horizon-900.webp`, como exige la integración. El canvas no sustituye ese elemento.

### Tiempo por cuadro y TBT

En una ejecución independiente a 375 × 900, DPR solicitado 3 y CPU ×4, se registraron
242 cuadros con dibujos WebGL2. El buffer queda en 562 × 1243, respetando el máximo
móvil de 1,5. Intervalo entre cuadros: mediana **33,3 ms**, p95 **33,4 ms**; objetivo
de 30 fps. Trabajo JavaScript dentro del callback que dibuja: mediana **1,4 ms**,
p95 **2,9 ms**. Esto no mide el tiempo de finalización de la GPU: Chrome utilizó
ANGLE/D3D11 sobre una NVIDIA RTX 3050, no una GPU de teléfono real.

**Hay una regresión de TBT que requiere revisión antes de publicar.** Una ejecución
Lighthouse por versión, móvil con throttling DevTools CPU ×4 y la red anterior,
registró **0 ms antes y 563,356 ms después**; puntuación de rendimiento 95 → 79.
Se dividió la preparación de geometrías y programas de shaders entre tareas, pero
la creación de la escena todavía provoca trabajo largo en el hilo principal.
El LCP favorable y los 30 fps sostenidos no eliminan ese coste inicial.
No se ocultó la escena durante Lighthouse ni se aplicaron retrasos específicos
para alterar la medición. Esta comparación TBT es un diagnóstico separado de las
tres rondas de LCP; no son mediciones de usuarios reales.

## Verificación y límites

- `npm run typecheck`: correcto.
- `npm test`: **126 + 34 pruebas correctas**, más check Posada correcto. Incluye
  9 pruebas nuevas de paisaje y una de convivencia con horizon-flow (8 en total
  para horizon-flow).
- `npm run check:build`: correcto; compila las 15 entradas y pasan
  `check-site-bundles` y `check-vercel-build-inputs`.
- Pruebas sin GPU: elección de respaldo, pausa, movimiento reducido, tema,
  reloj sin salto al reanudar, espera load/idle, iframe oculto, liberación al
  navegar, dependencia exacta y protección del bundle inicial.
- Navegador: pausa sin cambio de píxeles, reanudación, temas en vivo,
  offscreen, estado de documento oculto, ondas restringidas al lago, respaldo por
  shader/WebGL, restauración de contexto y entrada/salida por iframe. Tema oscuro
  conservado en el recorrido Invitaciones → Inicio → Invitaciones.
- Las cuatro capturas directas y el recorrido final de navegación terminan sin
  errores de consola ni respuestas HTTP fallidas. Un recorrido instrumentado
  adicional por Negocios produjo un mensaje aislado del sandbox de BRUMA, no
  reproducido en el recorrido sin esa instrumentación. BRUMA y los bundles de
  Negocios son idénticos a main; no se modificaron ni se atribuye ese mensaje a
  un fallo confirmado de la demo.
- Las capturas y métricas se obtuvieron sobre la compilación de producción local,
  no sobre el servidor de desarrollo. No se alteró producción.

Resultados compactos: [verification.json](hero-paisaje/verification.json).
Scripts de navegador, trazas y datos completos locales:
`E:\Nordra Studio\Revision Signature\2026-10-30-hero-paisaje`.

## Cambios y commits

- `62e7ab5` — dependencia exacta Three.js.
- `c237fb9` — integración, isotipo definitivo, ciclo de vida, respaldos y pruebas.
- El informe y las capturas se entregan en un tercer commit de documentación.

Archivos de ejecución: `index.html`, `vite.config.ts`, `src/site/entries/home.js`,
`src/site/landscape/*`, `src/site/assets/isotipo.svg`,
`src/site/scripts/horizon-flow.js`, `src/site/styles/home.css` y `landscape.css`.
Pruebas: `scripts/landscape.test.mjs`, `scripts/horizon-flow.test.mjs` y
`scripts/check-site-bundles.mjs`. Dependencia: `package.json` y lockfile.

Estado final: **local, sin publicar**. Se conservaron fuera de los commits
`artwork-source/`, `documentacion/` y `public/demos/posada-luz/`.
