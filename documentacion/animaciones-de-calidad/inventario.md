# Inventario de interacciones

Base: `2226afa`. Recorrido inicial automatizado: ES/EN, 390/1440 px, claro/oscuro, 76 combinaciones. Datos por elemento en `antes.json` (evidencia local). 528 apariciones sin duración de transición o animación. Una duración declarada no garantiza un cambio visual; la comprobación final debe medir también los estados.

| Tipo y ubicación | Antes: cursor / foco / presión / apertura | Intervención prevista |
| --- | --- | --- |
| Aurora/Boreal: Invitaciones, Cumpleaños, Eventos | Invitaciones eleva 3 px; en ocasiones faltan transiciones; presión sin lenguaje común | Elevación 5 px, borde, sombra, brillo único, precio y CTA |
| Aurora/Boreal: Bodas | Papel con elevación mediante translate; marcos propios; sin respuesta común de presión | Conservar papelería y desnivel editorial; integrar movimiento |
| Paquetes Negocios | Selector cambia panel; panel sin transición propia | Elevación y borde del panel activo |
| Temporada | Galería y teléfonos con movimiento propio | Conservar composición; completar controles |
| Casos/clientes: Inicio, Estudio, Negocios, Invitaciones | Algunas tarjetas sin transición | Elevación y borde |
| Ocasiones: Invitaciones | Respuesta existente | Conservar |
| Botones y flechas: todas las páginas | Duraciones heterogéneas; flecha horizontal; móvil fuerza duración cero | Tokens, presión, foco y flecha diagonal |
| Texto/header/footer y legales | Algunos enlaces solo color o sin transición | Subrayado progresivo y foco |
| Details: planes, extras, FAQ, estudio, clientes | Apertura nativa instantánea; algunos signos giran | Apertura/cierre CSS progresivos con fallback nativo |
| Campos, radios y formulario | Bordes y selección dispares; campos sin transición | Borde, etiqueta, estado y validación suaves |
| Pestañas y segmentos | Estado cambia sin indicador compartido | Indicador deslizante |
| Tema, idioma, pausa | Tema tiene transición propia; idioma cambia página; reducción elimina transiciones | Conservar navegación; respuesta de icono/estado |
| Menú móvil | Hoja con entrada de 260 ms | Integrar tokens y cascada breve |
| Teléfonos, galerías, paneles de muestra | Apertura y escenarios especializados | Mantener sus transformaciones; completar foco sin sustituir composición |

Contacto y Cómo empezar son secciones, no páginas independientes en esta base. Se recorren con Inicio/Estudio/Negocios. Términos solo existe en español; no se inventa traducción ni se modifican textos. Privacidad sí tiene ES/EN.

Fuera de alcance: `/invitaciones/*`, `/demos/*`, paneles, recepción y pases. Sus suites existentes se ejecutarán como regresión sin editar sus fuentes.

## Resultado implementado

| Familia | Ahora |
| --- | --- |
| Planes Aurora/Boreal | Elevación de 5 px, borde y sombra de acento, presión de 1 px, brillo único de 600 ms, precio con mezcla de acento que conserva contraste, CTA adelantada y etiqueta suavemente iluminada. El brillo queda anclado a la tarjeta desde reposo. |
| Bodas | Mismos estados; marcos, lirios, fondo marfil y desnivel editorial conservados. |
| Negocios, casos, clientes y tarjetas de temporada | Sombra/borde/elevación sobre sus controles; las composiciones de teléfonos conservan sus módulos. |
| Botones/flechas | Tokens de 150/250/400 ms; presión a escala .98; flecha diagonal de 2 px; foco visible con sombra suave. |
| Header/footer/enlaces de texto | Color progresivo, subrayado por transformación en enlaces de navegación y texto seleccionados, respuesta de foco y presión. |
| Details | Un patrón CSS nativo de altura intrínseca y opacidad, cierre incluido, signo + a ×. Sin interceptar clics ni cambiar `open` con JS. En navegadores sin `interpolate-size` permanece el comportamiento nativo. |
| Campos/radios/selectores | Transición de borde, color, sombra y etiquetas; radios con acento. No existe formulario público de contacto en esta base: se conservan sus canales de contacto. |
| Pestañas/segmentos/idioma | Indicador decorativo que se desplaza con transform; selección y navegación siguen a cargo del código existente. |
| Tema/pausa | Icono de tema gira suavemente; estado pulsado responde con sombra interior. |
| Menú móvil | Entrada/salida con opacidad y desplazamiento, enlaces en cascada de 35 ms, foco y Escape existentes. |
| Movimiento reducido/pausado | Controles sin transformación ni giro; color/opacidad/borde siguen respondiendo. Sin brillo móvil ni interpolación de altura. |

El CSS compartido está en `public/motion-system.css`: permite que Términos, que es un documento estático, use exactamente el mismo archivo que las entradas compiladas. No se modificaron precios, textos comerciales, enlaces personales, servidor ni fuentes de invitaciones/paneles.

La prueba nueva mide estilos de 6,190 apariciones de controles en 152 vistas y examina pseudoestados en escritorio. La medición inicial de 528 carencias cuenta apariciones, no elementos únicos. Las capturas y JSON locales complementan esta tabla; no forman parte de los commits.
