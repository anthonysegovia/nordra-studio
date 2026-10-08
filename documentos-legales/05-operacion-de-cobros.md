# Cobros individuales de Nordra — implementación inicial

Vista de demostración local: `http://localhost:5174/?pago=demo`. Contiene datos ficticios, no crea un cobro y su botón está desactivado.

## Flujo sin cuentas de clientes

1. Aceptar la cotización y los términos por el mecanismo documentado.
2. Crear una solicitud para el anticipo con referencia, concepto, proyecto, importe final en centavos y fecha de vencimiento. No incluir nombre, correo, teléfono ni datos de invitados en esta configuración.
3. Generar una preferencia de Checkout Pro mediante el script local, cargar la solicitud en la configuración privada del servidor y compartir el enlace individual por WhatsApp o correo.
4. El cliente consulta el detalle en Nordra y paga en Mercado Pago.
5. Verificar en Mercado Pago la referencia, moneda, importe y estado aprobado. Confirmar al cliente y cambiar el estado de la solicitud a `paid` en la configuración del servidor. No confirmar por capturas ni parámetros de retorno del navegador.
6. Tras aprobar la vista previa final, emitir otra solicitud por el saldo. Usar conceptos distintos para anticipo y saldo. Las renovaciones son solicitudes independientes, sin cobros automáticos.

Temporada conserva enlaces de pago directos de Mercado Pago. Esta implementación no integra pagos de ventas o entradas en los sitios de los clientes.

## Configuración y pruebas pendientes antes de cobros reales

- Crear o configurar la aplicación de Mercado Pago y utilizar una cuenta vendedora de prueba inicialmente. El script verifica que la cuenta corresponda al modo test/live antes de crear la preferencia. Checkout Pro utiliza `init_point` también para pruebas; no usar `sandbox_init_point`. Para completar una prueba, usar una cuenta compradora de prueba distinta y los datos de tarjeta de prueba oficiales.
- Establecer `MERCADO_PAGO_ACCESS_TOKEN` únicamente en el entorno del script local. Nunca usar prefijo `VITE_`, subirlo al repositorio o compartirlo por chat.
- Establecer `NORDRA_SITE_URL` con el origen HTTPS definitivo, sin rutas, parámetros ni fragmentos, y `NORDRA_PAYMENT_MODE=test`. Cambiar a `live` únicamente después de verificar el flujo con la cuenta adecuada.
- Preparar un archivo local `cotizacion.private.json`, excluido de Git, con este formato (importes de ejemplo):

```json
{
  "reference": "NDR-001",
  "project": "Página informativa",
  "concept": "Anticipo del 50%",
  "amountCents": 149950,
  "expiresAt": "2027-01-15T18:00:00-06:00"
}
```

- Ejecutar desde la raíz del proyecto: `node scripts/create-payment.mjs cotizacion.private.json`.
- El script crea una preferencia de pago, no realiza un cargo. Guarda solicitudes en `payment-requests.private.json`, excluido de Git. Copiar su contenido JSON en la variable privada `NORDRA_PAYMENT_REQUESTS_JSON` de Vercel. Publicar esa configuración antes de compartir el enlace que imprime el script. Restringir el acceso al archivo y a los enlaces: quien tenga el enlace puede consultar el concepto y el importe.
- La vista usa `/?pago=<token>` y consulta `/api/payment-request`. La función se ejecuta en Vercel; `npm run dev` de Vite muestra la demo, pero no sirve las funciones de Vercel. Probar solicitudes reales en un despliegue de pruebas de Vercel con variables del entorno correspondiente.
- Probar pago aprobado, pendiente, rechazado, abandono, enlace vencido y retorno. Comprobar monto, moneda, referencia, vencimiento, URL HTTPS y cuenta receptora en Mercado Pago.
- Confirmar qué datos y comprobantes se recibirán para completar el aviso de privacidad y el procedimiento de facturación.

## Límites de esta primera versión

La confirmación y el cierre de solicitudes son manuales. Los estados de retorno no acreditan pagos. Las solicitudes abiertas reutilizan la misma preferencia de Mercado Pago; esta versión no garantiza que una preferencia solo pueda pagarse una vez. Cerrar la solicitud en Nordra oculta el botón, pero no revoca por sí solo una URL de Mercado Pago ya compartida. Para cancelar o invalidar un cobro, gestionar también la preferencia en Mercado Pago. No reenviar solicitudes ya pagadas.

Antes de automatizar confirmaciones, activar servicios o ampliar el volumen, implementar almacenamiento persistente, verificación autenticada de notificaciones, conciliación de importe/referencia, control de pagos duplicados y registros de estados. No hay portal con inicio de sesión, base de datos de cobros ni activación automática del alojamiento en esta versión.

La demostración está disponible; los cobros reales no se han configurado, probado ni publicado. Las tarifas y políticas comerciales siguen en los borradores para revisión.

Fuentes: [Crear preferencia de Checkout Pro](https://www.mercadopago.com.mx/developers/es/reference/online-payments/checkout-pro-preferences/create-preference/post), [Checkout Pro](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro-orders/overview?scope=prod).

Pruebas de Checkout Pro: [Guía oficial de cuentas de prueba e init_point](https://www.mercadopago.com.mx/developers/es/news/2023/11/16/Questions-on-how-to-test-your-integration--).
