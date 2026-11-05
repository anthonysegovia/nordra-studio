> Informe histórico anterior a la reescritura de la fase 2b. Los hashes y las rutas de arte antiguos se conservan como contexto local. La evidencia y validación vigentes se documentan en [FASE-2B.md](FASE-2B.md); las capturas anteriores forzaban la carga y no demuestran el recorrido real.

# El gafete · Fase 1b

Nuevo interior estático con piedra cálida, papelería impresa y objetos de mayor escala. Se trabajó en `wt-gafete`, rama `codex/gafete`, desde `23dff5c`. `git fetch origin` confirmó `origin/main = 73dd1f2`. Sin push, merge ni cambios en `main` o en `invitaciones/conexion-27/`.

## Ver el resultado

- [Boceto navegable](boceto/portada.html): conserva la portada aprobada, enlaza al giro y al interior
- [Comparación con La caja de regalo, ambas a 1440 px](boceto/comparacion-caja-v2.png) · [vista reducida](boceto/comparacion-caja-v2-vista.png)
- [Comparación con el interior anterior, ambas a 1440 px](boceto/comparacion-anterior-v2.png) · [vista reducida](boceto/comparacion-anterior-v2-vista.png)
- [Hoja de las piezas seleccionadas](arte-v2.png)

Las comparaciones conservan las alturas completas y la misma escala; el espacio bajo la versión más corta pertenece al lienzo de revisión, no a la invitación.

| Captura nueva | 390 px | 1440 px |
|---|---|---|
| Giro con cordón | [Ver](boceto/giro-390.png) | [Ver](boceto/giro-1440.png) |
| Interior sin elegir | [Ver](boceto/interior-390.png) | [Ver](boceto/interior-1440.png) |
| Interior con Ahí estaré elegido | [Ver](boceto/elegido-390.png) | [Ver](boceto/elegido-1440.png) |
| Interior personal | [Ver](boceto/personal-390.png) | [Ver](boceto/personal-1440.png) |
| Acceso sin elegir, detalle | [Ver](boceto/acceso-interior-390.png) | [Ver](boceto/acceso-interior-1440.png) |
| Acceso elegido, detalle | [Ver](boceto/acceso-elegido-390.png) | [Ver](boceto/acceso-elegido-1440.png) |
| Acceso personal, detalle | [Ver](boceto/acceso-personal-390.png) | [Ver](boceto/acceso-personal-1440.png) |
| Respuesta no | [Ver](boceto/no-390.png) | [Ver](boceto/no-1440.png) |

## Cambios de composición

La piedra arena tiene vetas suaves y sombras de ventana en todo el recorrido; la orientación de la luz alterna entre secciones mediante capas con bordes difuminados. El cordón nuevo tiene trama visible, reverso, torsión y sombra. Pasa bajo la papelería sin tapar las frases.

El registro incorpora impresión, anillos, canto de cartulina, ojal con cordón y pluma metálica. El `220` mide 124 px en escritorio y 50 px en móvil, frente a 78 y 34 px de la hora. En móvil los enlaces quedan juntos debajo de la tarjeta para conservar la lectura.

El programa tiene pliegues, línea de tiempo y los cuatro momentos impresos con horas grandes. Una taza de café acompaña la hoja. El abanico es una composición física compacta con iconos de prenda, tarjeta y taza; los textos están impresos en las zonas expuestas de las tres tarjetas. Se conserva además una lámina con las tarjetas individuales.

El frente lleva anillos pequeños, marca, franja, fecha, línea para el nombre y marco QR. En el giro conserva el cordón completo; en el acceso usa un acercamiento al gafete y al broche. Nombre y cantidad de lugares son HTML variable. Los dos boletos impresos cuelgan del borde inferior; el elegido tiene perforación limpia, desplazamiento y círculo desprendido. El QR de muestra aparece únicamente en los estados afirmativos. Las impresiones de tarjetas y boletos se revisaron visualmente a escala 1:1, con tamaño aparente superior a los mínimos solicitados.

Los títulos de sección miden **88 px en escritorio y 40 px en móvil**. La composición usa objetos libres superpuestos al cordón; no usa columnas fijas de título e imagen. En escritorio las secciones ocupan aproximadamente una pantalla, con un único protagonista por sección.

## Alturas y verificación

| Estado | Alto a 390 px | Alto a 1440 px |
|---|---:|---:|
| Sin elegir | 2580 px | 4430 px |
| Ahí estaré | 2580 px | 4466 px |
| Personal | 2580 px | 4466 px |
| Esta vez no puedo | 2580 px | 4466 px |

Chrome: 390 × 844 y 1440 × 1000, DPR 1. Las doce vistas pasan comprobaciones de ancho, imágenes cargadas, errores de consola/HTTP y tamaño de títulos. Todos los interiores móviles cumplen el máximo de 2600 px. Revisión visual adicional de los textos impresos, enlaces del registro, nombre personal, QR y separación de boletos. [Resultados completos](comprobaciones-v2.json).

**La portada está intacta:** sus archivos no cambiaron y ambas capturas son idénticas píxel por píxel a `23dff5c`, incluyendo sus hashes SHA-256. [Prueba](portada-conservada.json).

No se abreviaron ni sustituyeron frases. «Registro» es la única palabra nueva impresa, solicitada explícitamente en esta fase. El conteo sigue siendo el ejemplo `220`. El menú permanece ausente en portada y giro. No hay envío real, persistencia, integración de panel ni pase válido: siguen siendo estados estáticos de revisión. El código QR conserva la cadena de muestra de la fase 1.

## Arte, originales y prompts

Generación y ediciones mediante la herramienta integrada de la skill `imagegen`. Se guardaron **14 originales nuevos y sus 14 prompts**, incluidas las iteraciones no seleccionadas, sin sobrescribir los originales de la fase 1.

- [Manifiesto de originales y selección](../../artwork-source/event-gafete-v1/manifest-v2.json)
- [Carpeta de prompts](../../artwork-source/event-gafete-v1/prompts/), archivos con sufijo `-v2.txt`
- [Recursos web y metadatos](../../artwork-source/event-gafete-v1/web-assets-v2.json): 28 WebP, dos tamaños por pieza exportada
- [Carpeta web](../../public/artwork/event-gafete/), nuevos archivos con `v2` en su nombre

Piezas: frente para giro, frente impreso para acceso, mesa cálida, cordón tejido, registro con pluma, programa impreso, tarjetas individuales, abanico compacto, boletos sin perforar/perforados y café. Los PNG conservan sus canales alfa; la mesa es opaca. El frente de acceso generado conserva un halo exterior: el boceto usa un contorno CSS que lo excluye al componerlo sobre la piedra. Ese contorno forma parte del tratamiento visual y debe conservarse si se reutiliza ese recorte; no usar el WebP aislado sin él. Las alternativas no seleccionadas quedan identificadas en el manifiesto.

Presupuesto aproximado del interior personal con las variantes pequeñas: **1.04 MB**; con las grandes: **2.34 MB**, antes de fuente y HTML/CSS. [Detalle](pesos-v2.json). El conteo no incluye la imagen de compartir ni las hojas de exportación que no se utilizan en el recorrido. Es un presupuesto de selección de variantes, no una medición de red: DPR y `sizes` pueden hacer que el navegador elija archivos mayores.

## Reproducir

Desde la raíz del worktree, con las dependencias locales preparadas en fase 1:

```sh
node documentacion/gafete/prepare-assets-v2.mjs
node documentacion/gafete/build-sketch-v2.mjs
node documentacion/gafete/capture-v2.mjs
node documentacion/gafete/compose-v2.mjs
node documentacion/gafete/inventory-v2.mjs
```

Usar los scripts `v2` para este boceto. Los scripts sin ese sufijo corresponden a la fase anterior. No se modificaron `package.json` ni el lockfile.

## Commits locales

- `4d77dd3` — Rehace la papelería impresa y el material de El gafete
- El commit que contiene este informe: «Recompone el boceto de El gafete y documenta la fase 1b»; consultar `git log -1 --oneline` en `codex/gafete`

La fase 2 continúa pendiente de aprobación; aquí sólo hay arte, HTML/CSS del boceto y herramientas de captura dentro de documentación.
