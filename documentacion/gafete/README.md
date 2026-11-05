> Informe histórico anterior a la reescritura de la fase 2b. Los hashes y las rutas de arte antiguos se conservan como contexto local. La evidencia y validación vigentes se documentan en [FASE-2B.md](FASE-2B.md); las capturas anteriores forzaban la carga y no demuestran el recorrido real.

# El gafete · Fase 1

**Versión vigente: [Fase 1b · Material e impresión](FASE-1B.md).** Las capturas actuales y los HTML del boceto corresponden a la fase 1b. Este informe conserva el contexto y presupuesto originales de la fase 1; las mediciones vigentes están en el informe enlazado.

Arte original y boceto estático de Conexión 27. Rama `codex/gafete`, base `73dd1f2`, worktree `wt-gafete`. Sin cambios en la invitación de producción, sin push ni merge. Dependencias preparadas con `npm ci`.

## Revisar

- [Portada HTML](boceto/portada.html), [giro](boceto/giro.html), [interior sin elegir](boceto/interior.html), [sí elegido](boceto/elegido.html), [enlace personal](boceto/personal.html), [respuesta no](boceto/no.html)
- [Comparación completa: cuatro interiores capturados a 1440 px](comparacion-1440.png) · [vista reducida](comparacion-vista.png)
- [Hoja de arte](arte-contacto.png)
- [Originales y manifiesto](../../artwork-source/event-gafete-v1/manifest.json) · [todos los prompts](../../artwork-source/event-gafete-v1/prompts/) · [WebP](../../public/artwork/event-gafete/)

| Estado | 390 px | 1440 px |
|---|---|---|
| Portada | [Captura](capturas/portada-390.png) | [Captura](capturas/portada-1440.png) |
| Giro | [Captura](capturas/giro-390.png) | [Captura](capturas/giro-1440.png) |
| Interior sin elegir | [Captura](capturas/interior-390.png) | [Captura](capturas/interior-1440.png) |
| Ahí estaré | [Captura](capturas/elegido-390.png) | [Captura](capturas/elegido-1440.png) |
| Personal | [Captura](capturas/personal-390.png) | [Captura](capturas/personal-1440.png) |
| Esta vez no puedo | [Captura](capturas/no-390.png) | [Captura](capturas/no-1440.png) |

## Arte e identidad

Diez originales PNG: reverso con cordón y broche, frente, mesa, tramos de cordón, registro, tríptico, tres tarjetas en una lámina, dos pestañas en una lámina, círculo perforado e imagen para compartir. Los recortes tienen canal alfa; mesa y composición social son opacas. Derivados independientes de tarjetas, cordones y pestañas conservan su transparencia. Cada recurso tiene dos tamaños WebP: 36 archivos en total, 2,280,708 bytes incluyendo láminas y variantes que no se descargan juntas.

Sora y tinta `#123044`, cielo `#EDF8FC`, acento `#126781`; vidrio aqua y violeta. Se consultó también el panel (`#226553`, `#f5fbfa`) sin convertir su verde en el color dominante de la invitación. La mesa clara, sombras naturales y luz lateral se mantienen a lo largo de la escena. El registro, el programa y las tarjetas reciben texto HTML, no texto generado dentro de las imágenes.

## Verificación

Chrome a 390 × 844 y 1440 × 1000, fuentes e imágenes cargadas antes de capturar. Las doce capturas no tienen errores HTTP, desbordamiento horizontal ni desbordamiento horizontal de los bloques de texto comprobados. Revisión visual adicional de programa, abanico, QR y pestañas. [Resultados](comprobaciones.json).

| Interior móvil | Altura |
|---|---:|
| Sin elegir | 2170 px |
| Ahí estaré | 2209 px |
| Personal | 2193 px |
| Esta vez no puedo | 2233 px |

Todos quedan por debajo de 2600 px. En escritorio los interiores miden 2448 px. Ninguna frase necesitó abreviarse o sustituirse; no se propone copy alternativo. El 220 es el valor de ejemplo solicitado. El menú no existe en la portada ni durante el fotograma del giro. Los estados enlazan entre archivos locales: no hay envío, persistencia, calendario real ni consulta al panel. El QR contiene una cadena de muestra sin validez como acceso.

La comparación respeta el ancho original de 1440 px y la altura completa de cada referencia, sin estirar ni recortar. La caja se abrió mediante su enlace de salto; la posada mediante su control de apertura; la Mansión mediante el sello y las tres linternas para mostrar todo el contenido.

## Plan para fase 2

**Giro con CSS 3D.** Dos caras con `backface-visibility: hidden`, perspectiva de aproximadamente 1000 px y origen en el broche. Un giro de unos 180 grados en 950–1200 ms con una pequeña oscilación final; el nombre y la fecha siguen siendo HTML. Transición de cámara hacia la mesa y aparición del menú únicamente al terminar. CSS resulta suficiente para este objeto plano y evita cargar three.js. El fotograma actual sólo ilustra la orientación; no implementa esa secuencia.

**Pestañas.** Hundimiento breve al tocar, aparición del agujero, desprendimiento de la pestaña con rotación y caída corta del círculo. El QR se revela con una máscara conforme se separa la pestaña. Un estado accesible anuncia la respuesta; la confirmación real dependerá de los permisos y servicios existentes de la fase 2.

**Cordón.** Mantener la textura generada; revelar los tramos con una máscara SVG siguiendo su recorrido y una oscilación mínima al asentarse. Sin animación infinita ni seguimiento continuo del scroll. Ajustar los empalmes de los tramos en la implementación para dar continuidad física al recorrido. Precargar la siguiente pieza después de la portada.

**Accesibilidad y controles.** Saltar lleva directamente al interior, incluidas entradas por ancla. Con movimiento reducido se muestran los estados finales sin giro, caída ni desplazamiento de cámara; sólo cambios breves de opacidad. Enlaces y pestañas conservan respuesta de foco, hover y toque.

## Peso previsto

[Presupuesto reproducible](pesos.json), imágenes sin fuente/HTML/CSS y selección de recursos a DPR 1:

| Escenario | Móvil | Escritorio |
|---|---:|---:|
| Portada | 321,064 B | 413,644 B |
| Interior personal | 504,810 B | 1,013,170 B |
| Recorrido completo, fondo compartido | 551,822 B | 1,152,762 B |

En DPR alto el navegador puede elegir las variantes grandes: reservar aproximadamente 1.2 MB para el arte del recorrido. El catálogo completo de exportación ocupa 2.28 MB; no debe cargarse completo. La imagen social se utiliza fuera del recorrido. CSS 3D no añade un motor 3D al presupuesto.

## Reproducir y commits

Herramientas locales: Node, Playwright/Chrome y sharp. `sharp` se instaló temporalmente con `--no-save --package-lock=false`; no se cambiaron manifiestos de dependencias. Ejecutar desde la raíz del worktree:

```sh
node documentacion/gafete/prepare-assets.mjs
node documentacion/gafete/build-sketch.mjs
node documentacion/gafete/capture-sketch.mjs
node documentacion/gafete/capture-references.mjs
node documentacion/gafete/compose-review.mjs
node documentacion/gafete/asset-budget.mjs
```

Commit de arte: `61cf630` — Crea arte original para el concepto El gafete.
El commit de este informe y del boceto se identifica con `git log -1 --oneline` en `codex/gafete` (mensaje: «Documenta y captura el boceto estático de El gafete»).

La fase 2 queda pendiente de aprobación del boceto.
