# El gafete · Correcciones de fase 2b

Rama `codex/gafete`. `git fetch origin` confirmó `origin/main = 73dd1f2`. Sin push, merge ni cambios en `main`.

## Carga real de la escena

Todas las imágenes tienen dimensiones intrínsecas en HTML y mantienen su proporción al escalar. Al terminar el giro se solicitan en segundo plano la tarjeta, los cuatro cordones y la papelería. La portada sigue cargando primero.

Había dos causas: las cajas de tamaño cero bloqueaban la carga diferida, y observar directamente un cordón completamente enmascarado impedía su revelado. Ahora se observa la sección que lo contiene. La tarjeta de registro, el ojal, la pluma y los cuatro tramos del cordón aparecen durante el recorrido normal.

`scripts/gafete-real-journey.mjs` solo toca, desplaza con la rueda e inspecciona el resultado. No modifica `loading`, no llama a `decode()` ni añade clases de revelado. `check-gafete-browser.mjs` lo usa a 390 y 1440 px, con entrada normal, `#cuando` y enlace personal válido obtenido del panel. En los seis casos exige imágenes visibles con `naturalWidth > 0` y caja positiva, además de verificar explícitamente el registro y los cuatro cordones cargados y revelados.

## Correcciones visuales y formato

- El frente usa el cordón del reverso, sin ampliar el recorte pixelado anterior.
- Subtítulo uniforme `#03121b`, sin mezcla ni opacidad y con el texto por encima de la luz adyacente: 17 px en móvil y 22 px en escritorio. Contraste mínimo medido sobre el fondo real: 4.61:1 y 5.06:1, respectivamente. La prueba también examina los píxeles de cada línea: el color CSS por sí solo no detectaba la luz pintada encima. Las dos líneas móviles y la línea de escritorio contienen la tinta exacta, con diferencia cero respecto al color declarado. Se conserva la textura original, sin filtros adicionales.
- Formulario personal: aviso, quién responde, nombre editable si corresponde, pestañas y guardar. El selector conserva teclado nativo con textura tejida, borde recortado, flecha propia y respuesta al foco y apertura. Se respeta movimiento reducido.
- JS y CSS de la plantilla están formateados, con declaraciones legibles, funciones separadas y comentarios sobre las decisiones de carga, foco y revelado.

## Historia y tamaño

La historia no publicada se sustituyó por una implementación consolidada sobre `73dd1f2`. El commit de implementación después de reescribir es **`9215394`**, «Implementa El gafete con recursos depurados y carga fiable de la escena». El cierre documental se registra en un commit posterior.

El respaldo anterior permanece fuera del repositorio en `../gafete-antes-fase-2b.bundle`; los originales PNG y recursos descartados, en `../gafete-archivo-2b/`. No se incluyeron en la nueva historia. Las capturas completas permanecen en disco y están ignoradas por Git.

| Carpeta versionada | Tamaño aproximado |
| --- | ---: |
| `documentacion/gafete/` | 0.34 MB |
| `artwork-source/event-gafete-v1/` | 3.31 MB |
| `public/artwork/event-gafete/` | 2.37 MB |

La rama agrega aproximadamente **6.2 MB netos**, frente a unos 260 MB. Las cifras exactas del cierre y la salida completa de `git diff --stat origin/main..HEAD` se guardan en `final/peso-rama-2b.json` y `final/diff-stat-2b.txt`.

La documentación versiona texto, JSON y scripts; no lleva `boceto/`, `capturas/`, `anterior/`, `referencias/`, PNG ni HTML de revisión. Solo quedan tres resúmenes WebP: portada **20,790 B**, interior **86,800 B** y comparación **171,688 B**, todos menores de 400 kB. Se conservan diez originales WebP comprimidos con sus prompts. La carpeta pública pasa de 80 a **23 archivos**: se retiran 57 exportaciones sin uso. El manifiesto refleja únicamente los recursos vigentes.

## Evidencia nueva, fuera de Git

Capturas obtenidas en el clon limpio mediante clic y rueda, sin forzar recursos:

- `final/interior-real-390.png` y `final/interior-real-1440.png`.
- `final/giro-real-390.png` y `final/giro-real-1440.png`.
- `final/personal-real-390.png` y `final/personal-real-1440.png`.
- `final/portada-real-390.png` y `final/portada-real-1440.png`.
- `final/real-journey.json`: dimensiones, carga y revelado de cada material en las seis entradas.
- `final/subtitle-2b.json`: tamaño, color, opacidad y contraste del subtítulo.

Los informes de fases anteriores se identificaron como históricos: sus capturas forzaban la carga y sus hashes pertenecen a la historia archivada.

## Validación en clon limpio

Clon independiente `../gafete-verificacion-2b`, creado con `git clone --no-local`, sin `dist/`. Dependencias instaladas con `npm ci`; Playwright y Sharp se instalaron sin modificar el manifiesto ni el lockfile.

TypeScript, las 332 pruebas y `check:build` pasan. El JavaScript del gafete pesa **18,496 B gzip**, por debajo de 120,000 B. Las pruebas de navegador y sus resultados finales se registran en los archivos `final/clone-*-2b.log`.

Todas las suites terminaron con código 0:

- Gafete: seis recorridos reales, materiales cargados y revelados, tinta uniforme por línea, menú inerte, teclado, salto, Escape, movimiento reducido, reloj simulado, radios, QR por paquete y confirmación personal.
- Celebraciones: 21 casos aprobados.
- Panel: tres muestras públicas, ida y vuelta personal, Aurora, Boreal archivado, teclado, capacidad y recordatorios manuales.
- Teléfonos: 12 teléfonos, 13 etiquetas sin cruce con la pantalla y 40 combinaciones sin desbordamiento.
- Movimiento: 152 combinaciones ES/EN, cuatro anchos y dos temas; cero fallos y cero desbordamientos. También se verifica teclado sin JavaScript.
- Captura final: recorrido real, cero fallos de contraste, unos 60 fps durante el giro (CPU móvil 4×) y 2535 px de altura pública neutral a 390 px.

No se modificaron el servidor ni los archivos compartidos de las otras invitaciones. El clon y el worktree quedan sin cambios pendientes.
