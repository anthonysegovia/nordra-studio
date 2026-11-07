# Cumpleaños · experiencia v6

Base: `origin/main` (`ad70b06`). Rama: `codex/cumple-ux`, sin push. Referencia: HTML v6 y cinco capturas aprobadas de Cumpleaños Neón.

Los cuatro nombres rotan con su propia edad. Los teléfonos completos prueban el estilo y ofrecen Deshacer. En móvil, el hero usa chips, pausa compacta y una hoja de personalización con vista previa a 550 ms. La barra y la muestra comparten el mensaje de WhatsApp del estilo elegido. El visitante conserva el nombre solo en memoria; no se añade a la dirección de la página, al historial ni al almacenamiento del navegador.

La muestra alterna portada y panel sin superposición en móvil, con un enlace por pestaña. Caja abre la invitación de Camila; los demás estilos permiten pedir el diseño. Boreal aparece primero en el carrusel móvil de planes. Las seis secciones usan `clamp(32px,5vw,72px)`: 32 px a 390 px y 72 px a 1440 px.

**Archivos:** `cumpleanos.html`, `src/i18n/cumpleanos.en.json`, `src/site/entries/birthdays.js`, `src/site/scripts/wedding-stage.js`; en `src/site/birthday-sign/`: `cards.js`, `carousel.js`, `sample.js`, `sheet.js`, `sign-runtime.js`, `state.js`, `sign.css` y `ux.css`. Pruebas: `scripts/birthday-sign.test.mjs` y `scripts/check-birthday-sign-browser.mjs`. No se sustituyeron los recursos de arte aprobados.

**Verificación general:** `npm run typecheck`, `npm test`, `npm run check:build` y `node scripts/check-site-bundles.mjs` aprobados. Revisión de capturas de la hoja, el carrusel, las tarjetas de escritorio, la portada de Bar, el panel y los planes. La prueba comprueba el ancho del teléfono y la posición inicial de Boreal además del estado de cada control.

**Navegador:** 82/82 casos en Edge: 60 combinaciones (ES/EN × tres tamaños × claro/oscuro × cinco estilos), cinco rotaciones reales, doce casos de movimiento reducido y cinco estáticos. En cada estilo se observaron Camila 30, Andrés 40, Ximena XV e Iker 6. Pasaron también los 20/20 casos de `--mobile-layout` a 390×664. A 390×844, la matriz comprobó que el botón de nombre queda completo sobre la barra en ambos idiomas y temas.

**No verificado visualmente:** el teclado nativo y el área segura en un iPhone o Android físico. La hoja escucha `visualViewport`; la emulación de Edge permite comprobar foco, modos de cierre, capas y vista previa, pero no reproduce ese teclado.

**Commits de implementación:** `b222564` edades; `7901b68` tarjetas, carrusel y Deshacer; `9f38a0f` chips y hoja; `c5cf79e` muestra y planes; `ef02c4c` encuadre y posición inicial; `2e3b61d` espaciado. `c828365` y `ca29e99` mantienen accesibles los controles de la repisa al pausar y reanudar; `f3b19cd` amplía la prueba de navegador.

**Rendimiento móvil en Edge, CPU ×4.** Tres cargas en frío por versión. LCP mediano: 548 ms en main y 516 ms en v6 (−32 ms; límite 648 ms). TBT mediano después de FCP: 85 y 108 ms respectivamente (límite 150 ms). En v6, LCP por carga: 840 / 516 / 472 ms; TBT: 83 / 112 / 108 ms.

Reposo: diez segundos por estilo, después de diez segundos de estabilización. Metas: ≤4 ms por cuadro y ≥58 fps.

| Estilo | Main: ms/cuadro | V6: ms/cuadro | V6: fps |
|---|---:|---:|---:|
| Neón | 3,07 | 3,25 | 59,13 |
| Caja | 1,23 | 1,27 | 60,01 |
| Bar | 2,12 | 2,01 | 60,04 |
| XV | 2,33 | 2,08 | 59,90 |
| Espacio | 2,05 | 2,12 | 60,01 |
