# Animaciones de calidad

Trabajo local en `codex/animaciones-de-calidad`, desde `origin/main` (`2226afa`). Worktree: `E:\Nordra Studio\Plataforma\nordra-studio-premium-v6\wt-animaciones-de-calidad`. Instalación con `npm ci`; primera comprobación de compilación sin `dist/` previo. Sin push, merge ni cambios a `main`.

## Inventario y alcance

Consultar [inventario antes/después](inventario.md). El sitio comparte un CSS de movimiento y una mejora decorativa pequeña de JavaScript. La apertura de `details` no depende de JavaScript.

Contacto y Cómo empezar son secciones de las páginas existentes. No hay formulario público de contacto ni versión inglesa de Términos en esta base. Se grabaron los canales reales de contacto; no se añadieron funciones ni traducciones nuevas.

## Evidencias locales

Videos WebM, excluidos de Git junto con capturas y mediciones JSON:

| Video | Duración |
| --- | --- |
| [Planes de Cumpleaños](planes-cumpleanos.webm) | 7.20 s |
| [Planes de Bodas](planes-bodas.webm) | 8.20 s |
| [Paquetes de Negocios](planes-negocios.webm) | 8.40 s |
| [Ver todo lo que incluye](despliegue-plan.webm) | 6.44 s |
| [Pregunta frecuente](pregunta-frecuente.webm) | 7.40 s |
| [Canales de contacto](contacto-canales.webm) | 6.44 s |
| [Menú móvil](menu-movil.webm) | 8.64 s |
| [Tema e idioma](tema-idioma.webm) | 9.00 s |

## Rendimiento observado

Chrome local, escritorio de 1440 px, medición con `requestAnimationFrame` y `PerformanceObserver`, tras estabilizar fuentes y posición de lectura. `rendimiento.json` conserva intervalos y fuentes de los desplazamientos.

| Interacción | FPS medios | CLS |
| --- | --- | --- |
| Hover de planes Cumpleaños | 60.001 | 0 |
| Hover de planes Bodas | 59.999 | 0 |
| Hover de paquetes Negocios | 60.001 | 0 |
| Despliegue de plan | 59.798 | 0 |
| FAQ | 60.001 | 0.001361 |
| Contacto | 60.003 | 0 |
| Menú móvil | 60.001 | 0 |

Los hover medidos alcanzaron aproximadamente 60 fps; mediana de 16.7 ms y percentil 95 de 16.8 ms. Esto describe esta máquina y estas interacciones, no garantiza la tasa en todos los dispositivos. El pequeño desplazamiento de la FAQ corresponde al despliegue que redistribuye contenido, permitido por el alcance. La navegación de idioma reemplaza el documento y no se mezcla con estas métricas.

## Regresiones fuera del alcance

No se editaron invitaciones, demos, paneles, servidor, enlaces personales ni precios. La suite de celebraciones comprobó 21 casos; la de paneles comprobó las tres muestras, recorridos de confirmación, Aurora privado, Boreal archivado, teclado, capacidad y recordatorios manuales. Usan las muestras/fixtures de prueba existentes.

La suite de teléfonos comprobó 12 teléfonos con cursor, Enter, toque y enlaces sin JS; 13 etiquetas sin cruzarse con la pantalla; inglés y 40 combinaciones sin desbordamiento. Sus evidencias se conservaron localmente en `telefonos/`. Las animaciones de apertura y los escenarios conservan sus implementaciones propias.

## Comprobaciones

| Comprobación | Resultado |
| --- | --- |
| `npm run typecheck` | Correcto |
| `npm test` | 291 pruebas + 38 comprobaciones y validación de Posada; 0 fallos |
| `npm run check:build` | Correcto: compilación, bundles, archivos de despliegue y presupuesto de invitación |
| Prueba nueva de movimiento | 152 vistas, 6,190 apariciones de controles, 788 controles examinados en pseudoestados; 0 fallos |
| Movimiento reducido y Pausar movimiento | Hover sin cambios en transform, translate ni rotate en las comprobaciones de escritorio |
| Despliegues sin JavaScript | Enter abre/cierra y Espacio restaura el estado original; ES/EN |
| Desbordamiento | 0 casos en 375, 390, 1440 y 1920 px, claro/oscuro |
| Captura de rendimiento | Hover de los tres grupos de planes: ~60 fps y CLS 0 |
| Celebraciones | 21 casos correctos |
| Paneles | Recorridos de muestras y fixtures correctos |
| Teléfonos | 12 teléfonos, 13 etiquetas y 40 combinaciones correctas |

El control de pausa incluye las propiedades individuales `translate` y `rotate`, además de `transform`. La prueba espera a que se procese el cambio de preferencia de movimiento antes de activar la pausa. El brillo de los planes tiene un bloque de referencia estable antes y durante el hover; la captura falla si introduce CLS superior a 0.001.

Commits de implementación: `0259571` (inventario inicial) y `7646c77` (sistema compartido). El commit de pruebas y entrega añade este informe, el inventario final y los dos scripts reproducibles. Los videos no están en ningún commit.

## Reproducción

```powershell
npm ci
npm run typecheck
npm test
npm run check:build
node scripts/check-interaction-motion-browser.mjs
node scripts/capture-interaction-motion.mjs
node scripts/check-celebrations-browser.mjs
node scripts/check-panel-experience-browser.mjs
node scripts/check-phone-open-browser.mjs
```

Las pruebas de navegador usan Chrome de `C:/Program Files/Google/Chrome/Application/chrome.exe`; la prueba nueva y la captura aceptan `CHROME_PATH`. La prueba nueva también acepta `MOTION_URL` y `MOTION_ROUTE` para comprobaciones específicas. Los procesos de build y navegador deben ejecutarse en secuencia para no sustituir `dist/` durante la navegación.
