# El número que flota

La portada muestra HTML y un WebP desde el primer render. La escena se importa cuando el póster está listo y visible. La respuesta pública y la personal utilizan el controlador compartido de invitaciones.

## Otra celebración

Edita `config.mjs`. Por ejemplo, usa `name: 'Mar', balloons: 'XV', phrase: 'Mis quince años'`, y cambia la fecha ISO, la hora local, el desfase UTC, el lugar, los textos y la paleta. Se admiten de uno a tres caracteres de `0123456789XVI`. Las curvas son originales de esta plantilla. Sora y Manrope son las fuentes locales del proyecto; sus contornos no se utilizan para la geometría.

Ejecuta `node scripts/render-number-poster.mjs` desde la raíz para renderizar las dos resoluciones del póster y sincronizar el calendario. Requiere Chrome (se puede indicar `CHROME_PATH`), WebGL 2 y FFmpeg. Después, ejecuta `npm run build`. Vite imprime los datos en el HTML de la invitación. Regenera las capturas comerciales cuando cambie el diseño.

## Escena y acceso

`?quality=low`, `medium` o `high` fuerza la calidad para pruebas. El nivel automático tiene en cuenta pantalla, memoria anunciada y ahorro de datos. Cambian la malla, el antialiasing y el límite de resolución. La luz proviene de un panorama procedural filtrado con PMREM. No hay mapas HDR externos ni pases de sombras.

El puntero inclina el foil; un toque sin arrastre inicia la apertura. El control de pausa detiene el vaivén. Con movimiento reducido o sin WebGL queda el póster; Entrar sin animación abre directamente. En el interior se conserva una miniatura en el encabezado, sin un segundo canvas ni un bucle de render. La URL y el fragmento personal se conservan al navegar por las secciones.
