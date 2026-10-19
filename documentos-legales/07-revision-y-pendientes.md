# Nordra Studio — Revisión y pendientes de publicación

Consolidación editorial de los borradores. No equivale a validación jurídica, contable ni técnica. Los originales previos se conservan en historial/antes-de-consolidacion-2026-10-16/.

## Documentos consolidados

- 01-terminos-del-servicio.md: decisiones integradas en los 12 apartados principales; compra de diseño/código permitida también después de la entrega, con pago completo previo.
- 02-aviso-de-privacidad.md: finalidades, invitados, proveedores, derechos, conservación y tecnologías agrupados por materia.
- 03-cotizacion-y-aceptacion.md: cobros y facturación junto a inversión; mantenimiento, fechas y permisos junto a publicación; aceptación después de las condiciones.
- 00-leeme.md y 04-politicas-propuestas.md: registros de decisiones e historia de trabajo. No sustituyen las versiones consolidadas ni deben publicarse como condiciones del servicio.

## Comprobación del sitio publicado

Se abrió https://nordrastudio.mx/ en navegador y se comprobó que carga la página de Nordra Studio. Se observaron en el pie de página el correo hola@nordrastudio.mx, WhatsApp +52 81 2902 2231, horario de atención y referencia a Mercado Pago. En ese pie de página no aparecieron enlaces a términos o aviso de privacidad. El DOM declara un archivo JavaScript propio (/assets/index-CLVCUv4P.js) y una hoja de estilos propia (/assets/index-BaRmxD46.css).

Esta observación no prueba la ausencia de cookies o rastreadores. La interfaz de inspección utilizada no permitió completar la auditoría de cookies, almacenamiento y tráfico de red. La consulta HTTP alternativa desde la terminal falló por resolución DNS; no se obtuvieron cabeceras por ese medio. No se inició sesión administrativa ni se ejecutaron pagos o envíos de formularios. El despliegue y las invitaciones requieren comprobación adicional de almacenamiento, red y configuración.

## Pendientes concretos

1. Contabilidad: régimen y datos fiscales del emisor; tratamiento del pago inicial y final, CFDI, métodos de pago y complementos; plazos de conservación de documentación fiscal.
2. Revisión jurídica: pacto de titularidad/licencia y adquisición de diseño/código; condición del descuento de alojamiento y reembolso; requisitos y plazos formales de derechos de datos; responsabilidades del organizador y Nordra; legislación y competencia aplicables.
3. Operación de privacidad: confirmar datos efectivamente recibidos por pagos; campos reales de clientes y formularios; cuenta/alias/reenvío del correo; proveedores, entidades, regiones y flujos; aviso y contacto del organizador para cada evento; conservación de contratos y soporte.
4. Infraestructura: probar Checkout Pro y confirmación de cobros; permisos y accesos individuales por evento; exportación segura; suspensión y despublicación; eliminación de datos y ciclo de respaldos; controles de acceso y atención de incidentes.
5. Publicación: completar URL definitiva del aviso; comprobar tecnologías en producción; revisar que precios y promesas de la web coincidan con las condiciones; añadir enlaces legales y mecanismo de aceptación y conservar la versión aceptada.
6. Cada cotización: completar alcance, límites de almacenamiento/tráfico/registros, fechas, autorizaciones, archivos y derechos opcionales, precio y plazo de entrega.

## Inventario técnico del código local

Esta revisión del código local no confirma el comportamiento del sitio publicado ni de configuraciones externas al repositorio.

- Preferencia de idioma: localStorage, clave nordra-language, en src/language.ts. Guarda el idioma elegido. El código no establece caducidad propia.
- Preferencia de tema: localStorage, clave nordra-theme, en src/hooks/useTheme.ts. Guarda la elección de tema claro u oscuro. El código no establece caducidad propia. Ambas preferencias pueden eliminarse borrando los datos del sitio en el navegador; se perderán las selecciones guardadas.
- Sesión del administrador: cookie __Host-nordra_admin, creada por server/admin-access.js y api/admin-session.js al autenticar al administrador. Contiene el token de sesión y se configura con HttpOnly, Secure, SameSite=Strict y duración máxima de 3600 segundos, limitada también por la duración de la sesión recibida. El cierre de sesión solicita su eliminación. No se encontró una cookie equivalente para visitantes generales en el código revisado.
- Supabase: los clientes de servidor revisados en server/admin-access.js deshabilitan persistSession, autoRefreshToken y detectSessionInUrl; no se debe inferir por ello que no haya otros tratamientos de datos por el proveedor.
- Invitación public/invitaciones/spooky-party/index.html: carga fuentes desde fonts.googleapis.com mediante @import. Esto implica una solicitud externa al visualizar esa invitación. Documentar ese proveedor y comprobar las solicitudes efectivas y los datos transmitidos en producción.
- Enlaces externos: se identifican enlaces a WhatsApp y Google Calendar y el flujo de pago con Mercado Pago. Distinguir navegación por acción del usuario de recursos cargados al abrir la página.
- No se encontraron integraciones explícitas de Google Analytics, Google Tag Manager, Meta Pixel, Clarity o Hotjar en las fuentes revisadas. Esto no acredita su ausencia en el despliegue o en servicios configurados externamente.

Pendiente antes de publicar: comprobar en navegador el sitio desplegado, sus invitaciones y panel, las solicitudes de red, cookies y almacenamiento efectivos, y cualquier analítica o tecnología añadida por configuración externa. Completar datos, finalidades, proveedores, duración y controles del aviso con esas pruebas. La revisión no determina por sí sola los requisitos jurídicos de consentimiento.
