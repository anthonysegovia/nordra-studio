# T8 · Propuesta de analítica

Revisada el 30 de octubre de 2026. **No implementada**: no se añadió un SDK,
script, cookie, evento ni configuración de proveedor. El responsable confirmó
en esta sesión que Nordra usa **Vercel Pro**; la conexión de Vercel muestra el
equipo, pero no permite consultar su suscripción. No se supone una cuenta de pago
existente en Plausible.

## Dos opciones verificadas

Importes en USD, antes de impuestos. Visitas y eventos personalizados consumen
la cuota de cada proveedor; no conocemos todavía el volumen mensual de Nordra.

| Opción | Coste y plan necesario | Evento con página y botón | Cookies |
|---|---|---|---|
| Vercel Web Analytics, Pro actual | 0,03 USD / 1.000 eventos; sujeto al crédito mensual compartido del plan. Sin cuota de eventos gratuita propia en Pro. 10.000 eventos = 0,30 USD de consumo; 100.000 = 3 USD. No requiere Analytics Plus | Pro incluye eventos personalizados y **2 propiedades**, suficientes para `page` y `button` | No utiliza cookies de terceros; identifica visitas con un hash de la petición y descarta la sesión a las 24 h |
| Plausible Cloud | Starter: 9 USD/mes hasta 10.000 vistas/eventos; **Business: 19 USD/mes** para las propiedades propuestas. Contratación independiente | Starter incluye eventos; **propiedades personalizadas requieren Business**. No asumir que Starter permite la misma desagregación | Sin cookies ni identificadores persistentes; procesamiento en infraestructura europea |

Fuentes de costes y capacidades: [Vercel, precios de Web Analytics](https://vercel.com/docs/analytics/limits-and-pricing),
[Plausible, precios](https://plausible.io/#pricing) y
[Plausible, diferencias entre planes](https://plausible.io/docs/subscription-plans).
Privacidad: [Vercel](https://vercel.com/docs/analytics/privacy-policy) y
[Plausible](https://plausible.io/privacy-focused-web-analytics).

**Recomendación:** Vercel Web Analytics en el Pro existente para empezar. Sus dos
propiedades cubren el evento solicitado y evita otra suscripción. Plausible Business
es una alternativa si se prefieren su panel, embudos y alojamiento europeo. No comprar
Plus ni contratar un proveedor hasta aprobar esta propuesta.

## Evento y alcance propuestos

Nombre: `whatsapp_click`. Ejemplo de datos, no código instalado:

```json
{"page":"negocios","button":"hero_quote"}
```

- `page`: lista cerrada de las ocho páginas comerciales; no URL libre.
- `button`: identificador estable como `hero_quote`, `closing`, `plan_aurora`,
  `plan_boreal`, `web_option` o `footer`. Los identificadores de paquetes describen
  el botón, sin capturar su precio ni el texto del usuario.
- No enviar el href completo de WhatsApp, mensaje, teléfono, nombres, correos,
  parámetros de URL, tokens, IDs de invitados ni contenido de formularios.
- Registrar un evento por activación real del enlace, también con teclado.
  La navegación por iframe debe tener un único responsable por evento: el documento
  visible. No contar precargas o frames ocultos como vistas ni duplicar eventos
  desde el padre y el iframe. Probar entrada directa, navegación, atrás y adelante.
- Limitar la instalación a las ocho páginas comerciales. Excluir gestión, paneles,
  pagos, invitaciones, demos privadas, subdominios y vistas de clientes. Normalizar
  también los pageviews a rutas comerciales sin query ni fragmentos.
- Medir clics, distribución por página/botón y relación clics/vistas. Un clic expresa
  intención de abrir WhatsApp: **no confirma mensaje enviado, contacto ni venta**.

## Consentimiento y aviso de privacidad

La ausencia de cookies publicitarias reduce el seguimiento, pero no basta por sí sola
para concluir que nunca hace falta consentimiento. Debe revisarse la configuración
real, los datos que se transmiten y la jurisdicción aplicable antes de activar.
Plausible declara que su configuración estándar no necesita un banner de consentimiento;
esto no autoriza añadir datos personales a los eventos.

Para México, la LFPDPPP regula el consentimiento y el aviso cuando se tratan datos
personales (arts. 7–9 y 14–16); prevé consentimiento tácito como regla general y
excepciones, incluida disociación previa. No se concluye aquí que cualquier hash
equivalga a disociación. [Texto vigente de la Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf).

El aviso actual menciona Vercel como alojamiento y preferencias locales, pero no
describe esta medición. Antes de activarla, proponer al responsable estos cambios:

1. Secciones «Datos y finalidades» y «Tecnologías»: explicar medición agregada de
   páginas y clics a WhatsApp, datos técnicos, finalidad y límites de la medición.
2. «Proveedores»: añadir la función analítica de Vercel o el proveedor elegido;
   revisar ubicación, contrato/DPA y tratamiento fuera de México sin inventar garantías.
3. «Conservación»: documentar la retención aplicable; Vercel Pro ofrece una ventana
   de informes de 12 meses, que no equivale por sí sola a una garantía de borrado.
4. «Derechos / Usos opcionales»: explicar el mecanismo de oposición o revocación que
   se decida implementar. Actualizar fecha y comunicar el cambio conforme al aviso.

No se modificó el aviso vigente ni se implementó un banner. La aprobación de proveedor,
configuración y texto de privacidad queda pendiente antes de instrumentar la analítica.
