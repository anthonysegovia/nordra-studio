# Plan de dirección creativa y ejecución — Boda premium

**Proyecto:** Nordra Studio · demostración de boda en Cancún  
**Fecha del análisis:** 21 de octubre de 2026  
**Destinatario:** SOL / agente de implementación  
**Estado:** P0 y P1 implementados; optimización P2 realizada, con validaciones externas pendientes. Implementación autorizada expresamente por el usuario el 21 de octubre de 2026. El diagnóstico original se conserva como referencia histórica.

## 1. Mandato y límites

Elevar la invitación a una experiencia editorial, cálida y cinematográfica, conservando su utilidad para los invitados. El efecto premium debe surgir de la composición, la fotografía, el contraste y la continuidad del movimiento.

En esta entrega se crea exclusivamente este Markdown. No instalar dependencias, modificar archivos de la invitación, cambiar arquitectura, eliminar funcionalidades ni intervenir otros proyectos. Los pasos de implementación descritos aquí son trabajo futuro, sujeto a que el usuario solicite ejecutarlo.

### Decisiones de producto que SOL debe respetar

- La temática es playa en Cancún. Los nombres actuales de demostración son **Valentina y Sebastián**, iniciales **V & S**.
- Conservar fecha y horarios actuales de muestra: **19 de junio de 2027**, ceremonia **17:00**, recepción **19:00**, hora de Cancún. No tratarlos como datos reales confirmados.
- La sede está **por confirmar**. No inventar hoteles, direcciones, coordenadas, mapas, teléfonos o enlaces de regalos.
- El usuario prefiere lenguaje natural: rechazó frases como «Tú, yo y la marea» y otras metáforas sentimentales.
- Ya se retiraron números de capítulos, «La ilusión» y el ritual «Para los novios» de encender una estrella. **No reintroducirlos** como storytelling ni como función nueva.
- Mantener «Para nuestro gran día faltan» inmediatamente junto al contador.
- La apertura de carta y perla fue bien recibida; el azul dominante resultó excesivo. La entrada evolucionó a arena y coral con luz de atardecer. No volver a una pantalla predominantemente azul.
- El usuario quiere más delicadeza en las transiciones. No confundirla con esperas largas, contenido invisible o numerosas animaciones simultáneas.
- No eliminar las fotos aportadas, la navegación, la modalidad nocturna, el dresscode, el calendario ni el RSVP de muestra.

## 2. Alcance y evidencia del diagnóstico

Se revisaron los archivos de la invitación y únicamente dependencias relacionadas: `package.json`, `vite.config.ts` y el enlace de acceso en `src/sections/Events.tsx`. No se analizaron servicios de pago, API, datos privados ni otras demos.

Se inspeccionó la apertura en navegador, se navegó a la celebración y se activó «El brindis». El panel seleccionado y su imagen de recepción aparecen en el árbol accesible. Se realizó una inspección estrecha: el navegador solicitó un viewport de 390 × 844, pero reportó **325 CSS px de ancho efectivo**; usar esa medición como evidencia, no como prueba certificada de un dispositivo de 390 px. En esa medición no hubo desbordamiento horizontal y el panel de recepción midió aproximadamente 746 px de alto. Se restauró el override de viewport.

Se observaron tamaños computados de 10 px en etiquetas del menú, 8 px en pies de imágenes de escena y 9 px en «Sede por confirmar». Son oportunidades de legibilidad, no mediciones completas de conformidad WCAG. Falta validación en Safari iOS, Android físico, lector de pantalla, red lenta y movimiento reducido. No hay mediciones de Lighthouse o Core Web Vitals en esta auditoría.

Las imágenes de ceremonia y recepción y el fundido de pestañas **ya están incorporados en el código inspeccionado**: no presupuestarlos como funcionalidades inexistentes. Necesitan validación y refinamiento.

### Arquitectura actual

| Elemento | Situación comprobada |
|---|---|
| Proyecto anfitrión | React 19, TypeScript, Vite 7, Tailwind 4; scripts `dev`, `build` y `preview` |
| Invitación | Documento HTML independiente en `public/demos/boda-jardin/index.html`; no es un componente React |
| Estilos | CSS inline extenso en HTML, seguido por `magic.css` y `beach.css`; este último contiene numerosos overrides sucesivos |
| Comportamiento | Script inline al final del HTML y `magic.js` cargado después; comparten funciones globales |
| Movimiento | CSS animations/transitions, `IntersectionObserver` y Web Animations API (`Element.animate`) |
| Accesibilidad existente | `lang=es`, botones nativos, foco visible, tabs con ARIA y teclado, `dialog`, `details/summary`, consultas `prefers-reduced-motion` |
| Dependencias instaladas | React, React DOM, Vite, Tailwind, Lucide React, Supabase JS y herramientas TypeScript |
| Librerías de animación | No aparecen GSAP, Motion/Framer Motion ni Lenis en `package.json`; no se requieren para este plan |
| Datos/remoto | La invitación no usa Supabase ni un backend para confirmar asistencia |
| Ruta de acceso | `/demos/boda-jardin/index.html`; conservarla para no romper enlaces |

No migrar esta demo a React, no modificar Vite y no añadir un framework de animación. Conservar la organización actual; ordenar reglas y funciones dentro de los archivos afectados durante una implementación autorizada.

### Inventario de archivos y recursos

Rutas relativas a la raíz que contiene este documento:

| Archivo | Responsabilidad / tamaño observado |
|---|---|
| `public/demos/boda-jardin/index.html` | Estructura, CSS original y lógica inline; 58.982 bytes |
| `public/demos/boda-jardin/magic.css` | Primer conjunto de efectos y atelier; 5.935 bytes |
| `public/demos/boda-jardin/beach.css` | Identidad de playa, apertura, fotos y movimiento reciente; 20.672 bytes |
| `public/demos/boda-jardin/magic.js` | Decoración de apertura, modo nocturno, paleta, animación de nota; 4.999 bytes |
| `photos/recuerdo-1-800.jpg`, `recuerdo-2-800.jpg` | Fotos aportadas optimizadas; aproximadamente 75 y 81 KB |
| `photos/recuerdo-1-1600.jpg`, `recuerdo-2-1600.jpg` | Variantes grandes; aproximadamente 211 y 248 KB |
| `photos/ceremony-beach.jpg` | Ambientación generada de altar frente al mar; aproximadamente 376 KB |
| `photos/reception-beach.jpg` | Ambientación generada de mesa y luces al atardecer; aproximadamente 310 KB |

Los nombres `photos/...` corresponden al directorio `public/demos/boda-jardin/photos/`. Los originales aportados están en `E:\Nordra Studio\Invitaciones\Bodas\Playa`; no modificarlos. Las dos imágenes de ambientación no documentan una sede real. Mantener esa distinción.

El enlace de entrada de `src/sections/Events.tsx` todavía muestra «Tracy & Diego» aunque la demo ya usa Valentina y Sebastián. Es una inconsistencia del punto de acceso detectada, **fuera de la implementación acotada a la invitación**. Registrar para una tarea separada; no editar ese archivo con este plan.

### Secciones, funciones y limitaciones

| Sección / función | Existe hoy | Mejorar o proponer |
|---|---|---|
| Sobre inicial | Sobre coral, perla, sello postal, olas, aves, partículas y rayos; apertura de 3.200 ms | Conservar concepto; dar continuidad hacia portada y reducir competencia visual |
| Portada | Nombres, fecha, Cancún y botón «Mar bajo las estrellas» | Mejorar jerarquía y armonía con el atardecer |
| Historia | Dos fotografías con marco e inclinación, texto y firma | Composición editorial y ampliación accesible propuesta |
| Fecha | Tarjeta, cuenta regresiva activa y frase junto al contador | Evitar títulos duplicados; mejorar lectura móvil |
| Celebración | Tabs «El sí» y «El brindis», imágenes, horarios y sede pendiente | Afinar fundido existente, encuadres y carga de imágenes |
| Dresscode | Ilustración de vestido y traje; cuatro colores cambian vestido/corbata | Aumentar legibilidad y pulir selección táctil |
| Regalos | Nota desplegable, sin enlaces ni aportaciones | Mejorar apertura; enlaces reales únicamente con datos suministrados |
| RSVP | Dialog con asistencia y 1–4 personas; confirmación simulada | Pulir flujo demo; envío real es otro alcance |
| Calendario | Descarga `.ics`; hora inicial 22:00 UTC = 17:00 Cancún | Validar importación y duración de muestra |
| Menú | Cinco anclas fijas, indicador de sección visible | Orientación más estable y tratamiento de enlaces profundos |
| Música | No implementada | Opcional, diferida, nunca autoplay |
| Mapas / direcciones | No implementados; sede no confirmada | Solo tras recibir ubicación verificable |
| Mensajes a novios | No implementados | No prioritarios; no recrear el ritual rechazado |
| Timeline biográfica | No implementada ni hay hitos suministrados | No proponer fechas o historias ficticias |

### Problemas de mayor impacto

1. **La apertura y el cuerpo parecen dos tratamientos distintos.** El coral cálido de entrada contrasta con amplios bloques turquesa/azul del resto sin una transición editorial consistente.
2. **Exceso de capas de CSS.** `.gate`, `.hero`, `.reveal`, `.count` y otras clases se redefinen sucesivamente. Agregar otro bloque de overrides complica predecir el resultado, especialmente en móvil y movimiento reducido.
3. **Hay movimiento sin pausa contextual.** Decoraciones con animación infinita pueden seguir trabajando fuera de pantalla; falta un control claro de animación decorativa prolongada.
4. **El cambio de pestaña mejoró, pero requiere endurecimiento.** La implementación cancela animaciones y reinicia opacidad a 0/1; los toques rápidos pueden producir cortes. La altura del contenedor puede cambiar cuando termina el solapamiento de paneles.
5. **Textos secundarios demasiado pequeños.** La elegancia depende hoy de reducir mucho tamaños; el lugar, horario y condición de demo merecen lectura cómoda.
6. **Dependencia de JavaScript para acceder.** `#invitation` comienza con `hidden`; sin JavaScript no existe una salida funcional del sobre. Es un riesgo confirmado por estructura, no una prueba de fallo ejecutada.
7. **El deep link se pierde al abrir.** El handler ejecuta `window.scrollTo(0,0)` sin resolver la intención de `#historia`, `#detalles`, etc.
8. **La atención se dispersa en etiquetas repetidas.** La recepción repite su nombre en foto, eyebrow y título; RSVP repite «Confirma tu asistencia / Confirmar nuestra asistencia». Simplificar copy sin eliminar información ni funciones.

## 3. Concepto elegido: «Cancún, a la hora dorada»

Una invitación que comienza como una pieza de papelería al atardecer y se abre hacia un álbum breve y una celebración frente al mar. La emoción se cuenta con las fotografías y la anticipación de los momentos del evento; el texto informa con cercanía.

**Por qué encaja:** mantiene la apertura aprobada, las fotos existentes y el dresscode interactivo; conecta las escenas de ceremonia y recepción mediante el paso natural del día a la noche; responde al rechazo del exceso de azul y las frases cursis.

No usar scroll secuestrado, vídeo de fondo, cámara 3D, confeti generalizado, números de capítulos ni rituales sin resultado. No inventar una biografía para justificar una línea del tiempo.

### Sistema visual propuesto

| Uso | Especificación inicial |
|---|---|
| Fondo principal | Arena clara `#F4E8D8` |
| Superficies de contenido | Marfil `#FFFCF7`; diferenciar del fondo con espacio y borde `#B99A82`, no solo otro beige casi idéntico |
| Texto principal | Cacao `#493A33` |
| Texto secundario | Pizarra cálida `#5D625E` |
| Acento coral | `#BE8976`; usar como superficie, no asumir contraste válido para texto pequeño |
| Acento marino | Petróleo `#245967` en controles y pequeños bloques; reservar fondos extensos oscuros para recepción/modo nocturno |
| Luz | Oro apagado `#A67943`, solo decorativo o previamente contrastado |

Validar todos los pares reales. Objetivo: 4,5:1 en texto normal; 3:1 en texto grande y elementos gráficos funcionales. Las cifras son criterios futuros, no certificación de la paleta actual.

Conservar **Cormorant Garamond** para nombres y títulos, **Jost** para información y controles. No cargar una tercera familia. Texto operativo móvil 15–16 px; auxiliares al menos 12 px; leyendas de imagen 11–12 px; menú 11–12 px y áreas táctiles ≥44 × 44 px. Evitar mayúsculas con tracking amplio en frases largas.

Espaciado base: 8 px; márgenes móviles 20–24 px; separación de secciones 56–72 px; escritorio 80–112 px. Limitar cuerpo a 960–1040 px y lectura a 55–65 caracteres. Probar 320 px sin cortes de nombres ni controles.

## 4. Recorrido del invitado

1. **Recibe:** un sobre coral y una instrucción clara. El movimiento principal pertenece a la perla; el fondo acompaña.
2. **Abre:** la carta emerge; los nombres aparecen sobre una superficie que comparte la luz de entrada. Sin negro intermedio ni salto de scroll.
3. **Reconoce:** fecha, destino y fotografía permiten entender inmediatamente quién se casa y dónde.
4. **Recorre:** dos recuerdos reales aportados; el álbum puede ampliarse si se desea. No exige interacción para continuar.
5. **Se organiza:** fecha y contador juntos; «Guardar fecha» sigue disponible.
6. **Imagina el evento:** ceremonia luminosa y recepción nocturna se alternan con un fundido estable.
7. **Resuelve dudas:** vestimenta y regalos con información breve y visible.
8. **Responde:** una acción inequívoca; el demo indica que no registra ni envía datos.

El invitado debe poder consultar fecha, horario y confirmación sin esperar todas las animaciones ni recorrer obligatoriamente el álbum.

## 5. Especificaciones ejecutables de mejoras

En las fichas siguientes los nombres de componentes describen bloques del DOM, **no nuevos componentes React**. `HTML`, `CSS` y `JS` significan respectivamente `index.html`, `beach.css`/`magic.css` y el script inline/`magic.js` dentro de `public/demos/boda-jardin/`.

### M01 — Sistema visual coherente · P0 · complejidad media

**Objetivo:** que apertura, álbum y detalles pertenezcan a una misma pieza; contraste claro sin saturación azul.

**Comportamiento:** mantener colores de noche cuando se activa el modo nocturno; el resto usa arena, coral y pequeñas superficies marinas.

**Archivos/tecnología:** CSS inline, `magic.css`, `beach.css`; variables CSS existentes.

**Pasos:** inventariar reglas activas de cada bloque; crear tokens de color, espacio y duración en `:root`; consolidar en el bloque correspondiente de los archivos existentes las reglas supersedidas; reemplazar hardcodes de texto y fondos por tokens. No añadir una cuarta hoja de overrides. No borrar un selector sin buscar uso en HTML y JS. Mantener fallback tipográfico.

**Responsive/accesibilidad/rendimiento:** aplicar medidas anteriores; evitar filtros de fondo en pantallas completas; hacer auditoría de contraste y zoom al 200%.

**Aceptación:** ninguna sección parece heredada de otra paleta; texto operativo ≥15 px en móvil; no desbordamiento a 320 px; todas las combinaciones funcionales pasan contraste; modo nocturno sigue disponible y legible.

### M02 — Apertura continua hacia los nombres · P0 · complejidad media

**Objetivo:** una primera impresión memorable con una sola acción y una transición sin corte.

**Bloques/archivos:** `#gate`, `.envelope`, `#open`, `#invitation`, `.hero`, `#title`; HTML, CSS y `magic.js`.

**Comportamiento:** estados `closed → opening → open`. Al tocar la perla: respuesta en ≤100 ms; perla y anillo 0–350 ms; solapa 150–750 ms; carta 450–1.350 ms; portada funde 1.050–1.650 ms; interacción disponible al terminar. No repetir automáticamente al volver de otra sección.

**Pasos:** sustituir el timeout rígido de 3.200 ms por secuencia coordinada con finalización de animación y fallback; preparar portada bajo la entrada para un fundido superpuesto; solo después retirar la entrada. Añadir «Ver invitación» discreto que use la misma finalización sin animación. Finalización idempotente para dobles toques, errores y tab de navegador en segundo plano. Conservar hash solicitado y desplazar al destino después de abrir; sin hash, enfocar el título sin scroll adicional.

**Tecnología:** Web Animations API, eventos y media queries existentes; sin librerías.

**Móvil/accesibilidad/rendimiento:** reemplazar mínimos rígidos de 680/760 px por composición adaptable a altura disponible; permitir scroll natural si no cabe. Sobre y CTA nunca se solapan. Foco pasa a un destino visible; la capa saliente deja de recibir foco. Con movimiento reducido, acceso inmediato o fundido ≤150 ms. Definir acceso sin JS mediante mejora progresiva, sin duplicar todo el contenido.

**Aceptación:** funciona con toque, Enter y Espacio; diez activaciones no producen estados parciales; no hay frame vacío; ningún invitado queda bloqueado si falla `magic.js`; `#detalles` llega a detalles tras abrir; datos accesibles en ≤1,8 s.

### M03 — Un sistema de movimiento delicado · P0 · complejidad media

**Objetivo:** continuidad, no una sucesión de elementos que saltan.

**Archivos/tecnología:** `.reveal`, observers inline, animaciones en CSS y JS; `IntersectionObserver`, WAAPI, `matchMedia`.

**Pasos:** mantener una sola entrada por sección; opacidad 0→1 y desplazamiento de 6 px, 750–1.000 ms, curva `cubic-bezier(.22,1,.36,1)`. Eliminar competencia entre animación del padre y del hijo sin eliminar bloques. Activar antes de entrar con margen inferior de 60–90 px; no ocultar de nuevo al retroceder. No animar toda una sección alta si sus primeras líneas ya son visibles al cargar un hash. Pausar loops decorativos al salir del viewport y con `document.hidden`.

**Comportamiento adicional:** añadir control discreto «Pausar animaciones» para movimiento decorativo prolongado; no detener contador ni funciones. Escuchar cambios en `prefers-reduced-motion` durante la sesión, cancelar efectos activos y dejar estado final consistente.

**Móvil/accesibilidad/rendimiento:** animar mayormente `opacity`/`transform`; limitar partículas iniciales a 8–12 en móvil; máximo dos sistemas ambientales simultáneos, por ejemplo sobre y reflejo. Aves y destellos pueden aparecer una vez y descansar. Sin scroll hijacking ni parallax en movimiento reducido.

**Aceptación:** ninguna sección desaparece al retroceder; contenido accesible si observer no existe; pausa real del movimiento decorativo; no loops activos en entrada oculta; sin tareas de animación >50 ms atribuibles al código de la invitación en la prueba objetivo.

### M04 — Ceremonia y recepción con continuidad · P0 · complejidad media

**Objetivo:** que cambiar de día a noche se sienta como pasar al siguiente momento del evento.

**Existente:** imágenes nuevas y crossfade de 850 ms; mejorar, no duplicar.

**Archivos/bloques:** `chooseScene`, `.scene-switch`, `.scene-panels`, `.garden-scene`, `.scene-art`, ambas imágenes en `photos/`; HTML y CSS.

**Pasos:** cargar/decodificar ambas imágenes cuando la sección esté próxima al viewport; si alguna falla, conservar texto y un fondo neutro. Reservar geometría de la imagen y altura estable de paneles. Mantener CSS Grid superpuesto; el panel saliente queda `inert` y `aria-hidden`, el entrante es el único accesible. En cambios rápidos, partir de opacidad/transform computados antes de cancelar, o coalescer a la última pestaña solicitada; nunca reiniciar a extremos arbitrarios. Usar token/revisión para descartar promesas antiguas. Al finalizar, aplicar `hidden` al inactivo y limpiar estilos temporales.

**Tratamiento visual:** altar con tela y mar para ceremonia; mesa, velas y guirnaldas para recepción. Preservar etiqueta «Imagen de ambientación · Sede por confirmar». Jerarquía: horario y nombre del momento, imagen, ubicación pendiente. No repetir «La recepción» tres veces. Fundido 650–850 ms; el texto puede entrar 80 ms después, desplazamiento máximo 4 px.

**Móvil/accesibilidad/rendimiento:** imagen 4:3 móvil y 4:5 escritorio, sujeto protegido con `object-position` específico por recurso. Reservar altura con `aspect-ratio`, sin altura rígida para texto. Medir ambos paneles con `ResizeObserver` si hace falta estabilizar al cambiar orientación o fuente. Preservar flechas, Home/End y tabIndex; no robar foco de la pestaña. Movimiento reducido: cambio instantáneo y limpieza de z-index/opacidad.

**Aceptación:** diez cambios rápidos y flechas alternadas terminan en la última selección; un único panel expuesto al lector de pantalla; no flash de imagen sin cargar; posición del inicio de detalles varía ≤2 px entre estados estables a igual ancho; a 320 px no se corta horario o sede pendiente.

### M05 — Álbum editorial con ampliación opcional · P1 · complejidad media

**Objetivo:** dar protagonismo a la pareja sin inventar una historia.

**Archivos/bloques:** `.shore-memories`, `.shore-photo`, fotos `recuerdo-*`, HTML, CSS, JS.

**Comportamiento:** conservar ambas fotos y orden. En escritorio, pareja de imágenes con asimetría moderada y rotación ≤2 grados; en móvil, secuencia vertical cómoda. Al tocar una foto se abre una vista ampliada con anterior/siguiente y cierre explícitos. No carrusel automático.

**Pasos:** aprovechar `srcset`/`sizes`; envolver cada imagen en un botón con nombre «Ampliar foto…». Añadir un `dialog` independiente del RSVP, reutilizando diseño sin compartir estado. Mostrar original optimizado con `object-fit:contain`, nunca recortar caras en ampliación. Predecodificar la siguiente imagen. Cerrar con Escape, botón o fondo según área clicada; devolver foco al origen. Flechas como alternativa a toque; swipe opcional, nunca único mecanismo.

**Tecnología:** DOM, `dialog`, WAAPI; ninguna librería de galería.

**Móvil/accesibilidad/rendimiento:** botones ≥44 px; carga grande solo al ampliar; texto alternativo descriptivo, no repetir nombres ficticios como identidad comprobada. Fundido 250–350 ms, sin zoom de pantalla completa en movimiento reducido.

**Aceptación:** dos imágenes visibles y ampliables; se ve fotografía completa; Escape y retorno de foco funcionan; sin navegar fuera ni descargar originales de varios MB; no aparece texto cursi ni hitos inventados.

### M06 — Fecha y contador como pieza útil · P1 · complejidad baja

**Objetivo:** hacer memorable la fecha y fácil guardarla.

**Archivos/bloques:** `#fecha`, `#count-label`, `.clock`, `tick`, `#calendar` y generador ICS; HTML/CSS/JS.

**Pasos:** mantener orden fecha/destino → frase → contador, sin elementos intercalados. `font-variant-numeric:tabular-nums`; tamaño estable para evitar saltos cada segundo. Añadir, si conviene, un acceso secundario «Guardar fecha» en esta tarjeta que invoque el mismo handler del calendario existente; conservar el botón final y evitar IDs duplicados. Mantener final de contador a cero sin valores negativos.

**Móvil/accesibilidad/rendimiento:** cuatro columnas que caben a 320 px; auxiliares legibles. No `aria-live` cada segundo. No animar individualmente todos los dígitos. Intervalo único; detener cuando ya no sea necesario y recalcular al volver a pestaña visible.

**Aceptación:** frase inmediatamente encima del contador; fecha correcta; archivo ICS importable. Preservar `DTSTART:20270619T220000Z` para 17:00 Cancún. La hora final actual `20270620T070000Z` equivale a 02:00 local: es un dato de demo, no duración real confirmada; validarlo con el usuario antes de producción, no inventar otro cierre.

### M07 — Dresscode y regalos sin saltos · P1 · complejidad baja

**Objetivo:** una interacción visual con resultado claro y detalles fáciles de consultar.

**Archivos/bloques:** `.dress-studio`, `.dress-palette`, `.dress-fabric`, `.folded-note`, `.note-inside`; HTML/CSS/`magic.js`.

**Pasos:** conservar cuatro tonos y las recomendaciones actuales. Estado seleccionado por borde e icono, además del color; nombre anunciado mediante el `role=status` existente. Transición de tela 400–550 ms. Para nota, conservar `details/summary`; completar el controlador de altura para sincronizar `intendedOpen` con el estado nativo cuando cambia la preferencia de movimiento, recalcular al redimensionar y limpiar overflow/animación al cancelar. No añadir fotos que sugieran reglas nuevas de vestimenta.

**Responsive/accesibilidad/rendimiento:** muestras ≥44 px; descripción ≥15 px. Apertura 400–550 ms sin cascada extra de hijos. Con movimiento reducido, comportamiento nativo inmediato; ningún contenido enfocable oculto por altura al cerrar.

**Aceptación:** cambio táctil y de teclado actualiza nombre y prendas; selección entendible en escala de grises; apertura/cierre rápido no deja recorte; mesa sigue declarando ausencia de enlaces y aportaciones reales.

### M08 — RSVP claro y cierre elegante · P1 · complejidad media

**Objetivo:** terminar el recorrido con seguridad, no con una simulación que parezca envío real.

**Archivos/bloques:** `.rsvp`, `#rsvp`, `#dialog`, `#form`, `#confirmation`; HTML/CSS/JS.

**Pasos:** una sola etiqueta principal «Confirmar asistencia»; secundaria «Demostración, sin envío de datos». Añadir transición breve del dialog 180–250 ms y de formulario a resultado, respetando foco. Al abrir, definir explícitamente reset o conservación de selección y aplicar el mismo criterio a `disabled` de acompañantes. Tras enviar, enfocar resultado sin saltar la página; al cerrar, devolver foco al disparador. No agregar campos personales a una demo que no los usa.

**Tecnología:** `dialog.showModal()`, controles nativos, JavaScript existente. La presencia de Supabase en el anfitrión no implica consentimiento para guardar invitados.

**Móvil/accesibilidad/rendimiento:** panel con alto máximo según viewport, scroll interior y botón cerrar siempre alcanzable; selects a 16 px mínimo; Escape, foco atrapado por dialog y mensaje de resultado accesible.

**Aceptación:** ambos caminos asistencia/no asistencia y reapertura consistentes; ningún request de envío, ninguna reserva real, ninguna promesa de guardado; teclado y toque completan el flujo sin bloqueo.

### M09 — Navegación que respeta la intención · P0 · complejidad media

**Objetivo:** consultar datos con rapidez y mantener orientación.

**Archivos/bloques:** `.story-nav`, observer de capítulos, hashes, apertura; HTML/CSS/JS.

**Pasos:** conservar cinco enlaces textuales sin números. Calcular sección activa mediante una línea de referencia consistente (por ejemplo 30% de altura visible) y no solo entries del callback actual; resolver empate por orden de lectura. Resolver hash inicial después de la apertura; soportar atrás/adelante sin reabrir el sobre. `scroll-margin` debe considerar barras y `safe-area`. No imponer duración a scroll nativo ni bloquear rueda/touch.

**Móvil/accesibilidad/rendimiento:** toda área de enlace ≥44 px; permitir texto de 11–12 px sin truncar; ancho sin overflow a 320 px. Footer, última línea y botón principal no quedan tapados. Mantener foco visible sobre el fondo oscuro.

**Aceptación:** activar cualquiera de las cinco anclas muestra su encabezado; atrás vuelve al destino anterior; un único `aria-current`; indicador estable al cruzar secciones altas; inicio con hash funcional.

### M10 — Rendimiento y resiliencia editorial · P2 · complejidad media

**Objetivo:** que la delicadeza se mantenga en un teléfono de gama media y red móvil.

**Archivos/tecnología:** los cuatro archivos de invitación, `photos/`, Google Fonts ya referenciado; APIs de navegador existentes.

**Pasos:** generar variantes de 640/960 px para escenas a partir de imágenes del proyecto cuando se autorice implementación; conservar originales. Preferir WebP/AVIF solo si la herramienta disponible lo permite, con fallback JPEG. Añadir dimensiones reales y `srcset`; usar `loading=lazy` fuera del primer viewport y anticipar ambas escenas al aproximarse. No preload de toda la galería. Verificar `font-display:swap`, pesos usados y reserva de espacio con fallback. Consolidar reglas sin migrar arquitectura. Hacer que scripts fallen por bloque sin ocultar el documento completo.

**Responsive/accesibilidad/rendimiento:** objetivo de transferencia de imágenes de escena ≤180 KB por variante móvil sin artefactos visibles; imágenes iniciales imprescindibles ≤300 KB; primera interacción disponible sin esperar fotos de abajo. Mantener animación de altura confinada a una nota y medir con DevTools, no declarar que todo está en GPU.

**Aceptación:** objetivos de validación, no resultados actuales: LCP ≤2,5 s, CLS ≤0,1, INP ≤200 ms en perfil documentado; mediana de tres ejecuciones móviles equivalentes. Si el entorno no permite medición comparable, reportar limitación. Ningún 404, error JS, foto deformada ni archivo de producción referenciado solo fuera de `public/`.

## 6. Funciones nuevas: decisión y dependencias

| Capacidad | Decisión | Condición previa / límite |
|---|---|---|
| Galería ampliable | Proponer P1, M05 | Dos imágenes existentes; sin inventar material |
| Acceso directo sin animación y pausa | Proponer P0 | M02/M03; conserva experiencia completa |
| Mapas | Diferir hasta tener sede | Dirección/enlace suministrado y verificado; botón explícito, no GPS inventado |
| Itinerario más detallado | Diferir | Hoy solo 17:00 y 19:00; no añadir cena/baile con horas ficticias |
| RSVP real | Proyecto funcional separado | Confirmar backend, validación de invitación, límite de grupo, privacidad, estados y responsable; fuera de este plan visual |
| Regalos reales | Diferir | URLs oficiales o datos expresamente suministrados; sin enlaces de pago supuestos |
| Música | P2 opcional, baja prioridad | Audio autorizado/licenciado y elección del usuario; apagada al iniciar, play/mute visibles, sin autoplay ni descarga antes de activar |
| Mensajes para los novios | No priorizar | Exige moderación/almacenamiento; el ritual decorativo ya fue rechazado |
| Timeline de relación | No incluir por ahora | No hay hitos reales; usar fotos, no biografía fabricada |
| Parallax | Solo experimental P2 | Máximo 8 px en un bloque, puntero fino, pausa fuera de vista; descartarlo si resta legibilidad o rendimiento |

## 7. Prioridades y orden de ejecución futuro

| Prioridad | Entrega | Impacto / esfuerzo |
|---|---|---|
| P0 | M01 identidad y legibilidad | Alto / medio |
| P0 | M02 apertura continua y acceso seguro | Alto / medio |
| P0 | M03 movimiento coherente y pausa | Alto / medio |
| P0 | M04 escenas estables día/noche | Alto / medio |
| P0 | M09 navegación y hashes | Alto funcional / medio |
| P1 | M05 álbum ampliable | Alto emocional / medio |
| P1 | M06 fecha y calendario | Medio / bajo |
| P1 | M07 dresscode y desplegable | Medio / bajo |
| P1 | M08 RSVP demo pulido | Alto funcional / medio |
| P2 | M10 optimización, validación ampliada | Alto en móvil / medio |
| P2 | Música opcional/parallax limitado | Solo si aporta; depende de requisitos adicionales |

Optimización básica y accesibilidad se aplican desde P0; P2 contiene su validación y refinamiento profundos. No esperar a P2 para corregir contenido inaccesible o carga rota.

## 8. Checklist por etapas

### Etapa A — Preparación, solo cuando se autorice implementar

- [x] Confirmar que se implementará este plan y su alcance; conservar trabajo previo del usuario.
- [x] Revisar estado Git y conservar cambios existentes (`PLAN_BODA_PREMIUM.md` estaba sin seguimiento).
- [ ] Referencia visual completa anterior a P0: no se capturó antes de los cambios. Se inspeccionaron entrada, portada, escenas, detalles, galería y RSVP durante la implementación; no se presenta esto como una línea base original.
- [x] Confirmar inventario de fotos y tamaños sin tocar originales.
- [x] Identificar reglas efectivas y acordar tokens; no añadir dependencias.
- [x] Mantener explícitos todos los datos de demostración y las sedes pendientes.

### Etapa B — P0

- [x] Consolidar estilos y ajustar tipografía/contraste.
- [x] Implementar apertura continua, bypass y fallback sin JS.
- [x] Unificar entradas, pausa y movimiento reducido.
- [x] Estabilizar pestañas e imágenes y probar interrupciones.
- [x] Corregir navegación inicial con hash y sección activa.
- [x] Comprobar que no regresaron números, «La ilusión» ni «Para los novios».

### Etapa C — P1

- [x] Ampliación de galería con teclado y retorno de foco.
- [x] Contador unido a su frase y calendario validado.
- [x] Dresscode táctil y nota sin recortes.
- [x] RSVP demo con estados consistentes y aviso claro.

### Etapa D — Pulido y entrega

- [x] Variantes de imágenes y carga anticipada por proximidad.
- [ ] Validación ampliada completa: móvil/escritorio y teclado comprobados; movimiento reducido probado mediante fixture con preferencia y CSS simulados. Faltan red lenta controlada, preferencia real del sistema, zoom 200% y dispositivos físicos.
- [x] Revisión de copy: natural, breve, sin sentimentalismo añadido.
- [x] Informe de qué se cambió, qué se probó y qué queda pendiente.
- [x] Ninguna modificación en otras demos, pagos, backend o página anfitriona.

## 9. Matriz de pruebas recomendadas

| Prueba | Procedimiento | Resultado esperado |
|---|---|---|
| Viewports | 320×568, 390×844, 430×932, 768×1024 y 1440×900; registrar CSS px reales | Sin overflow ni CTA tapados; fotos sin cortar caras; notas legibles |
| Móvil horizontal/zoom | Girar móvil; zoom 200%; ampliar texto del sistema | Flujo natural y acceso a todo; sin alturas que recorten información |
| Apertura | Toque, Enter, Espacio, bypass, doble toque, retorno desde otra pestaña | Un único estado final, sin pantalla vacía ni foco perdido |
| Navegación | Iniciar en cada hash; abrir; atrás/adelante; menú al final de página | Destino correcto y un único indicador activo |
| Pestañas | Ratón, flechas, Home/End y 10 alternancias rápidas | Última selección gana; panel inactivo no recibe foco ni lectura |
| Imágenes | Red lenta, caché fría, un recurso bloqueado | Texto disponible; proporciones reservadas; fallback discreto |
| Movimiento reducido | Activar antes y durante apertura, tabs y nota | Cancelación limpia; sin loops; contenido completo visible |
| Nota | Abrir/cerrar rápidamente y redimensionar durante apertura | Altura termina correctamente, sin contenido recortado |
| Galería propuesta | Ampliar ambas, siguiente/anterior, Escape, retorno | Foto completa y foco en disparador original |
| RSVP | Sí/no, grupos 1 y 4, cerrar/reabrir, Escape | Estado coherente; ninguna petición de guardado; aviso demo |
| Calendario | Importar `.ics` en al menos dos clientes disponibles | 19/06/2027 17:00 Cancún; sin desplazamiento de una hora |
| Contador | Simular antes, exactamente y después del evento en pruebas | Sin negativos; mensaje final correcto; sin anuncios cada segundo |
| JavaScript deshabilitado | Bloquear JS y recargar | Información base consultable, no solo un botón inoperante |
| Rendimiento | Tres mediciones comparables; CPU/red indicadas | Presupuestos M10; reportar resultados reales y limitaciones |
| Semántica | Lector de pantalla, tabulación, contraste automatizado + manual | Jerarquía, nombres de controles y estados comprensibles |

### Verificaciones técnicas al implementar

`npm run build` valida el anfitrión, pero **no garantiza que el JavaScript inline de esta página en public se haya validado**. Ejecutar además `node --check` sobre `magic.js` y verificar sintaxis del script inline mediante una comprobación que lea el HTML sin ejecutar código de la página. Inspeccionar consola y comportamiento real en navegador. No crear tests que solo repitan selectores: centrar pruebas en interrupciones, estados finales y datos de calendario.

No se dispone actualmente de script `test` en `package.json`; no afirmar que existe una suite. Usar herramientas de inspección disponibles y describir cualquier prueba pendiente.

## 10. Definición de terminado

La propuesta estará implementada cuando todos los criterios P0 y P1 elegidos estén verificados, la demo continúe siendo explícitamente una muestra, las interacciones sean utilizables en móvil y con teclado, el movimiento reducido tenga una experiencia completa y no se hayan alterado proyectos vecinos.

El lujo debe percibirse en cinco momentos: abrir una carta sin cortes, reconocer a la pareja en fotografías protagonistas, pasar del altar al brindis con continuidad, explorar el dresscode con claridad y confirmar sin dudas. Ninguno necesita frases excesivas ni efectos acumulados.

**Este archivo es la única entrega de la fase de análisis. No incluye autorización para implementación ni cambios realizados al código durante esta fase.**


## 11. Implementación y validación — 21 de octubre de 2026

### Entrega realizada

- **P0 / M01:** paleta arena, marfil, cacao y coral unificada; petróleo en controles. Se eliminaron declaraciones supersedidas por selector y condición en los tres archivos de estilo existentes, sin crear otra hoja ni migrar a React. Tipografía operativa de 15–16 px y auxiliares de 12 px; menú móvil de 11 px con áreas de 44 px. Fondo de detalles adaptado mínimamente a `#ECDDCC`: el secundario sobre el tono inicial medía 4,32:1; ahora mide **4,68:1**.
- **P0 / M02:** estados cerrada/abriendo/abierta, respuesta inmediata, fundido superpuesto hasta 1.650 ms y fallback de 1.750 ms. Finalización idempotente, acceso directo, teclado, cambio de pestaña y preferencia reducida. El HTML base tiene la información visible y el sobre oculto: JavaScript habilita la entrada. La decoración de `magic.js` puede faltar sin bloquear el acceso.
- **P0 / M03:** una entrada de 6 px / 850 ms por bloque; se retiraron cascadas de hijos y sistemas ambientales competidores. Pausa disponible en entrada y portada, limitada a decoración; no afecta al RSVP ni al contador. Loops suspendidos fuera de vista y con documento oculto. Cambios de preferencia cancelan apertura, escena, nota y ampliación.
- **P0 / M04:** crossfade de 750 ms desde opacidades computadas, revisión para promesas obsoletas, una sola escena accesible, cancelación limpia y precarga/decodificación por proximidad. Geometría estable mediante dos copias de medición invisibles e `inert`, sin imágenes ni IDs. Adaptación mínima frente a `ResizeObserver`: CSS Grid calcula la altura natural máxima de ambos textos al cambiar ancho o fuente, sin escribir alturas fijas desde JavaScript. Se mantienen las etiquetas de ambientación y sede pendiente.
- **P0 / M09:** orientación por línea del 30%, un único `aria-current`, hashes iniciales, foco visible y navegación de historial sin reabrir el sobre. Se revelan inmediatamente los bloques del destino para no ocultar texto al llegar por hash.
- **P1 / M05:** ambas fotos preservadas, rotación máxima de 2°, botones de ampliación, dialog independiente, fotografía completa, anterior/siguiente, flechas, Escape, cierre explícito y devolución de foco. La variante grande se solicita al abrir y se anticipa la siguiente.
- **P1 / M06:** frase inmediatamente junto al contador, cuatro columnas, cifras tabulares, acceso adicional al mismo generador ICS y un solo intervalo que se detiene al ocultarse la pestaña o llegar a cero. Se conserva inicio y cierre de muestra.
- **P1 / M07:** cuatro tonos, nombre anunciado y selección por borde y marca de verificación. Transición de tela de 500 ms. Nota nativa de 480 ms con reversión rápida, limpieza al cancelar, sincronización de preferencia y reajuste por cambio de ancho.
- **P1 / M08:** CTA único y aviso sin envío de datos. Reset explícito en cada apertura, select de acompañantes coherente, foco en resultado y retorno al disparador. Dialog y resultado con entrada de 200 ms; sin backend ni campos personales nuevos.
- **P2 / M10:** variantes JPEG 640/960 con fallback original y `srcset`, dimensiones reservadas y carga por proximidad. Variantes móviles: ceremonia **140.921 bytes**, recepción **119.320 bytes**. Originales y fotos aportadas intactos. Se conserva `font-display=swap` y las dos familias existentes. Sin dependencias añadidas.

### Archivos de entrega

- `public/demos/boda-jardin/index.html`
- `public/demos/boda-jardin/beach.css`
- `public/demos/boda-jardin/magic.css`
- `public/demos/boda-jardin/magic.js`
- `public/demos/boda-jardin/photos/ceremony-beach-640.jpg`
- `public/demos/boda-jardin/photos/ceremony-beach-960.jpg`
- `public/demos/boda-jardin/photos/reception-beach-640.jpg`
- `public/demos/boda-jardin/photos/reception-beach-960.jpg`
- `scripts/check-wedding.mjs` — comprobación reproducible, sin instalar herramientas.
- Este checklist e informe.

### Comprobaciones realizadas

- `npm run build`: TypeScript y Vite correctos.
- `node --check public/demos/boda-jardin/magic.js`: correcto.
- `node scripts/check-wedding.mjs`: sintaxis inline/externa sin ejecutar la página; IDs únicos; recursos y srcset locales existentes; acceso progresivo; copy; ejecución aislada del generador ICS real; zona `America/Cancun`; contador un segundo antes, exactamente y después del evento; pausa del intervalo al ocultar documento.
- Contraste calculado con luminancia sRGB sobre pares funcionales observados: cacao/arena **8,98:1**, secundario/arena **5,15:1**, secundario/marfil **6,08:1**, secundario/detalles **4,68:1**, petróleo/marfil **7,60:1**, oro oscuro/arena **5,57:1**, marfil/cacao **10,60:1**. Esto no sustituye una auditoría WCAG completa, en particular sobre gradientes e imágenes.
- Navegador integrado, sin throttling: apertura por botón y Espacio, bypass, hash inicial `#detalles` con encabezado a aproximadamente 24 px del borde superior, navegación por anclas, diez alternancias por teclado de escenas y un único panel expuesto. Inicio de detalles estable entre escenas: **3.629,64 px** en la prueba móvil a ancho CSS de 320 px, variación observada **0 px**.
- Se solicitaron tamaños de 320×568, 390×844, 430×932, 768×1024 y 1440×900. El navegador integrado aplicó escalado en parte de la sesión: se registraron anchos CSS efectivos de **267, 320, 325, 358, 640, 1.200 y 1.440 px**, sin desbordamiento horizontal en las mediciones. No confundir los tamaños solicitados con simulación certificada de dispositivos.
- Galería: primera y segunda fotografía, siguiente, Escape y foco en el botón original. RSVP: no asistencia, reset/reapertura y asistencia de cuatro personas; foco en confirmación. Vestimenta: selección de coral y actualización del nombre. Nota: siete aperturas/cierres rápidos y estado final correcto, sin altura inline residual.
- Pausa de decoración: perla con `animation-play-state:paused`; RSVP permanece visible y operable con pausa activa. Modo nocturno inspeccionado; control ajustado para conservar contraste al hacer hover.
- Sin JS: fixture con iframe `sandbox` sin permiso de scripts, información principal y ambos paneles accesibles. Sin `magic.js`: fixture con núcleo inline intacto, apertura y contenido disponibles. Fixtures temporales retirados de la entrega.
- Movimiento reducido: fixture temporal con `matchMedia` controlado y bloques CSS reducidos activados. Se cambió la preferencia durante apertura y cierre de nota: entrada finalizada, escenas con un único panel, contenido visible, nota cerrada sin altura/overflow residual y cero elementos con animación CSS activa. Es una simulación funcional, no una prueba del ajuste nativo del sistema operativo.
- Descarga real del calendario inspeccionada: CRLF, inicio `20270619T220000Z` = **19/06/2027 17:00 Cancún** y cierre `20270620T070000Z` = **02:00 Cancún**. Pendiente importar en dos clientes reales.
- Consola inspeccionada en la demo: sin avisos ni errores capturados. Los recursos locales y variantes referenciadas existen. `git diff --check` correcto.

### Validaciones y funciones pendientes

- Safari iOS, Android físico, lector de pantalla, zoom 200%, orientación física y red lenta controlada; preferencia de movimiento nativa antes y durante la carga.
- Tres mediciones móviles equivalentes de LCP/CLS/INP y perfil de tareas largas. No se publican cifras de Lighthouse ni se afirma haber alcanzado los presupuestos M10 sin esas mediciones.
- Importación ICS en dos clientes y validación de la hora final antes de producción. La duración actual sigue siendo un dato de muestra.
- Música y parallax opcionales diferidos: no hay audio autorizado y no se añadieron efectos experimentales sin evidencia de mejora.
- Sede, mapas, regalos reales y backend RSVP conservan sus dependencias y límites originales. El rótulo «Tracy & Diego» del anfitrión queda para una tarea separada, según el alcance del plan.
