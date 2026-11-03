# El número que flota

La portada sirve HTML y un póster WebP antes del módulo diferido de three.js. La apertura dura 2.15 s: los globos se tensan y se sustituyen por una sola malla instanciada de tiras que giran y caen. Sin WebGL o con movimiento reducido se usa un fundido corto. Entrar sin animación abre directamente. El menú está oculto e inactivo hasta que termina la entrada; Inicio devuelve a la portada sin modificar el fragmento personal.

## Configurar una fiesta de XV

Edita el objeto de `config.mjs`. Para reutilizar la plantilla completa:

- **Inicio**: cambia `name` a `Mar`, `balloons` a `XV`, `phrase` a «Mis quince empiezan en la pista», además de la paleta y la ruta del póster. Se admiten entre uno y tres caracteres de `0123456789XVI`.
- **Cuándo**: ajusta `date`, `hour`, `zone` (zona IANA), `place` y `copy.when`. El desfase UTC se calcula para esa fecha con la zona indicada, también para el calendario. La zona decide el cambio de «Hoy celebramos» a «Gracias por venir» al llegar la medianoche local.
- **La festejada**: cambia `copy.nav[2]` a «Mar» y `copy.album` a «Mis quince en fotos». Cada foto tiene prefijo `src`, texto alternativo, edad y pie. Sirve WebP de 320 y 600 px. Usar `photos: []` quita también la ancla del menú. El identificador estable del álbum en esta URL es `camila`.
- **Detalles**: configura las tres tarjetas en `cards`, con categoría, título y detalle. La primera admite una lista de colores hexadecimales. Los regalos y las notas son datos ficticios editables, no servicios confirmados de un recinto.
- **Pase**: ajusta los textos en `copy`. Nombre, edad, fecha y lugar se comparten con el resto de la invitación. En un enlace personal, el nombre, el número de lugares y la respuesta proceden de la invitación de muestra; se actualizan al cambiar de persona.

Ejecuta `node scripts/render-number-poster.mjs` y `npm run build` para regenerar el póster, sincronizar el calendario y generar el HTML. El render requiere Chrome (puedes indicar `CHROME_PATH`), WebGL 2 y FFmpeg. Se conservan el UID del evento y la URL de Camila. Actualiza las portadas comerciales cuando cambie su aspecto.

## Interacción

`?quality=low`, `medium` o `high` fuerza un nivel. El modo automático adapta resolución, antialiasing, geometría, sombras y cantidad de foil. No se pide acceso a sensores. Los dígitos son curvas propias; Sora y Manrope son las fuentes locales del proyecto. No se consumen HDR externos.

El álbum abre con el scroll de la página en escritorio y usa scroll horizontal con ajuste por foto en teléfono. Las tarjetas son botones con estado anunciado. El pase se perfora solo al aceptar; en el flujo personal espera la confirmación del servidor. La respuesta pública es una simulación local. Las interacciones están implementadas con CSS, JavaScript y three.js.
