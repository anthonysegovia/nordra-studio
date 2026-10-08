# Panel de cobros — preparado, pendiente de conexión

Demostración: `/?panel=demo`. Solo datos ficticios en memoria; no llama a Mercado Pago ni crea solicitudes persistentes. Acceso real: `/?panel=admin`.

## Alcance

- Crear solicitudes de anticipo, saldo, alojamiento mensual/semestral/anual y servicios adicionales.
- Indicar referencia de cotización, proyecto, concepto, importe final con IVA incluido y vencimiento.
- Guardar solicitudes en base de datos y crear preferencias de Checkout Pro desde el servidor, sin editar variables de Vercel para cada cobro.
- Copiar el enlace individual, abrir la página de pago y consultar el estado con Mercado Pago.
- Mostrar hasta 100 solicitudes recientes. Los estados e importes confirmados de la lista son el último resumen verificado, no un reporte contable completo ni conciliación bancaria.

La integración de almacenamiento y acceso se preparó con Supabase. No se ha creado un proyecto externo ni se ha contratado un plan. Queda pendiente confirmar el proveedor con el titular y conectar su proyecto antes de usar datos reales.

## Configuración requerida

1. En tu proyecto Supabase, aplicar `supabase/001_payment_requests.sql`. La tabla tiene RLS activado, sin permisos de acceso para usuarios públicos o autenticados mediante la Data API; solo las funciones del servidor usan la clave secreta después de validar al administrador.
2. Crear tu usuario administrador en Supabase Auth, con correo confirmado y contraseña propia. No enviar contraseñas ni claves por chat. Copiar su UUID para autorizar únicamente esa cuenta.
3. Configurar en el servidor de Vercel:
   - `SUPABASE_URL`: URL del proyecto.
   - `SUPABASE_PUBLISHABLE_KEY`: clave pública del proyecto, utilizada por el servidor para Auth.
   - `SUPABASE_SECRET_KEY`: clave secreta del proyecto, únicamente en servidor.
   - `NORDRA_ADMIN_USER_ID`: UUID del usuario administrador confirmado.
   - `NORDRA_SITE_URL=https://nordrastudio.mx`.
   - `NORDRA_PAYMENT_MODE=test`, con la cuenta vendedora de pruebas actual.
   - `MERCADO_PAGO_ACCESS_TOKEN`: credencial de esa misma cuenta vendedora.
4. Conservar `NORDRA_PAYMENT_REQUESTS_JSON` para que los enlaces anteriores sigan funcionando durante la transición. Esas solicitudes antiguas no se importan automáticamente a la lista del panel.
5. Redeploy. Entrar por HTTPS a `/?panel=admin` y comprobar login, logout, vencimiento de sesión, creación y recuperación del enlace después de recargar. Verificar que un usuario distinto y una petición de otro origen no puedan listar o crear solicitudes.

## Acceso y creación

El servidor valida el usuario con Supabase Auth en cada solicitud. No confía en un UUID enviado por el navegador. La sesión se guarda en una cookie `HttpOnly`, `Secure`, `SameSite=Strict`, limitada al host y a un máximo de una hora; al vencer hay que iniciar sesión de nuevo. No se guardan contraseñas en Nordra ni se exponen claves al frontend. El inicio usa los controles y límites de Supabase Auth; configurar sus límites y el usuario antes de habilitar el acceso.

Cada referencia y concepto solo puede reservarse una vez. Para renovaciones usar una referencia por periodo, por ejemplo `NDR-003-2026-11`. Cada intento de formulario tiene además un ID único. Una solicitud se reserva en base de datos antes de llamar a Mercado Pago para evitar crear dos preferencias por doble envío. Si falla la creación o el guardado, se conserva para revisión y no se reintenta automáticamente: puede existir una preferencia en Mercado Pago que deba conciliarse.

La fecha del formulario se interpreta en la hora local del dispositivo y se guarda en UTC. El importe se guarda en centavos. Los vencimientos de nuevas solicitudes deben ser futuros y no exceder un año.

## Verificación y límites

Se verificaron mediante respuestas simuladas los estados rechazado, pendiente, vencido y proveedor no disponible; el pago aprobado ya se comprobó contra Mercado Pago. La demostración de pago tiene un selector de escenarios y no realiza operaciones financieras. Pasaron 24 pruebas automatizadas de pagos, acceso, validación de importes y creación de preferencias, además de la compilación y el formulario de demostración en navegador.

La base de datos no se ha conectado: faltan las pruebas reales de login, RLS, persistencia y creación desde el panel con el proyecto elegido. Antes de cobros reales también falta probar en Mercado Pago un rechazo y un pendiente con sus cuentas y medios de prueba oficiales.

No se han añadido webhooks, entrega automática de servicios, facturación automática, recuperación de contraseña dentro de Nordra, exportación del reporte administrativo ni anulación/reembolso desde el panel. La recuperación de acceso se administra por Supabase. Cerrar el navegador o salir elimina el acceso desde la cookie; un JWT previamente robado sigue sujeto a su vencimiento y a las reglas de Supabase.

Una preferencia ya compartida puede recibir más de un pago, aunque Nordra oculte el botón al confirmar. El control de doble envío al crear solicitudes no constituye una garantía de cobro único en Mercado Pago. Conciliar duplicados y notificaciones antes de automatizar entrega de servicios.

Antes de usar datos reales, completar el aviso de privacidad con el proveedor, ubicación, finalidades, conservación y procedimiento de eliminación. Las solicitudes guardadas no se borran automáticamente al terminar el hosting de una página.

Fuentes: [Supabase Auth: getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [Claves API](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Runtime de Vercel fijado a Node.js 24 en package.json, compatible con el SDK instalado.

El formulario incluye un catálogo de páginas, paquetes de eventos, temporada, alojamiento y extras. Al seleccionar servicio y modalidad de cobro, se sugiere el importe con IVA incluido, editable. Las tarifas por rango usan el importe inicial como referencia; los servicios sin tarifa fija requieren cotización manual. El saldo sugerido del 50% no sustituye comprobar los pagos reales y la cotización.

## Folios automáticos

Aplicar también `supabase/002_quote_references.sql` en el editor SQL de Supabase. El panel reserva un folio anual NDR-2026-001 al abrir una nueva solicitud. Las reservas se serializan en la base de datos y los reintentos conservan el folio. Puede haber saltos por solicitudes canceladas; los folios no se reciclan. El campo sigue editable para usar la misma referencia en anticipo y saldo. La lista sugiere referencias de las 100 solicitudes recientes; referencias anteriores se pueden escribir manualmente. En demostración, la numeración solo dura durante la sesión y se reinicia al recargar.
