# Revisión del recorrido de contratación — 18 de octubre de 2026

## Comprobado

- En navegador local, el paquete Landing Esencial se abre y muestra precio, IVA, funciones incluidas, primer mes de alojamiento y enlace de continuidad.
- El enlace de cotización apunta a wa.me/528129022231 con paquete y funciones codificados correctamente. Se comprobó su cambio al inglés y se devolvió la página a español.
- El pie muestra teléfono +52 81 2902 2231, mailto:hola@nordrastudio.mx, enlaces legales y horario de sábado.
- Demostración local de pago: botón de pago deshabilitado; estado pendiente indica no pagar otra vez; aprobado muestra confirmación; verificación no disponible recomienda no repetir el pago. Son vistas ficticias, no transacciones.
- Se detectó horario antiguo en Payment.tsx y se corrigió para incluir sábados de 10:00 a 16:00. Se observó el texto actualizado en la demostración.
- 25 pruebas existentes pasaron: autorización, origen, cookies, importes y vencimientos, modo y cuenta del checkout, tokens, estados y confirmación con referencia, vendedor, moneda e importe. Incluyen respuestas simuladas de proveedor, no confirman integración en producción.

## Límites y pendientes reales

- El clic del enlace de WhatsApp no abrió una nueva pestaña observable en el navegador integrado. Confirmar en teléfono con WhatsApp que abre el contacto correcto y el texto preparado; no se envió mensaje.
- Teléfono y correo son enlaces correctos; no se comprobó recepción de llamada ni correo y no se enviaron comunicaciones.
- No se ejecutó un pago real ni de prueba contra Mercado Pago, ni se observó una confirmación desde el servicio real.
- La vista inspeccionada es la del navegador integrado; no acredita prueba en dispositivo móvil físico.
- Documentos legales siguen en revisión; no se aceptaron acuerdos ni se modificó producción.

Siguiente paso operativo: probar el enlace de cotización en teléfono, recepción del correo y pago con credenciales/cuentas de prueba según el entorno de Mercado Pago, con intervención del usuario para los pasos financieros. No presentar estas verificaciones pendientes como completadas.

## Actualización de evidencias — 18 de octubre de 2026

El usuario confirmó posteriormente que WhatsApp abre y funciona, que recibió el correo y que los pagos ya se habían probado en una sesión anterior. Son confirmaciones del usuario; esta revisión no ejecutó otra transacción ni verificó una conciliación en producción. Sustituyen la petición de repetir esas comprobaciones básicas, no los límites de las pruebas automatizadas descritas arriba.
