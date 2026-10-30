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
