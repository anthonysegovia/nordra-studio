# Cobros individuales de Nordra — implementación inicial

Vista de demostración local: `http://localhost:5174/?pago=demo`. Contiene datos ficticios, no crea un cobro y su botón está desactivado.

## Flujo sin cuentas de clientes

1. Aceptar la cotización y los términos por el mecanismo documentado.
2. Crear una solicitud para el anticipo con referencia, concepto, proyecto, importe final en centavos y fecha de vencimiento. No incluir nombre, correo, teléfono ni datos de invitados en esta configuración.
3. Generar una preferencia de Checkout Pro mediante el script local, cargar la solicitud en la configuración privada del servidor y compartir el enlace individual por WhatsApp o correo.
4. El cliente consulta el detalle en Nordra y paga en Mercado Pago.
5. La página consulta desde el servidor a Mercado Pago y confirma únicamente pagos aprobados con referencia, cuenta receptora, moneda e importe correctos. Muestra el total pagado y oculta el botón cuando hay aprobación. Los pagos pendientes se consultan de nuevo de forma limitada y ofrecen consulta manual; un error de verificación no habilita otro pago. No confirmar por capturas ni parámetros de estado del navegador.
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
- Configurar `MERCADO_PAGO_ACCESS_TOKEN` como secreto de servidor también en Vercel, en el entorno donde se prueba la página. Debe ser la credencial de la cuenta vendedora que generó las preferencias. No usar prefijo `VITE_` ni incluir el valor en archivos públicos o en `NORDRA_PAYMENT_REQUESTS_JSON`. Después de añadirlo, redeploy para aplicarlo.
- Confirmar qué datos y comprobantes se recibirán para completar el aviso de privacidad y el procedimiento de facturación.

## Límites de esta primera versión

La confirmación visible es automática mediante consultas autenticadas a Mercado Pago al abrir la página o consultar el estado. El servidor consulta la cuenta receptora y los pagos de la referencia; si se indica un ID de pago de retorno, lo consulta también y valida sus datos. Una URL con `status=approved` no demuestra el pago. Se bloquea el botón ante pagos pendientes, devoluciones, disputas, importes inesperados o fallos de verificación. No se envían datos de comprador ni credenciales al navegador.

No hay persistencia propia de cobros ni notificaciones de fondo (webhooks). La búsqueda de Mercado Pago cubre los últimos 12 meses; para histórico y gestión operativa se necesita almacenamiento persistente. Las consultas de pantalla no activan alojamiento ni sustituyen conciliación, facturación o seguimiento administrativo.

Las preferencias pueden reutilizarse: ocultar el botón no garantiza un único cobro si alguien ya conserva la URL de Mercado Pago o abre dos sesiones simultáneas. Cerrar la solicitud en Nordra no revoca esa URL. Para cancelar un cobro, gestionar también su preferencia en Mercado Pago. Antes de automatizar entrega de servicios o ampliar el volumen, implementar almacenamiento persistente, notificaciones autenticadas, control de duplicados y registros de estados.

Prueba de integración realizada con la credencial local: la verificación confirmó el pago de prueba por $100 MXN tanto por retorno como por búsqueda de referencia. La pantalla de confirmación se verificó localmente y pasaron 13 pruebas. Para que funcione en el dominio publicado, configurar la credencial como secreto del servidor de Vercel y comprobar el despliegue. No se han habilitado credenciales ni cobros de producción.

Fuentes: [Crear preferencia de Checkout Pro](https://www.mercadopago.com.mx/developers/es/reference/online-payments/checkout-pro-preferences/create-preference/post), [Checkout Pro](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro-orders/overview?scope=prod).

Pruebas de Checkout Pro: [Guía oficial de cuentas de prueba e init_point](https://www.mercadopago.com.mx/developers/es/news/2023/11/16/Questions-on-how-to-test-your-integration--).
