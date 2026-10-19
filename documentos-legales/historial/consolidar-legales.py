from pathlib import Path
import re
import shutil

root = Path(r'E:\Nordra Studio\Plataforma\nordra-studio-premium-v6\nordra-studio-premium\documentos-legales')
backup = root / 'historial' / 'antes-de-consolidacion-2026-10-16'
if not backup.exists():
    backup.mkdir(parents=True)
    for p in root.glob('*.md'):
        shutil.copy2(p, backup / p.name)

def load(name):
    text = (backup / name).read_text(encoding='utf-8-sig')
    parts = re.split(r'^## (.+)\n', text, flags=re.M)
    return parts[0].strip(), {parts[i]: parts[i+1].strip() for i in range(1, len(parts), 2)}

def save(name, intro, sections):
    text = intro.strip() + '\n\n' + '\n\n'.join('## ' + h + '\n\n' + b.strip() for h, b in sections) + '\n'
    (root / name).write_text(text, encoding='utf-8')

def sub(sections, key, title):
    return '### ' + title + '\n\n' + sections.pop(key)

intro, t = load('01-terminos-del-servicio.md')
intro = intro.replace('Fecha del borrador: 8 de octubre de 2026. Versión: 0.1.', 'Fecha inicial: 8 de octubre de 2026. Versión consolidada: 0.2.\nConsolidación editorial: 16 de octubre de 2026. Pendientes conservados para revisión.')
# Integrate later decisions in the original numbered sections.
t['7. Dominios, alojamiento y vigencia'] += '\n\n' + sub(t, 'Alojamiento y mantenimiento de negocios: alcance aprobado', 'Alcance del mantenimiento')
t['7. Dominios, alojamiento y vigencia'] += '\n\n' + sub(t, 'Temporada y eventos: alojamiento y recuperación de datos aprobados', 'Temporada y eventos: vigencia y recuperación')
t['8. Eventos y gestión de invitados'] += '\n\n' + sub(t, 'Datos de invitados: alcance aprobado', 'Datos de invitados')
t['8. Eventos y gestión de invitados'] += '\n\n' + sub(t, 'Acceso a datos de invitados: esquema aprobado', 'Accesos y permisos')
t['10. Materiales, propiedad y portafolio'] += '\n\n' + sub(t, 'Adquisición adicional de diseño y código: decisión comercial del 15 de octubre de 2026', 'Adquisición adicional del diseño y código')
t['11. Privacidad y atención de inconformidades'] += '\n\n' + sub(t, 'Quejas e inconformidades: procedimiento aprobado', 'Quejas e inconformidades')
t['11. Privacidad y atención de inconformidades'] += '\n\n' + sub(t, 'Solicitudes sobre datos personales: procedimiento aprobado', 'Solicitudes sobre datos personales')
t['11. Privacidad y atención de inconformidades'] += '\n\n' + sub(t, 'Comunicaciones promocionales: decisión aprobada', 'Comunicaciones y autorización de portafolio')
# Remove obsolete or duplicated descriptions without changing approved terms.
t['3. Precio y pagos'] = t['3. Precio y pagos'].replace(' La cotización desglosa impuestos, gastos y servicios externos e indica el importe final a pagar.', ' Los gastos y servicios externos se desglosan en la cotización.')
t['7. Dominios, alojamiento y vigencia'] = t['7. Dominios, alojamiento y vigencia'].replace('Ver el alcance de alojamiento y mantenimiento de negocios de este documento.', 'El alcance se detalla en «Alcance del mantenimiento» de este apartado.')
t['7. Dominios, alojamiento y vigencia'] = t['7. Dominios, alojamiento y vigencia'].replace('conforme al apartado de temporada y eventos de este documento', 'conforme a «Temporada y eventos: vigencia y recuperación» de este apartado')
t['10. Materiales, propiedad y portafolio'] = t['10. Materiales, propiedad y portafolio'].replace('por separado desde el inicio si el cliente las solicita', 'por separado, al inicio o después de entregar la página si el cliente las solicita')
t['10. Materiales, propiedad y portafolio'] = t['10. Materiales, propiedad y portafolio'].replace('el importe, el momento de pago y entrega y las condiciones de la transmisión', 'el importe, el plazo de entrega y las condiciones de la transmisión, respetando el pago completo previo aprobado')
duplicate = 'El cliente conserva los derechos que legítimamente tenga sobre sus textos, fotografías, logotipos y demás materiales, y sobre el dominio registrado a su nombre. Nordra solo utiliza esos materiales para prestar el servicio y para otros usos expresamente autorizados.'
t['10. Materiales, propiedad y portafolio'] = t['10. Materiales, propiedad y portafolio'].replace(' ' + duplicate, '')
assert len(t) == 12
save('01-terminos-del-servicio.md', intro, list(t.items()))

intro, p = load('02-aviso-de-privacidad.md')
intro = intro.replace('Fecha del borrador: 8 de octubre de 2026. Versión: 0.1.', 'Fecha inicial: 8 de octubre de 2026. Versión consolidada: 0.2.\nConsolidación editorial: 16 de octubre de 2026. Pendientes conservados para revisión.')
p['Información de invitados y asistentes'] += '\n\n' + sub(p, 'Datos de invitados: alcance aprobado', 'Datos y finalidades del evento')
p['Información de invitados y asistentes'] += '\n\n' + sub(p, 'Acceso a datos de invitados: esquema aprobado', 'Accesos y permisos')
p['Proveedores y transferencias'] += '\n\n' + sub(p, 'Inventario de proveedores: usos confirmados por el prestador', 'Proveedores confirmados')
p['Proveedores y transferencias'] += '\n\n' + sub(p, 'Correo: proveedor confirmado', 'Configuración del correo pendiente')
p['Derechos y decisiones sobre sus datos'] += '\n\n' + sub(p, 'Solicitudes sobre datos personales: procedimiento aprobado', 'Procedimiento de atención')
p['Conservación y seguridad'] += '\n\n' + sub(p, 'Consultas sin contratación: conservación aprobada', 'Consultas sin contratación')
p['Conservación y seguridad'] += '\n\n' + sub(p, 'Temporada y eventos: alojamiento y recuperación de datos aprobados', 'Temporada y eventos')
p['Finalidades secundarias'] += '\n\n' + sub(p, 'Comunicaciones promocionales: decisión aprobada', 'Comunicaciones promocionales')
inventory = p.pop('Tecnologías del sitio: inventario del código local')
p['Cookies y tecnologías similares'] = 'El código local guarda las preferencias de idioma (nordra-language) y tema (nordra-theme) en localStorage, sin caducidad propia. Pueden eliminarse borrando los datos del sitio en el navegador. El panel administrativo utiliza la cookie __Host-nordra_admin para su sesión, con duración máxima de una hora. Una invitación carga fuentes externas de Google Fonts. No se encontraron integraciones explícitas de analítica o píxeles publicitarios en las fuentes revisadas.\n\n[PENDIENTE VALIDACIÓN DEL SITIO PUBLICADO: comprobar cookies, almacenamiento, solicitudes y configuraciones externas; completar proveedores, datos, finalidades y controles antes de publicar]. El inventario técnico detallado y el alcance de la comprobación están en 07-revision-y-pendientes.md.'
p['Proveedores y transferencias'] = p['Proveedores y transferencias'].replace('Esta confirmación no acredita por sí sola la configuración de los demás proveedores ni aprueba los plazos de conservación propuestos.', 'La configuración y los flujos efectivos siguen pendientes de comprobación; los plazos de conservación aprobados se describen en «Conservación y seguridad».')
assert len(p) == 10
save('02-aviso-de-privacidad.md', intro, list(p.items()))

intro, q = load('03-cotizacion-y-aceptacion.md')
intro += '\n\nVersión editorial consolidada: 0.2. Mantiene los campos por proyecto y las revisiones pendientes.'
q['Inversión'] += '\n\n' + sub(q, 'Medio de cobro confirmado', 'Medio de cobro')
q['Inversión'] += '\n\n' + sub(q, 'Procedimiento de facturación aprobado', 'Facturación')
q['Calendario y revisiones'] += '\n\n' + sub(q, 'Inactividad del cliente: política aprobada', 'Inactividad del cliente')
q['Publicación, soporte y datos'] += '\n\n' + sub(q, 'Alojamiento y mantenimiento de negocios: alcance aprobado', 'Mantenimiento y límites por proyecto')
q['Publicación, soporte y datos'] += '\n\n' + sub(q, 'Soporte de temporada y prioridad Boreal aprobados', 'Soporte de temporada y Boreal')
q['Publicación, soporte y datos'] += '\n\n' + sub(q, 'Temporada y eventos: alojamiento y recuperación de datos aprobados', 'Temporada y eventos: fechas y recuperación')
q['Publicación, soporte y datos'] += '\n\n' + sub(q, 'Datos de invitados: alcance aprobado', 'Datos de invitados')
q['Publicación, soporte y datos'] += '\n\n' + sub(q, 'Acceso a datos de invitados: esquema aprobado', 'Accesos y permisos')
rights = q.pop('Derechos y licencia: acuerdo específico previo al inicio')
complaints = q.pop('Quejas e inconformidades: procedimiento aprobado')
requests = q.pop('Solicitudes sobre datos personales: procedimiento aprobado')
acceptance = q.pop('Aceptación')
portfolio = q.pop('Autorización opcional e independiente de portafolio')
sections = list(q.items()) + [('Derechos y licencia: acuerdo específico previo al inicio', rights), ('Quejas e inconformidades', complaints), ('Solicitudes sobre datos personales', requests), ('Aceptación', acceptance), ('Autorización opcional e independiente de portafolio', portfolio)]
save('03-cotizacion-y-aceptacion.md', intro, sections)

report = '''# Nordra Studio — Revisión y pendientes de publicación

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

'''
(root / '07-revision-y-pendientes.md').write_text(report + inventory + '\n', encoding='utf-8')
readme = root / '00-leeme.md'
text = (backup / '00-leeme.md').read_text(encoding='utf-8-sig')
text = text.replace('# Borradores legales de Nordra Studio', '# Borradores legales de Nordra Studio\n\nEstado actual: versiones editoriales 0.2 de términos, privacidad y cotización consolidadas. Consultar 07-revision-y-pendientes.md para las comprobaciones realizadas y pendientes. Los apartados siguientes conservan el registro histórico de decisiones; una mención antigua a un pendiente no sustituye el estado consolidado.')
readme.write_text(text, encoding='utf-8')

# Verify every original second-level section was integrated and core decisions remain.
checks = {
 '01-terminos-del-servicio.md': ['100 %', '6 meses', '7 días naturales después del evento', '5 días hábiles', 'correo electrónico opcional', 'Cada persona autorizada', 'Por ahora Nordra no realiza envíos promocionales', 'REVISIÓN'],
 '02-aviso-de-privacidad.md': ['6 meses sin actividad', 'Google Workspace', 'Supabase', 'correo electrónico opcional', '__Host-nordra_admin', 'PENDIENTE'],
 '03-cotizacion-y-aceptacion.md': ['100 %', 'Límites del proyecto', 'Fechas del proyecto de temporada', 'Firma o registro', 'correo electrónico opcional']
}
for name, phrases in checks.items():
    text = (root/name).read_text(encoding='utf-8')
    for phrase in phrases:
        assert phrase in text, (name, phrase)
    headings = re.findall(r'^## (.+)$', text, re.M)
    assert len(headings) == len(set(headings)), name
    print(f'{name}: {len(headings)} apartados; verificaciones correctas')
print('Originales conservados:', backup)
