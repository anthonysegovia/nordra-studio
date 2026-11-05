> Informe histórico anterior a la reescritura de la fase 2b. Los hashes y las rutas de arte antiguos se conservan como contexto local. La evidencia y validación vigentes se documentan en [FASE-2B.md](FASE-2B.md); las capturas anteriores forzaban la carga y no demuestran el recorrido real.

# El gafete · Fase 2

Implementación local de `/invitaciones/conexion-27/` sobre el boceto aprobado de fase 1b. Rama `codex/gafete`, base `origin/main` verificada en `73dd1f2`. Sin push, merge ni cambios del servidor.

## Resultado

La portada usa la piedra arena del interior. El botón del gafete abre con un giro CSS de 2.6 s, destello y frente con nombre en HTML. Escape y «Entrar sin animación» terminan la apertura; movimiento reducido usa un fundido de 240 ms. El menú y el interior permanecen ocultos e inertes hasta terminar, incluso con fragmentos de sección o personales. La navegación devuelve el foco al contenido sin desplazar un contenedor oculto.

La agenda, fecha, nombres y confirmaciones son HTML. El cordón y la papelería entran al desplazarse y se detienen para leer. Las tres tarjetas admiten toque y flechas, estado seleccionado y anuncio accesible. Los radios de confirmación perforan la pestaña durante 300 ms y la separan 12 px con sombra. La otra pestaña atenúa su papel al 50 %; su texto conserva contraste.

El adaptador personal existente conserva selector por persona, edición del acompañante y guardado en el panel de muestra. Solo una respuesta afirmativa con `passLink` real muestra QR. La muestra pública y Aurora no fabrican pases. El calendario y los datos del servidor permanecen intactos.

Los teléfonos de Eventos, la tarjeta de Invitaciones y la bienvenida del panel usan el nuevo gafete. El teléfono del héroe conserva la apertura al tocar; el segundo conserva su función estática. La imagen social conserva los anillos y la marca. Se agregó la regla solicitada a `AGENTS.md`.

## Evidencia local

Las capturas y videos están en `final/`, excluidos de Git:

- `recorrido-390.webm` y `recorrido-1440.webm`: 19 segundos, apertura completa, recorrido, tarjetas y confirmación.
- `portada-{390,1440}.png`, `giro-{390,1440}.png` e `interior-{390,1440}.png`.
- `acceso-neutral-*`, `acceso-si-*`, `acceso-personal-aurora-*` y `acceso-personal-boreal-*`.
- `comparacion-{390,1440}.png`: final junto al boceto aprobado.
- `camila-30-{before,after}-*` y `valentina-y-sebastian-{before,after}-*`: portada e interior con reloj fijo.
- `rendimiento-contraste.json`, `browser-checks.json` y registros de las comprobaciones.

## Configuración

Editar `src/celebrations/gafete/config.mjs`: nombre, línea, fecha ISO, hora, zona IANA, sede, ciudad, calendario, agenda, tres tarjetas, textos y paleta. `README.md` incluye un ejemplo de Congreso Nexo con cuatro momentos y sede por confirmar. El calendario debe corresponder a la nueva fecha. Si cambia la marca impresa del reverso, también se reemplazan sus dos recursos y la imagen social, como explica el README.

## Textos adicionales propuestos

Se conservan literalmente los mensajes aprobados, incluido el punto entre el guardado personal y la respuesta. Para los estados nuevos se usan:

- Últimas horas antes del día local: «Faltan {h} h y {m} min para encontrarnos».
- El día del evento en Monterrey: «Hoy nos encontramos».
- Desde el día siguiente: «Gracias por venir».
- Formulario personal: «Confirma por cada persona invitada», «Tu nombre» y «Guardar mi respuesta».
- Accesibilidad: «Volver a la portada», «Invitación», «Pase QR» y los nombres de las secciones.

Los mensajes de error del adaptador personal se reutilizan, sin alterar su contrato. No se inventaron direcciones ni nuevos datos del evento.

## Commits de implementación

- `bf51d83` — Construye El gafete con apertura CSS y confirmación personal
- `dc203ee` — Actualiza los teléfonos y el panel de Eventos con El gafete
- `938ff2b` — Verifica apertura accesible, pestañas y pases del gafete
- `ad03369` — Separa los enlaces del registro de su sombra para contraste AA
- `0df63d8` — Integra el selector personal en la cinta del formulario

## Mediciones finales

Chrome local, viewport de 390 × 844 o 1440 × 1000, sin limitar la red. CPU 4× más lenta en móvil durante la apertura; CPU normal en escritorio. Son mediciones reproducibles de laboratorio, no tiempos de una conexión móvil real.

| Medida | Móvil | Escritorio |
| --- | ---: | ---: |
| Imágenes iniciales, cuerpo | 43,708 B | 128,626 B |
| Imágenes iniciales, transferencia con cabeceras | 44,308 B | 129,226 B |
| Primera pintura / FCP / LCP | 324 ms | 104 ms |
| FPS medios durante el giro | 60.00 | 60.00 |
| FPS según intervalo mediano | 59.88 | 59.88 |
| Intervalo de fotograma p95 | 16.8 ms | 16.8 ms |
| Altura neutral del interior | 2535 px | 4501 px |
| Altura con mensaje público de sí | 2588 px | 4548 px |
| Contraste mínimo medido | 4.61:1 | 5.06:1 |

JavaScript total: **18,319 B gzip**, incluyendo importaciones dinámicas, confirmación personal y QR; presupuesto obligatorio de 120,000 B en `check:build`. No contiene Three. Los dos tamaños del reverso pesan 34,244 y 64,560 B; en móvil de alta densidad la piedra y el reverso suman 74,024 B de cuerpo. La carga inicial observada solo contiene piedra y reverso; frente e interior se solicitan después.

El contraste se calcula contra el fondo compuesto de cada carácter, ocultando temporalmente la tinta para muestrear el fondo real. Incluye subtítulo, menú, enlaces, sede, agenda, tarjetas, fecha y nombre sobre holograma, pregunta, pestañas y aviso de muestra. El subtítulo obtiene 4.61:1 en móvil y 5.06:1 en escritorio. Los enlaces de escritorio se separaron 28 px más de la tarjeta para salir de su sombra y superar 5.5:1. Se revisaron visualmente las capturas completas y los accesos personales.

El formulario personal añade contenido: en la captura con persona seleccionada mide 2605 px a 390 px. Sus mensajes posteriores pueden ampliar la escena. Los dos videos duran exactamente 19.000 s, comprobados con `ffprobe`.

## Regresiones

Camila 30: portada e interior a 390 y 1440 px coinciden exactamente, con cero píxeles diferentes. Valentina y Sebastián: ambas portadas también coinciden exactamente; interiores con iguales dimensiones y composición, con diferencias leves de color (máximo 3/255 por canal en móvil y 8/255 en escritorio). No se modificaron sus archivos, los estilos compartidos ni el servidor. El detalle de la comparación está en `final/regression-comparison.json`.

## Comprobaciones

El worktree estaba limpio y se eliminó `dist/` antes de ejecutar la validación. TypeScript, 332 pruebas unitarias y de contratos, comprobaciones de Posada y presupuestos de compilación pasan. La evidencia de navegador está en los registros de `final/`.

La matriz final comprueba apertura con teclado, menú inerte, anclas, salto, Escape, movimiento reducido, mensaje sin JavaScript, reloj simulado, tarjetas, ambos radios, QR condicionado al paquete y la ida y vuelta con el controlador real del panel de muestra. Todas las suites terminaron con código 0:

- `check-gafete-browser.mjs`: estados, teclado, fecha, pases y formulario con cinta verificados.
- `check-celebrations-browser.mjs`: 21 casos aprobados.
- `check-panel-experience-browser.mjs`: tres muestras públicas, ida y vuelta personal, Aurora, Boreal archivado, teclado, capacidad y recordatorios manuales aprobados.
- `check-phone-open-browser.mjs`: 13 etiquetas sin cruce con la pantalla, 12 teléfonos y 40 combinaciones sin desbordamiento; clic, Enter, toque y enlaces sin JavaScript aprobados.
- `check-interaction-motion-browser.mjs`: matriz completa ES/EN, cuatro anchos y dos temas; cero fallos de movimiento y cero páginas desbordadas. Incluye interacción reducida, pausa y acordeones con teclado sin JavaScript.
- `capture-gafete-final.mjs`: presupuesto de altura pública, FPS y contraste aprobados; videos y comparaciones generados.
