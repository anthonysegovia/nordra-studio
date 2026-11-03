# La caja de regalo

La página de entrada se renderiza en HTML durante la compilación mediante `renderInvitation`. Edita `config.mjs` para definir el nombre, los globos, la fecha civil, la hora, la zona IANA, la sede, la paleta y la redacción. Los prefijos de fotos tienen variantes de 320 y 600 px. Un álbum vacío elimina su sección y su enlace. La nota necesita dos imágenes con el mismo texto que `copy.noteAlt`.

Para unos XV de Renata, cambia `name: 'Renata', balloons: 'XV', date: '2028-09-18', hour: '20:15', zone: 'America/Mexico_City', place: 'El jardín'`. Personaliza `copy.openingTitle`, las fotos y la firma. Usa un prefijo propio para `poster` y genera los globos estáticos y el calendario con `node scripts/render-number-poster.mjs`. Regenera el boleto si cambia el diseño impreso y la imagen social para el nuevo cliente. La etiqueta con la hora y los campos HTML del pase se toman de la configuración.

El formulario público responde solo dentro de la página. Un enlace personal usa el servicio existente del panel de cumpleaños y guarda únicamente al pulsar «Guardar mi respuesta».