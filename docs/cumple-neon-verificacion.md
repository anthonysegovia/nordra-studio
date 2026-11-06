# Cumpleaños: entrega para verificación de Claude

Implementación local del 06/11/2026. **No verificado visualmente**: no se abrió la implementación en navegador, por el reparto acordado con el usuario. La inspección de los PNG de referencia no equivale a validar el resultado implementado.

Rama: `codex/cumple-neon`. Worktree: `C:/Users/USER/.codex/worktrees/cumple-neon/nordra-studio-premium`. Base actualizada: `d20fc9e6641d4c2164c9ff615fd7dccadba9f5d2` (origin/main). Commit de implementación: `9d66f3e976c1b1b953e7705cf33984b4380289eb`. Sin push ni despliegue. El commit posterior de documentación se identifica con `git log -1`.

Se reemplazó el hero en ES/EN y se añadió la sección de cuatro estilos. Los cinco estilos cargan sus pintores y fuentes mediante importación dinámica; transiciones y efectos tienen módulos separados. CSS conserva una hoja por página. Se integraron tema y pausa existentes, analítica con identificadores cerrados, perfil estático, personalización efímera y WhatsApp localizado. El texto del nombre se inserta con textContent. Los campos tampoco tienen atributo name, para evitar que un envío nativo anterior a JavaScript los escriba en la URL. Solo se persiste el estilo validado.

La sección desde la muestra/confirmación hasta el cierre de main coincide con origin/main (comparación textual normalizando CRLF). No se cambiaron precios, contenido ni enlaces de esas secciones. No hay dependencias nuevas. No se añadieron capturas al repositorio: los tres PNG nuevos son originales de arte generado, solicitados para aprobación.

**Verificación ejecutada**

- `npm run typecheck`: aprobado.
- `npm test`: aprobado; 313 pruebas generales y 38 comprobaciones de invitaciones, más los controles de Posada. Incluye 10 pruebas de Cumpleaños: sanitizado, XV solo para 15, ES/EN y codificación WhatsApp, privacidad, cuenta regresiva local, diccionario EN, perfil estático, contrato HTML y módulos de dibujo con contextos simulados. Esta última prueba no mide apariencia.
- `npm run check:build`: aprobado, incluida hoja única, entradas de despliegue y presupuestos existentes. Última ejecución iniciada tras eliminar exclusivamente el dist de este worktree y verificar su ruta absoluta.
- `node --check scripts/check-birthday-sign-browser.mjs`: aprobado. **El script no fue ejecutado en navegador.**
- `git diff --check`: aprobado.

Logs fuera del repositorio: `E:/Nordra Studio/Maquetas/cumpleanos-neon/revision-codex/typecheck.log`, `npm-test.log` y `check-build.log` en esa misma carpeta.

**Ejecución pendiente por Claude**

En una terminal del worktree, servir el build:

`npm run preview -- --host 127.0.0.1 --port 5198`

En otra terminal PowerShell:

`$env:BIRTHDAY_EVIDENCE = 'E:/Nordra Studio/Maquetas/cumpleanos-neon/verificacion-claude'`

`node scripts/check-birthday-sign-browser.mjs http://127.0.0.1:5198`

El script acepta URL como primer argumento o BIRTHDAY_BASE_URL. CHROME_PATH elige un ejecutable; sin esa variable intenta Chrome y después `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`. HEADLESS=false permite verlo. BIRTHDAY_EVIDENCE elige la carpeta de evidencias; el valor predeterminado es la carpeta temporal del sistema, fuera del repo.

Matriz: ES/EN × 1440×900, 390×664 y 390×844 táctil × claro/oscuro × cinco estilos. Comprueba todos los puntos obligatorios del apartado 2, incluyendo las fases de la puerta, privacidad, XV/30, Escape, estados ARIA y canvas congelado en pausa. Añade transiciones con pausa, movimiento reducido y perfiles estáticos. Registra capturas iniciales/de estilos y browser-results.json. Ante el primer error conserva los resultados parciales y sale con error. Las comparativas sincronizadas a mitad de transición y las mediciones de rendimiento corresponden a Claude, no están automatizadas por este script.

**No verificado visualmente: revisión prioritaria**

1. Primera pantalla de 390×664, especialmente EN y Gala de XV: título y letrero completos, selector largo, pausa y controles plegables. Se conserva el header real del sitio, con alturas diferentes de la maqueta; no se copió su header de demostración.
2. Transiciones con la capa ahora situada directamente bajo body para cubrir el header. Comparar composición, mitad y final, destellos, humo, curvas y límite de 1,3 s. El fundido reducido/pausado suma 300 ms; la aserción tolera hasta 450 ms de ejecución real.
3. Caja: posición del moño, arrastre/toque/Enter/espacio y pluma. Bar: entrada/mirilla/retirada, marquesina, humo, tocadiscos y pizarra. Revisar interacciones rápidas durante el encendido y el cambio de estilo.
4. Neón: calentamiento de argón, letra rebelde, sombra, doble tubo y brillo residual. XV: las cuatro paletas, espejo, cortinas y vals. Espacio: palancas, radar, perilla, teletipo, tapa y astronauta.
5. Módulos de dibujo extraídos de la maqueta: se conservaron valores y geometrías, pero la comprobación aislada solo detecta errores de contexto, no diferencias de píxel. Revisar cables, iluminación por ladrillo/panel y candelabro a distintos tamaños.
6. Pausa/ocultación/salida del viewport y retorno por historial. El bucle de efectos conserva polvo/humo/estrellas ambientales mientras están activos y visibles; se detiene sin partículas activas, en perfil estático, pausa o pestaña oculta. No se midió su coste por cuadro.
7. Sonidos sintetizados con zumbido apagado inicialmente: no comprobados audiblemente. Revisar también Chrome móvil, WebKit si está disponible e iPhone real si procede.
8. Portadas nuevas: recorte, contraste, nombre largo y tamaño de texto sobre cada arte; aprobación visual del usuario aún pendiente.

**Adaptaciones y puntos de atención**

- CSS y IDs encapsulados para evitar colisiones con el sitio; los controles globales de tema y movimiento sustituyen a los de la maqueta. La pausa se mantiene visible en este hero móvil.
- Pinyon de Bodas era un subconjunto de sus textos fijos, insuficiente para nombres libres. Se reutiliza esa fuente y se añade un complemento latino local bajo la misma licencia. Comprobar ñ, acentos, ligaduras y espaciado. Fredoka carga pesos reales 500 y 700.
- Solo las fuentes del estilo activo se precargan. Hay una adaptación de carga: las fuentes de las tres portadas se cargan también cuando esas tarjetas se aproximan al viewport, aunque no se haya elegido su estilo, para poder reproducir sus textos HTML. Revisar esta decisión junto con el presupuesto de red; no se descargan todas al entrar.
- El perfil estático omite envoltura/puerta animadas y muestra el letrero fijo; el movimiento reducido usa fundido y permite desenvolver Caja sin animación. Verificar esos estados además del perfil normal.
- Las tres portadas son arte nuevo de fase 1; no buscan replicar las formas CSS simplificadas de las portadas de la maqueta. Los textos permanecen en HTML.

**Rendimiento y comparativas pendientes**

| Métrica | Antes (base indicada) | Después | Criterio |
|---|---|---|---|
| LCP escritorio/móvil | No medido | No medido | Título como LCP; aumento ≤100 ms |
| TBT escritorio/móvil | No medido | No medido | Reportar ambos valores |
| CPU por estilo, 10 s | No medido | No medido | Móvil: 4 núcleos, CPU ×4 |
| Bucle en reposo | No medido | No medido | ≤4 ms por cuadro |

**No verificado visualmente**: no existen todavía capturas comparativas de la implementación ni medidas de LCP/TBT/CPU. Claude debe obtener reposo de los cinco estilos en claro/oscuro y mitad de las cinco transiciones, alineados con la maqueta. Guardarlas fuera del repo, por ejemplo en la carpeta BIRTHDAY_EVIDENCE anterior, y añadir sus rutas/resultados al informe.

Se revisó el HTML `E:/Nordra Studio/Maquetas/cumpleanos-neon/index.html` y el paquete de 100 PNG siguiendo `referencia/LEEME.md`: 1-reposo, 2-transiciones, 3-interacciones y 4-movil. Las hojas de contacto usadas para revisar todas las imágenes están en `E:/Nordra Studio/Maquetas/cumpleanos-neon/revision-codex/` con prefijos 1-reposo, 2-transiciones, 3-interacciones y 4-movil. Son referencias, no evidencia de la implementación.

**Arte para aprobación**

Rutas relativas al worktree indicado:

| Estilo | Original | WebP 390 / bytes | WebP 780 / bytes |
|---|---|---|---|
| Bar | artwork-source/birthday-estilos-v1/bar-original.png | public/artwork/birthday-estilos/bar-390.webp · 26.582 | public/artwork/birthday-estilos/bar-780.webp · 108.092 |
| XV | artwork-source/birthday-estilos-v1/xv-original.png | public/artwork/birthday-estilos/xv-390.webp · 40.826 | public/artwork/birthday-estilos/xv-780.webp · 135.570 |
| Espacio | artwork-source/birthday-estilos-v1/espacio-original.png | public/artwork/birthday-estilos/espacio-390.webp · 33.360 | public/artwork/birthday-estilos/espacio-780.webp · 95.788 |

Todos los WebP pesan menos de 150.000 bytes. Prompts exactos: `artwork-source/birthday-estilos-v1/prompts.json`. Originales generados con image_gen, sin texto incorporado.

**Archivos de implementación**

- `AGENTS.md`
- `artwork-source/birthday-estilos-v1/bar-original.png`
- `artwork-source/birthday-estilos-v1/espacio-original.png`
- `artwork-source/birthday-estilos-v1/prompts.json`
- `artwork-source/birthday-estilos-v1/xv-original.png`
- `cumpleanos.html`
- `public/artwork/birthday-estilos/bar-390.webp`
- `public/artwork/birthday-estilos/bar-780.webp`
- `public/artwork/birthday-estilos/espacio-390.webp`
- `public/artwork/birthday-estilos/espacio-780.webp`
- `public/artwork/birthday-estilos/xv-390.webp`
- `public/artwork/birthday-estilos/xv-780.webp`
- `public/fonts/birthday-sign/SOURCES.txt`
- `public/fonts/birthday-sign/caveat-700.woff2`
- `public/fonts/birthday-sign/caveat-LICENSE.txt`
- `public/fonts/birthday-sign/fredoka-500.woff2`
- `public/fonts/birthday-sign/fredoka-700.woff2`
- `public/fonts/birthday-sign/fredoka-LICENSE.txt`
- `public/fonts/birthday-sign/monoton-400.woff2`
- `public/fonts/birthday-sign/monoton-LICENSE.txt`
- `public/fonts/birthday-sign/neonderthaw-400.woff2`
- `public/fonts/birthday-sign/neonderthaw-LICENSE.txt`
- `public/fonts/birthday-sign/pinyon-script-latin.woff2`
- `public/fonts/birthday-sign/poiret-one-400.woff2`
- `public/fonts/birthday-sign/poiret-one-LICENSE.txt`
- `public/fonts/birthday-sign/tilt-neon-400.woff2`
- `public/fonts/birthday-sign/tilt-neon-LICENSE.txt`
- `public/fonts/birthday-sign/yellowtail-400.woff2`
- `public/fonts/birthday-sign/yellowtail-LICENSE.txt`
- `scripts/birthday-sign.test.mjs`
- `scripts/check-birthday-sign-browser.mjs`
- `scripts/commercial-ui.test.mjs`
- `scripts/occasion-heroes.test.mjs`
- `src/i18n/cumpleanos.en.json`
- `src/site/analytics/policy.js`
- `src/site/birthday-sign/copy.js`
- `src/site/birthday-sign/effects.js`
- `src/site/birthday-sign/fonts.js`
- `src/site/birthday-sign/sign-hero.js`
- `src/site/birthday-sign/sign-runtime.js`
- `src/site/birthday-sign/sign.css`
- `src/site/birthday-sign/state.js`
- `src/site/birthday-sign/styles/bar.js`
- `src/site/birthday-sign/styles/caja.js`
- `src/site/birthday-sign/styles/espacio.js`
- `src/site/birthday-sign/styles/neon.js`
- `src/site/birthday-sign/styles/xv.js`
- `src/site/birthday-sign/transitions.js`
- `src/site/entries/birthdays.js`
- `src/site/styles/birthday-noche.css`
