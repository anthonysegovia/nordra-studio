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
