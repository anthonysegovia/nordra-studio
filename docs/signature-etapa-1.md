# Signature Nordra · Etapa 1

Propuesta local para revisión visual, basada en b547640. No incluye publicación,
3D, cambios de paleta ni cambios al renderer aprobado de la aurora.

## T1 · Tipografía

- Sora variable 400–700 para h1–h3 y los titulares de trabajo `.feature-heading strong`.
  Manrope permanece en texto, navegación y botones. Los documentos de invitaciones,
  demos y paneles no importan estos estilos.
- Archivo local `public/fonts/sora/Sora-latin.woff2`: 24.580 bytes, subconjunto latino,
  acentos españoles, ñ, ü, ¿, ¡, puntuación y euro. Licencia OFL adjunta.
  Fuente: [Google Fonts / Sora](https://github.com/google/fonts/tree/main/ofl/sora).
  Derivado del WOFF2 latino oficial v17 de Google Fonts con fontTools 4.68.0,
  limitando el eje variable a los pesos utilizados por los títulos (400–700).
  Se conserva 650 y cualquier valor intermedio; no hay cambios de peso visual.
- Una precarga WOFF2 con `crossorigin` y `fetchpriority="low"` en cada página comercial. Sin peticiones a
  Google Fonts en ejecución, variantes adicionales ni cambios en las fuentes de React.
- `signature.css` se importa desde `scene.css` y queda integrado en la única hoja
  compilada de cada página.
- Ajuste de espaciado imprescindible: `.business-head h1` pasa de −0,065em
  (escritorio) / −0,06em (móvil) a −0,045em; su primera línea pasa de −0,075em
  a −0,045em. Evita la compresión de Sora en titulares grandes. No cambia ningún
  tamaño, interlineado ni color. Los demás espaciados se conservan.
- Capturas de referencia y validaciones completas en la carpeta externa de revisión.
  La medición comparada de LCP se documenta en T7.

## T2 · Navegación

El mismo header de las ocho páginas incorpora «El estudio», entre Inicio y Negocios,
con navegación interna `data-go="estudio"`. No se agregan otros enlaces.

Criterio móvil propuesto: tres accesos al contenido de la propia página, en orden
**explorar → decidir / conocer el proceso → contactar**. Etiquetas según el contenido;
Contacto siempre ocupa el último lugar. No se mezcla un salto a otra página en la
barra fija. El menú desplegable conserva la navegación general.

| Página | Antes | Propuesta |
|---|---|---|
| Inicio | El estudio · Servicios · Contacto | Servicios · El estudio · Contacto |
| Estudio | Inicio · Proceso · Contacto | El estudio · Proceso · Contacto |
| Negocios | Casos · Paquetes · Contacto | Casos · Opciones · Contacto |
| Invitaciones | Celebraciones · Probar · Contacto | Celebraciones · Proceso · Contacto |
| Bodas | Muestra · Paquetes · Contacto | Muestra · Opciones · Contacto |
| Cumpleaños | Muestra · Paquetes · Contacto | Muestra · Opciones · Contacto |
| Eventos | Muestra · Paquetes · Contacto | Muestra · Opciones · Contacto |
| Temporada | Colección · Cómo empezar · Contacto | Colección · Proceso · Contacto |

En Inicio, El estudio lleva ahora al resumen del estudio dentro de Inicio; en
Estudio, el primer acceso vuelve a su presentación. «Opciones» sirve tanto para
cotizaciones web como para los paquetes de invitaciones, sin prometer un precio web.

## T3 · WhatsApp al cierre

Solo cambia el destino del botón principal final. Se conservan las etiquetas,
los mensajes de paquetes y los demás enlaces. Son propuestas de texto para revisión;
no se ha enviado ningún mensaje.

| Página | Mensaje propuesto |
|---|---|
| index | Hola, Nordra. Me gustaría platicar sobre una idea que tengo. |
| estudio | Hola, Nordra. Me gustaría conocer cómo podemos trabajar juntos. |
| negocios | Hola, Nordra. Me gustaría cotizar una página web para mi negocio. |
| invitaciones | Hola, Nordra. Me gustaría una invitación digital para mi celebración. |
| bodas | Hola, Nordra. Nos gustaría una invitación digital para nuestra boda. |
| cumpleanos | Hola, Nordra. Me gustaría una invitación digital para un cumpleaños. |
| eventos | Hola, Nordra. Me gustaría una invitación digital para mi evento. |
| temporada | Hola, Nordra. Me gustaría una invitación digital para una celebración de temporada. |

## T4 · Texto del proceso

Solo Invitaciones contenía «De tu idea / a tu página»: ahora dice «De tu idea /
a tu invitación». Bodas («Hagamos algo muy suyo»), Cumpleaños («Tú pones el plan /
Nosotros, el diseño»), Eventos («Tú tienes el motivo / Le damos forma») y Temporada
(«De tu idea / a sus manos») ya tenían mensajes propios y se conservan.

Observaciones fuera del cambio solicitado:

- El HTML base conserva «Cómo empezar» hacia `/#proceso` y algunos enlaces con
  `target="_blank"`; al ejecutar, journey/page-navigation los convierten en destinos
  contextuales y navegación interna. No es un fallo del recorrido normal, aunque
  esos destinos del HTML no equivalen al comportamiento con JavaScript deshabilitado.
- Inicio ya mostraba dos tarjetas de servicios con imágenes, aunque no enlazaba
  directamente los tres trabajos pedidos. T5 agrega esa evidencia sin quitarlas.

## T5 · Franja de trabajos · Variante A

Propuesta única para aprobar: tres piezas en una fila en escritorio y una columna
compacta en móvil, después de las dos tarjetas de servicios y antes del estudio.
BRUMA y Lúmina dicen «Concepto de diseño»; Valentina y Sebastián, «Diseño de invitación».
Enlaces a sus experiencias existentes, sin atribución a clientes reales.

Reutiliza bruma-real.webp, lumina-real.webp y wedding-cover.webp. No hay vídeos,
iframes, bibliotecas ni recursos nuevos. `data-src` se activa al entrar la tarjeta
en pantalla (IntersectionObserver existente); `loading="lazy"`, `decoding="async"`,
medidas explícitas y proporción reservada. Con JavaScript deshabilitado, `noscript`
proporciona la imagen diferida. No compiten con el LCP de la entrada normal.

La imagen cambia suavemente su escala con el scroll, reutilizando el controlador de
Inicio. Pausa global y movimiento reducido eliminan transformaciones; no se toca
horizon-flow.js ni el movimiento aprobado de la aurora. Pendiente de aprobación visual.

## T6 · Cotización al principio de Negocios

El hero mantiene «Comparar paquetes» y añade justo después «Cotizar mi página»,
con el mismo mensaje contextual de T3 para Negocios. Conserva el estilo de acción
existente y el control de movimiento. No se elimina contenido ni se añaden precios.

## T8 · Analítica, sin implementar

Comparación de dos opciones verificadas y propuesta completa en
[signature-analitica.md](signature-analitica.md). El responsable confirmó Vercel Pro.
Se propone Vercel Web Analytics con `whatsapp_click` y exactamente dos propiedades
(`page`, `button`), sin datos personales. Plausible Business es la alternativa evaluada.
La elección, instrumentación y actualización del aviso requieren una etapa posterior.

## T7 · Diagnóstico de LCP

Datos de 48 navegaciones, medianas y propuestas sin aplicar en
[signature-lcp.md](signature-lcp.md). La comprobación estricta de no empeorar LCP
queda pendiente: Inicio +52 ms, Estudio +44 ms, Invitaciones +16 ms y Bodas +36 ms;
Negocios −224 ms, Cumpleaños −40 ms, Eventos −72 ms y Temporada −112 ms.
No se presentan estas pequeñas diferencias de laboratorio como garantías de campo.

## Verificación y entrega

- `npm run typecheck`: sin errores.
- `npm test`: 116 pruebas principales + 34 checks de Node, todas correctas; check
  de Posada correcto. Incluye la protección de tokens y las 7 pruebas de horizon-flow.
- `npm run check:build`: compilación y los dos verificadores correctos, 15 entradas.
- 64 capturas completas: ocho páginas × claro/oscuro × 375/1440 px × antes/después.
  Cambios intencionales: Sora y sus saltos de línea, enlace El estudio, barra móvil,
  texto de Invitaciones, franja de trabajos y CTA de Negocios. Sin cambios de paleta.
- 34 casos adicionales en navegador: fuentes y pesos 400–700, navegación / botones
  en Manrope, header coherente, destinos móviles existentes, WhatsApp contextual,
  imágenes diferidas, pausa y movimiento reducido; sin desbordamiento horizontal,
  errores de ejecución ni respuestas HTTP fallidas.
- 20 casos de tema / navegación: 12 transiciones animadas en Inicio, Bodas y
  Cumpleaños, más 14 recorridos oscuros en iframe con atrás y adelante. Sin errores.
- Una sola hoja CSS compilada por página. Cabecera revisada también a 701, 768,
  820, 900 y 1024 px, sin desbordamiento horizontal.
- Sin cambios en AGENTS.md, vercel.json, tokens, renderer de aurora, src/styles,
  public/demos, public/invitaciones ni marcadores de precios. El material no rastreado
  previo permanece fuera de los commits.

Evidencia externa: `E:/Nordra Studio/Revision Signature/2026-10-30-etapa-1/galeria.html`.
La galería enlaza los 32 pares y los cuatro recortes de la variante A. Los JSON de
verificación y logs están en la misma carpeta; no se añaden al sitio publicado.

Pendiente de decisión: criterio móvil T2, mensajes T3, variante A de T5, revisión
visual de la tipografía y el pequeño aumento medido de LCP en cuatro páginas.
T8 permanece como propuesta. Rama `codex/signature-etapa-1`, estado local,
**sin push ni despliegue**.
