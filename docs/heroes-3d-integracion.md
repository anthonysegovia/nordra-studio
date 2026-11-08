# Integración de heroes 3D

Fecha: 7 de noviembre de 2026. Worktree `wt-heroes-3d`. Sin commit ni push.

## Archivos

- Nuevos: `src/site/heroes/{shared,vitrina,sobre,load,locale}.js` y `vitrina.css`, `sobre.css`.
- Recursos: `public/nordra/v550/assets/`, con JPG, WebP, SVG y tres videos MP4. Sin PNG ni directorios de cuadros sueltos.
- Páginas: `negocios.html`, `invitaciones.html`. Las versiones inglesas se generan desde estas plantillas; se ampliaron sus diccionarios en `src/i18n/`.
- Entradas: `src/site/entries/business.js`, `invitations.js`. El animador anterior de `src/site/scripts/business-motion.js` omite estas dos escenas para evitar competir con sus controles.
- Pruebas nuevas: `scripts/heroes-3d.test.mjs`, `check-heroes-3d.mjs`, `check-heroes-performance.mjs`. Se actualizaron cinco pruebas existentes que fijaban el marcado anterior: business-content, business-variant-b, commercial-locales, commercial-ui y site-modules.

## Decisiones y diferencias frente a las maquetas

- Se conservaron los titulares, descripciones, precios compartidos, enlaces comerciales, navegación, SEO y pies del sitio real. Por eso los titulares no son los de las maquetas; la vitrina mantiene «Tu visión…» y su reflejo, sin alternar el titular por tipo de negocio. Invitaciones conserva «¿Qué vamos a celebrar?» en lugar del texto y subrayado de regalo. Cambia la altura del bloque de texto.
- El reloj, geometrías, videos, interacciones, cambio de ocasión, personalización, inclinación y adaptación del teléfono proceden de las maquetas. Los controles de repetición y versión quieta están dentro del hero para conservar el header global.
- El vuelo de la vitrina aterriza en las tres muestras reales de Negocios: el catálogo actual usa un selector, no las tres tarjetas de paquetes de la maqueta. Se conservan los tres recortes y sus retardos. El sobre aterriza en el directorio real de celebraciones, que conserva también Temporada.
- El tema usa el selector y la preferencia guardada del sitio. Se eliminó la elección automática por dispositivo/hora de la maqueta, incluido el póster móvil oscuro automático.
- Texto y CTA están en HTML y son visibles sin esperar al motor. La importación de Three empieza después de `load`, dos frames e idle. El escenario tiene dimensiones reservadas. Hay imagen de respaldo si WebGL falla; en el sobre se usa la portada existente mientras carga.
- Quieto, movimiento reducido, ahorro de datos y 2G conservan una escena fija. No se solicitan videos en ese modo y se desactiva el vuelo al desplazar. Se añadieron pausa al ocultar la página y respeto al cambio de movimiento reducido.
- QR: importación diferida de `qrcode` instalado; SVG generado localmente. Los nombres personalizados se dibujan en canvas, sin enviarlos a un servidor.
- No se agregaron dependencias, fuentes externas, importmaps ni cargas CDN. Las notas de velocidad siguen limitadas a Nítida y Cantera. Las capturas de las invitaciones reales siguen en español también dentro de la versión inglesa; los controles nuevos sí se traducen.

## Three 0.169 → 0.181

Se revisaron la implementación instalada y la [guía oficial de migración](https://github.com/mrdoob/three.js/wiki/Migration-Guide).

- `Reflector` conserva las opciones de shader, dimensiones y clip bias, y los uniforms `color`, `tDiffuse`, `textureMatrix`. Se conserva el shader propio de la maqueta.
- `RoundedBoxGeometry` conserva la firma de cinco argumentos utilizada. `SVGLoader.parse()` y los paths con `toShapes()` siguen disponibles.
- `RoomEnvironment` funciona sin argumentos con `PMREMGenerator.fromScene()`. Se liberan el generador y la escena auxiliar después de generar la textura.
- `colorspace_fragment` continúa disponible; `map_fragment` usa `vMapUv` y `uv_pars_fragment` declara `vAlphaMapUv` bajo `USE_ALPHAMAP`. La mesa usa mapa y alphaMap, por lo que su sustitución sigue siendo válida. Su mapa es canvas, no video; no necesita reproducir el bloque `DECODE_VIDEO_TEXTURE` del chunk original. Los videos usan `VideoTexture` y el material estándar.
- r181 modifica el cálculo PBR y PMREM; puede haber pequeñas diferencias de brillo/reflejo respecto a r169. No se alteraron materiales arbitrariamente para compensarlas. Chrome compiló los shaders sin errores; el controlador emitió advertencias de precisión numérica.

## CSP

Sin cambios en `vercel.json`: la política report-only existente ya permite recursos propios, `media-src 'self' blob:`, imágenes `data:`/`blob:` y workers propios/`blob:`. Estos heroes no crean workers ni requieren eval. Canvas/WebGL no necesita una directiva adicional.

## Validación

- `npm.cmd run build`: correcto, salida normal `dist/`, sin cambiar `vite.config.ts`. Advertencia de tamaño del chunk compartido de Three (>500 kB), que se descarga de forma diferida en estas páginas.
- `npm.cmd test`: 332 + 38 pruebas correctas, además de las comprobaciones de Posada.
- `node scripts/check-site-bundles.mjs` y `node scripts/check-vercel-build-inputs.mjs`: correctos.
- Chrome instalado, escritorio y viewport móvil: escena cargada, controles, ES/EN, cambio de ocasión, edición de nombre, QR, Escape, modo oscuro, pausa/repetición, quieto sin videos y texto pintado antes de importar el hero. Capturas de revisión en `review/hero-*.jpg` (carpeta de revisión local).
- Comparación local con el HTML de la base, viewport 390 × 844, Chrome, sin throttling: Negocios LCP 516 → 272 ms; Invitaciones 256 → 196 ms; CLS 0 en las cuatro mediciones. Son muestras de laboratorio, no valores de campo ni una prueba estadística.
- Reproducción: iniciar Vite en 5174, ejecutar `node scripts/check-heroes-3d.mjs` y `node scripts/check-heroes-performance.mjs`. Admiten `HERO_URL`; el comparador admite `HERO_BASE_REF` (por defecto `69a1f16`). El comparador usa los módulos actuales con el HTML de la base, no un build íntegro separado de aquella revisión.

## Límites de la revisión

No se verificaron Safari/iOS, GPU de teléfonos físicos, red 2G real, métricas de producción ni igualdad píxel a píxel contra r169. Ahorro de datos/2G se revisó en la política del código; la comprobación de navegador cubre movimiento reducido y `?quieto`. No se publicó nada ni se modificaron enlaces de clientes privados.
