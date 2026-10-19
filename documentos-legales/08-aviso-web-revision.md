# Aviso web — revisión del 18 de octubre de 2026

Se preparó public/aviso-de-privacidad.html como versión local para revisión y se enlazó desde el footer. No se desplegó. Conserva noindex y una etiqueta visible de revisión. El borrador original se conserva sin cambios.

El usuario confirmó expresamente identidad y domicilio y autorizó su aparición en el aviso público. El correo y los proveedores proceden de los registros de decisiones existentes.

Referencia para requisitos mínimos y derechos: https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo125102.html (artículos 15, 28, 29 y 31). Antes de publicar, comprobar el texto vigente consolidado y los procedimientos operativos.

## Pendientes para cerrar la versión pública

- Verificar en producción cookies, almacenamiento, red, registros técnicos y cualquier analítica configurada fuera del código.
- Completar entidades, regiones y condiciones de tratamiento de los proveedores; flujos y datos visibles en el panel de Mercado Pago y registros de correo, cobros y soporte. La consulta de la API obtiene respuestas que pueden contener datos adicionales, aunque el código solo usa campos de conciliación.
- Confirmar ejecución de eliminación de consultas a los seis meses; conservación contractual, fiscal y de soporte; ciclo de borrado de respaldos. No se inventaron plazos ni regiones.
- Validar recuperación, aviso previo y borrado de eventos antes de presentar el esquema previsto como operación implementada. Cada evento necesita su propio aviso y contacto de responsable.
- Revisar plazos y requisitos del procedimiento ARCO, revocación y limitación; verificar que se pueden cumplir y que el canal recibe solicitudes.
- Al cerrar estas verificaciones, sustituir las menciones de revisión por versión y fecha de vigencia. Mantener noindex es una decisión de indexación; no impide el acceso público al archivo si se despliega.

No desplegar esta versión como aviso definitivo mientras conserve afirmaciones de operación pendientes de comprobar.

## Definición de respaldos del 18 de octubre de 2026

Se documentó el esquema en 09-politica-de-respaldos.md: Drive de hola@nordrastudio.mx, carpetas privadas por proyecto, copias semanales de archivos y conservación de cada copia durante 30 días naturales, con control diario de vencimientos. Código también en repositorio privado por definir; datos de Supabase requieren procedimiento separado. Consultas sin contratación: seis meses sin actividad, confirmado por el usuario. La política distingue archivos activos de copias y conservación legal de documentos. La implementación, restauración y eliminación siguen pendientes de prueba; el aviso web no se modifica para afirmar procesos aún no verificados.

## Versión web 0.3 — actualización posterior a las pruebas

Se actualizó el apartado 7 del aviso HTML para reflejar el estado comprobado: Drive privado, tarea programada solo para código y recursos de la web, exportaciones manuales de cobros y Supabase y restauración lógica local probada. Se distingue el plazo por copia de 30 días de la conservación de proyectos activos y documentos legales.

No se presenta como garantía operativa lo que sigue pendiente: limpieza en todos los canales de consultas, plazos contractuales/fiscales/soporte, validación de cierre de eventos, ciclo completo de rotación de la web y eliminación de copias manuales/descargas y copias internas de proveedores. La prueba de restauración no cubre servicios alojados, roles originales, configuración o binarios de Storage.

Se conserva etiqueta de revisión y noindex; no se ha desplegado. Antes de convertir este texto en aviso definitivo, resolver esos pendientes y las comprobaciones de producción indicadas arriba. El borrador consolidado 02 permanece como antecedente; para estado técnico vigente consultar 09-politica-de-respaldos.md.

El usuario aprobó posteriormente conservar el historial ordinario de soporte durante la atención y doce meses después del cierre de cada caso. Se incorporó al aviso web y a 10-plazos-de-conservacion.md, con separación de evidencias contractuales y reclamaciones abiertas y sin ampliar soporte, garantías o alojamiento. Este plazo ya no está pendiente de decisión; sigue pendiente comprobar su ejecución y eliminación en los canales utilizados.
