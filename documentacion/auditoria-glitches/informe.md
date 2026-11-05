# Auditoría de glitches de Nordra Studio

Fecha: 5 de noviembre de 2026. Rama local: `codex/auditoria-glitches`.

Base: `86212d02623420289ecc0d676bb355c1189d4e93`, obtenida tras `git fetch origin main` y coincidente con la versión auditada. No se hizo push ni despliegue. La copia de `codex/inicio-brillo-telefono` conserva `858035ace8640c77a36c15440e3b4ae071ee53d7` y sus tres rutas sin registrar, tal como estaban al empezar.

## Resultado por defecto

### 1. Apertura y cierre de las preguntas frecuentes

**Causa confirmada:** `scroll-travel.js` y `details::details-content` animaban simultáneamente la altura. Se encontró además el mismo conflicto en `src/site/business/content-controls.js`, que afecta a las FAQ de Negocios. `.web-option` y `.sample-detail` ya no se generan en las páginas vigentes; se eliminó su controlador muerto de `business-motion.js`.

**Cambio y archivos:** `src/site/scripts/scroll-travel.js`, `src/site/scripts/business-motion.js`, `src/site/business/content-controls.js`, `src/site/styles/nordra-theatre.css` y `public/motion-system.css`. Las aperturas quedan en manos del elemento nativo y CSS. El icono depende de `[open]`, incluso con movimiento reducido o pausa. La curva de altura pasa a `ease-in-out`: la anterior era continua, pero avanzaba unos 25 px por cuadro en teléfono.

**Verificación:** `scripts/check-disclosure-motion-browser.mjs`: Invitaciones, Bodas, Cumpleaños, Eventos, Temporada y Negocios a 1280 y 390 px; clic en escritorio y toque en teléfono. 24 secuencias registradas, máximo absoluto de **11.953125 px** entre cuadros, sin inversiones de dirección durante el cierre. También se verificó el icono abierto y el cierre con pausa y movimiento reducido.

**Límite:** no se ejecutaron Safari ni Firefox; en navegadores sin `interpolate-size` permanece el comportamiento nativo sin esa interpolación.

### 2. Selector de mesa en los tres paneles

**Causa confirmada:** la animación con `fill-mode: both` dejaba un contexto de apilamiento por grupo; los controles tampoco tenían estilos completos fuera de Cumpleaños.

**Cambio y archivos:** `src/components/WeddingTables.tsx`, `src/styles/wedding-boreal.css`, `src/styles/wedding-workspace.css`. Los grupos usan `backwards`, el grupo abierto se eleva y el menú calcula la dirección y altura disponibles, considerando la navegación inferior móvil. Se añadieron colores marfil, verde y los colores del tema de Cumpleaños, selección actual, hover, foco y presión; la apertura usa únicamente opacity y transform. Se conserva el cierre al elegir y con Escape, y se agrega cierre por pointerdown fuera.

**Verificación:** `scripts/check-glitches-panels-browser.mjs`: primer y último invitado mostrado en cada panel, a 1280 y 390 px. Todas las opciones pasan `elementFromPoint`. Se comprobó explícitamente la apertura hacia arriba cerca del borde inferior, además de Escape, toque/clic fuera y selección. Las pruebas cierran primero la guía inicial del panel. Se revisaron capturas de los tres temas.

**Límite:** se utilizaron paneles de muestra con el handler real y almacenamiento de prueba; no se operaron cuentas privadas de clientes.

### 3. Expansión de la galería de Estudio

**Causa confirmada:** la regla más específica de `motion-system.css` sustituía la transición de `flex-grow`.

**Cambio y archivo:** `public/motion-system.css` incluye `flex-grow .6s` junto a las transiciones existentes; conserva las reglas de pausa y movimiento reducido.

**Verificación:** `scripts/check-glitches-interaction-browser.mjs` registra los anchos intermedios de la segunda tarjeta con movimiento real del puntero. Se recorrió la galería a 1280 y 390 px y se revisaron sus capturas.

**Límite:** verificación de navegador en Chrome; no se midió rendimiento en otros motores ni dispositivos físicos.

### 4. Saltos de los estados hover

**Causa confirmada:** la lista global omitía `translate`, `rotate` y `scale`; algunas reglas más específicas de componentes sustituían las transiciones. Las FAQ modificaban el padding.

**Cambio y archivos:** `public/motion-system.css` y `src/site/styles/nordra-theatre.css`. Se añadieron las propiedades individuales y reglas dirigidas al teléfono de Inicio, las capturas del panel, las tarjetas y CTA de invitaciones y el selector de idioma. El texto de la pregunta se desplaza con transform, sin cambiar el padding.

**Verificación:** `scripts/check-glitches-interaction-browser.mjs`, con muestreo por cuadro de padding, width, translate, rotate, transform y colores; falla si el primer cuadro cambiado ya contiene el valor final. Los **28 casos** de la matriz completa pasaron, así como los estados de pausa y movimiento reducido. Se fuerza el pseudoestado para medir y se comprueba también que el hover/foco sea alcanzable con interacción real.

**Límite:** se cubrieron los controles enumerados y las FAQ de Negocios; no es una auditoría exhaustiva de todos los controles históricos del sitio.

### 5. Muestra de solo lectura ante un 429

**Causa confirmada:** el fallo del primer `load` dejaba vacíos invitados y mesas y activaba el estado de conexión interrumpida.

**Cambio y archivos:** `src/lib/weddingCloud.ts`, `src/lib/weddingLocalSample.ts`, `src/sections/WeddingWorkspace.tsx`, `server/sample-occasions.d.ts`. Ante un 429 sin sesión de muestra aceptada se cargan datos ficticios locales, incluidas mesas y estados de envío. Se reutilizan los metadatos públicos de las ocasiones. No se generan enlaces personales ni capacidades QR. La interfaz pasa a solo lectura y el método central de cambios también bloquea escrituras. Se detiene la consulta periódica y se muestra: «Por ahora, explora esta muestra en modo de solo lectura. Puedes probar los cambios más tarde.»

El límite del servidor **permanece en 12 creaciones por IP y hora**. `server/wedding-links.js` no se modificó.

**Verificación:** `scripts/check-glitches-panels-browser.mjs` intercepta un 429 en los tres paneles, comprueba invitados y mesas presentes, controles de edición deshabilitados, ausencia del mensaje de conexión interrumpida y ausencia de consultas adicionales tras 10.5 segundos. `npm test` mantiene las pruebas existentes del servidor.

**Límite:** el 429 se simuló localmente; no se consumió deliberadamente la cuota de producción ni se probaron redes CGNAT reales.

### 6. Desplazamiento horizontal en las invitaciones de Halloween

**Causa confirmada:** las capas de niebla exceden el ancho de la ventana por sus porcentajes y desplazamientos.

**Cambio y archivos:** `public/invitaciones/spooky-party/index.html` y `public/demos/halloween/index.html`: `overflow-x: clip` en html/body, sin cambiar las capas de niebla.

**Verificación:** `scripts/check-glitches-panels-browser.mjs` comprueba `scrollWidth <= innerWidth + 1` a 390 y 1280 px. `scripts/check-glitches-touch-browser.mjs` abre ambas invitaciones con toque y repite la comprobación tras la entrada; se revisaron las capturas.

**Límite:** no se verificó en Safari de iPhone físico.

### 7. Objetivos táctiles de al menos 44 × 44 px

**Causa confirmada:** los enlaces de las barras y del pie de Valentina y Sebastián, el botón de sincronización y los idiomas del aviso legal tenían cajas demasiado pequeñas. La comprobación real detectó que ampliar solo con un pseudoelemento hacía que algunos objetivos se solaparan con vecinos.

**Cambio y archivos:** `public/sample-interactions.css`, `public/demos/posada/index.html`, `public/demos/halloween/index.html`, `public/demos/celebra-2027/index.html`, `public/motion-system.css`, `src/site/styles/language-switch.css`, `src/styles/wedding-operations.css`, `src/styles/wedding-records.css`, `src/styles/wedding-ivory-invitation.css`. Las barras usan extensión transparente y altura suficiente para no recortarla en el borde superior. Sincronización, idiomas y enlace del pie tienen espacio real de 44 px. Se ajustaron los espacios entre controles del encabezado legal para que los idiomas ampliados quepan a 390 px.

**Verificación:** `scripts/check-glitches-touch-browser.mjs` comprueba dimensiones efectivas y hit testing a 21 px del centro en cuatro direcciones, no solo el CSS declarado. Pasan los seis objetivos representativos y el ancho del encabezado legal. El botón de sincronización es compartido por los tres paneles.

**Límite:** la prueba usa emulación táctil de Chrome, no mediciones en un teléfono físico.

### 8. Respuesta de controles en demos y destinos de Sobremesa

**Causa confirmada:** los selectores enumerados no tenían una transición propia efectiva; dos enlaces de Sobremesa apuntaban a `#`.

**Cambio y archivos:** `public/sample-interactions.css`, los HTML de `public/demos/{posada,posada-pinata,celebra-2027,halloween,del-otro-lado,nitida}/`, `invitaciones/camila-30/index.html` y `public/demos/sobremesa/index.html`. Los controles reciben respuesta sutil de transform, opacity y colores para hover, foco y presión, con pausa y movimiento reducido. Sobremesa enlaza su marca a `#hero-title` y Apartado a `#bodega`, destinos existentes. La hoja también se carga en Spooky Party para mantener su botón de entrada coherente.

**Verificación:** la matriz de 28 casos incluye estrella, entrada, puerta, regalo, enlace de apertura, wordmark, barras de muestra, enlaces, input, marca y navegación de Nítida. Sin saltos al valor final ni desplazamientos por hover al pausar o reducir movimiento. `npm test` verifica además las funciones existentes de Posada.

**Límite:** no se realizaron envíos externos desde formularios; las interacciones se probaron localmente.

## Verificación final reproducible

Chrome `156.0.8078.80`, Playwright ya declarado en el proyecto, anchos de 390 y 1280 px. Sin dependencias nuevas. Los scripts de navegador usan el build local; las APIs de los paneles se interceptan con muestras.

```text
npm run typecheck
npm test
npm run check:build
node scripts/check-disclosure-motion-browser.mjs
node scripts/check-glitches-interaction-browser.mjs
node scripts/check-glitches-panels-browser.mjs
node scripts/check-glitches-touch-browser.mjs
```

Los tres comandos npm se ejecutaron secuencialmente en el commit `2bdd1603222974d4d35bf8a18c8f59375d647835`, comprobando primero `git status --porcelain` vacío y eliminando únicamente el `dist/` de este worktree. **Todos terminaron con código 0**. `npm test`: 294 + 38 = **332 tests aprobados**, más las comprobaciones de Posada. `check:build` incluye compilación, bundles, entradas de Vercel y presupuestos de las invitaciones del número y del gafete. El worktree seguía limpio al finalizar.

Las dos transiciones de geometría expresamente solicitadas siguen en CSS: altura nativa de los disclosures y flex-grow de la galería. Los nuevos efectos de interacción no animan padding ni width.

## Evidencias

- `disclosures.json`: 24 secuencias de altura, una por apertura/cierre, página y ancho.
- `interaction-frames.json`: 28 casos con cuadros y lista de fallos vacía.
- `panels-and-overflow.json`: 12 selectores, 3 muestras 429 y 4 comprobaciones de ancho; 10 de las aperturas medidas fueron hacia arriba.
- `touch-and-visits.json`: 6 objetivos táctiles y 12 recorridos de galería, paneles e invitaciones.
- Capturas JPEG de revisión fuera del repositorio: `E:\Nordra Studio\Revision Signature\auditoria-glitches`. No se añadieron PNG ni otros recursos visuales al repositorio.

No se publicó: las comprobaciones describen esta rama local, no una nueva versión en producción. No se ejecutó una matriz completa ES/EN ni Safari/Firefox; las rutas funcionales del recorrido fueron las españolas.

## Commits

- `d4c99f21101a64d1fbf6542f9f25a4826f3671d9`: correcciones de los ocho puntos y scripts de navegador.
- `d1267a412c0fb9e9f33d99ce54b267b1d0bf16cf`: espacio del encabezado legal para los objetivos táctiles ampliados.
- `2bdd1603222974d4d35bf8a18c8f59375d647835`: evidencias finales de navegador; commit usado para la comprobación npm desde limpio.

El commit que incorpora este informe solo añade documentación y se identifica en la entrega del chat.
