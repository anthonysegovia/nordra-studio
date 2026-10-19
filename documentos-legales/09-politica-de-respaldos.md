# Política de respaldos de Nordra Studio

Definición operativa: 18 de octubre de 2026. Pendiente de configuración y pruebas; este documento no acredita que ya existan copias ni automatizaciones.

## Ubicación y organización

Google Drive de hola@nordrastudio.mx será la ubicación de las copias de archivos de clientes. Carpeta privada por proyecto, identificada por referencia, con subcarpetas Material del cliente, Diseño y entregables, Documentación y Respaldos. Los respaldos se identificarán por fecha. No habilitar enlaces públicos; compartir entregables concretos únicamente con destinatarios autorizados. Activar verificación en dos pasos y comprobar permisos.

## Alcance

- Materiales necesarios para el trabajo: logos, fotos, textos y archivos proporcionados por el cliente.
- Diseño y desarrollo: fuentes de diseño, código, dependencias declaradas e instrucciones de recuperación. Excluir node_modules, compilaciones reproducibles y datos personales de prueba innecesarios. Mantener además el código en un repositorio privado con historial; Drive es una copia adicional. La ubicación del repositorio sigue por definir.
- Documentación del proyecto: cotización aceptada, alcance, autorizaciones, cambios acordados y entregables. Separar documentos contractuales y fiscales de los materiales operativos cuando sus plazos difieran.
- Bases de datos de Supabase: requieren un procedimiento independiente de copia y recuperación. Guardar código en Drive no respalda los registros. Antes de exportar información de invitados o pagos, definir permisos, campos mínimos, protección, ubicación y conservación. No se configura ni promete aquí un respaldo de base de datos.
- Secretos: no incluir contraseñas, tokens, claves privadas ni archivos .env reales en las carpetas del cliente o en el repositorio. Documentar nombres de variables sin valores; la recuperación de credenciales requiere un mecanismo seguro separado.

## Frecuencia y ciclo de las copias

Realizar una copia semanal de los archivos operativos de proyectos activos. Conservar cada copia fechada un máximo de 30 días naturales desde su creación. La copia semanal no garantiza recuperar cambios posteriores a la última copia correcta. Una carpeta sincronizada no sustituye estas copias independientes.

Revisar vencimientos y eliminar copias diariamente, manualmente o mediante una automatización comprobada; una revisión semanal no permite garantizar el límite de 30 días. Incluir la papelera y las versiones de archivos que sigan siendo recuperables por la cuenta. No afirmar el borrado de copias internas del proveedor sin comprobar su política y configuración.

Los archivos activos no se eliminan por cumplir 30 días: ese plazo corresponde a cada copia de respaldo, no a la vigencia del proyecto ni a la documentación contractual o fiscal.

## Eliminación y restauración

Las consultas sin contratación se eliminan de los sistemas activos después de seis meses sin actividad desde la última interacción. Identificar sus copias en correo, WhatsApp, Drive y bases de datos. No crear nuevas copias de información ya eliminada. Sus copias anteriores deben salir de la rotación dentro de los 30 días siguientes, sujeto a verificar la eliminación efectiva y las condiciones del proveedor.

Para eventos, mantener las fechas de cierre y recuperación ya acordadas: recuperación durante 30 días naturales tras el cierre y aviso al cliente al menos cinco días naturales antes de eliminar los materiales y datos operativos. No renovar indefinidamente su conservación mediante nuevas copias.

Llevar un registro mínimo y restringido de eliminaciones, suficiente para volver a aplicarlas si se restaura una copia, sin duplicar el contenido eliminado. Antes de volver a utilizar los datos restaurados, aplicar las eliminaciones y restricciones vigentes. Los registros sujetos a conservación legal se separan y se mantienen únicamente para esa finalidad; no se les asigna aquí un plazo fiscal inventado.

## Comprobación previa a presentarlo como proceso activo

1. Confirmar titularidad de la cuenta, verificación en dos pasos y permisos privados.
2. Crear una copia de prueba con datos ficticios y comprobar que puede restaurarse.
3. Configurar y probar el calendario semanal de copias y el control diario de vencimientos, papelera y versiones.
4. Comprobar la exclusión de secretos y la reaplicación de eliminaciones después de restaurar.
5. Documentar qué retiene el proveedor y durante cuánto tiempo; definir por separado los respaldos de Supabase y la conservación contractual, fiscal y de soporte.

Registrar fecha, responsable y resultado de las pruebas. Solo después ajustar el aviso público para describir el procedimiento efectivamente implementado.

## Avance de configuración del 18 de octubre de 2026

Se verificó mediante el conector Google Drive que la cuenta conectada es hola@nordrastudio.mx. Se creó la carpeta https://drive.google.com/drive/folders/1VqEV6Xkj7EDCKgXPE53jABdCgnThi91n y dentro una plantilla con Material del cliente, Diseño y entregables, Documentación y Respaldos por fecha. Se comprobó por lectura que las cuatro carpetas existen y no están compartidas; la carpeta principal solo presenta permiso del propietario hola@nordrastudio.mx.

No se han subido archivos de clientes, configurado copias automáticas ni probado restauración o borrado. La verificación en dos pasos tampoco se ha comprobado. Siguiente paso: identificar las carpetas de origen de los archivos de proyectos para configurar la copia sin incluir secretos ni información ajena.

### Prueba posterior de subida y recuperación

El usuario confirmó que los archivos se guardarán en esta computadora, dentro de E:\Nordra Studio. Se inventariaron solo nombres de carpetas. Credenciales, Comprobantes de Pago, Constancias, Linea Telcel y Pruebas Mercado Pago no se incorporan automáticamente a un respaldo de proyectos; requieren clasificación aparte. Excluir también la carpeta Respaldo para evitar copias recursivas.

Se creó una prueba con los archivos públicos privacy.css y favicon.svg y un LEEME explicativo, sin datos de clientes ni secretos. ZIP subido a la carpeta privada 99 — Pruebas de recuperación, de la misma cuenta confirmada. Archivo: https://drive.google.com/file/d/1Cn_pf_fKjWHfrPF8EdrsJKSEOAdYHUed/view.

Se leyó la metadata de Drive: únicamente permiso del propietario hola@nordrastudio.mx. Se descargó el archivo desde la referencia autenticada del conector, se calculó SHA-256 y se descomprimió correctamente en E:\Nordra Studio\Respaldo\Prueba-Drive-2026-10-18\Recuperado. El ZIP original y el descargado tienen la misma huella: 3EFAB72AF8D0708CA37D302A4A08E2CCF2EB44B82EE1BC42AE424183764AFBF6.

Resultado: transferencia y recuperación de esta muestra verificadas. No constituye un respaldo completo, no comprueba recuperación de Supabase ni exclusión de secretos en todos los proyectos. Continúan pendientes la selección completa de fuentes, copias semanales, vencimiento y eliminación a 30 días y verificación en dos pasos. La copia de prueba creada el 18 de octubre debe incluirse en el control de vencimientos para el 17 de noviembre de 2026; aún no se ha programado su eliminación.

### Primera copia de código y recursos y programación posterior

Se creó E:\Nordra Studio\Respaldo\Crear-Respaldo-Web.ps1: incluye únicamente src, public, api, server, supabase, scripts y archivos de configuración de raíz enumerados; excluye .env, archivos .private, claves, dependencias, compilaciones y enlaces de archivos. Detiene la creación ante patrones de secretos reconocibles; este detector no garantiza identificar todos los secretos posibles. No incluye datos vivos de Supabase, repositorio .git, documentos legales de trabajo ni recursos de diseño fuera de esas rutas.

Copia de 76 archivos creada el 18 de octubre de 2026, ZIP de 15,736,606 bytes. Se verificó cada entrada contra el manifiesto SHA-256; se subió a la carpeta privada de la web https://drive.google.com/drive/folders/1g25pyIr-AkHfU47lkFuauntVw_mDNdd8 y se descargó. La huella del ZIP descargado coincide con la del original: 9A7301DEC20CECEDE15BAFA28B722B0719AD9065ACE685E28A259A437EAF5A61. Archivo remoto: https://drive.google.com/file/d/18L9Psi6Mqv9527A2n512CYZdh8IV5-L7/view. Metadata: únicamente propietario hola@nordrastudio.mx.

Registro de copias: E:\Nordra Studio\Respaldo\registro-drive.json. Automatización de chat activa respaldos-de-nordra-studio: revisión diaria a las 10:00, hora de Ciudad de México, copia nueva al pasar siete días desde la última verificada y eliminación solo de copias registradas que superen 30 días, con validación previa de identidad, ubicación y permisos. Confirmada la creación de la programación; sus ejecuciones futuras y su ciclo de eliminación todavía no se han observado ni probado. Necesita equipo, aplicación, acceso local y conector disponibles. Puede retrasarse si no se ejecuta; no acredita un límite incondicional de 30 días. Debe notificarse cualquier fallo.

Esto configura el respaldo de código y recursos de la web principal, no de todos los clientes ni de toda la unidad. Continúan pendientes: verificación en dos pasos, prueba controlada de borrado, credenciales de recuperación y respaldo de datos de Supabase, clasificación de documentación y definición de repositorio privado. El aviso público sigue en revisión.

### Exportación manual del panel de cobros

El usuario recuperó el acceso administrativo y descargó el respaldo. Se identificó en Descargas nordra-respaldo-2026-10-19T00-37-10-887Z.json, exportado el 18 de octubre de 2026 en hora de Ciudad de México (exportedAt UTC 2026-10-19T00:37:11.491Z). Validado formato nordra-payments-backup, versión 1: siete solicitudes de pago y diez reservas de referencia. No se mostraron registros individuales en el chat.

Se guardó en Drive de hola@nordrastudio.mx: https://drive.google.com/file/d/17W27lxa7fZFh3U5pZL5AozIjjsOS-zCo/view, dentro de la carpeta Respaldos de cobros (ID 1dthDkx5T5U7zTyjSU_iSFVlr4qc-vfkI). Lectura de permisos: solo propietario. Se descargó en E:\Nordra Studio\Respaldo\Cobros\nordra-cobros-2026-10-18.json y su SHA-256 coincide con el original: 15E0081B210EEC37D729F1B3FA4DA44758597FB9FFAB765F6F99F28BAA1F7551.

Es una exportación parcial de las dos tablas del panel, no una copia completa de Supabase; no se ha probado importar sus registros ni restaurar autenticación/configuración. No está automatizada por la tarea de ZIP de la web. La rotación y eliminación de este JSON y del original de Descargas deben incorporarse al procedimiento específico de cobros antes de prometer su cumplimiento; la copia no cambia los plazos de conservación legal de los registros originales.

### Primera exportación PostgreSQL de Supabase

El usuario ejecutó localmente Crear-Respaldo-Supabase.ps1 e introdujo la contraseña de base de datos de forma oculta. Se generó E:\Nordra Studio\Respaldo\Supabase\nordra-supabase-20261018-184816.dump (229594 bytes), con manifiesto. Fecha UTC del manifiesto: 2026-10-19T00:48:29.3231753Z, 18 de octubre en Ciudad de México. Huella local cotejada contra el manifiesto y catálogo leído con pg_restore 17.

El catálogo contiene datos de public.nordra_payment_requests, public.nordra_quote_references, auth.users y metadatos de storage. Exportación limitada a public, auth y storage: no incluye los archivos binarios de Storage, roles globales ni configuración del proyecto. No se ha probado restauración en un entorno separado. Leer el catálogo y comprobar huella no acredita una restauración completa.

Subida mediante Google Drive a la cuenta confirmada hola@nordrastudio.mx: https://drive.google.com/file/d/1ixQSfQ6wdfxe2JBVmBiWLYKo-60WaveU/view, carpeta 1hLimI7S5rN4Hi_SmVDgh2XjH9MgqFHKF. El archivo contiene datos de autenticación y debe permanecer privado. Esta copia es manual; la tarea de respaldo web no cubre su generación ni rotación. Quedan pendientes prueba de restauración, verificación de integridad tras descarga y gestión de vencimiento de esta copia.

### Prueba de restauración completada

18 de octubre de 2026, 19:04 hora de Ciudad de México. Probar-Restauracion-Supabase.ps1 creó un clúster local independiente de PostgreSQL 17, con contraseña aleatoria, permisos de archivos restringidos al usuario y escucha exclusiva en 127.0.0.1:55439. No se utilizó ninguna conexión remota ni se modificó producción. La base recién creada se preparó eliminando únicamente su esquema public vacío para permitir que el archivo lo creara.

Restauración en una transacción con --exit-on-error, --no-owner y --no-privileges: terminó sin errores. Consulta posterior: siete solicitudes, diez referencias, un usuario y cero objetos de Storage. Seguridad por fila activa en ambas tablas de Nordra, función nordra_reserve_reference presente y una clave foránea en solicitudes. SHA-256 del archivo probado: 9A70E0EC4487184A057C90910B12A438A4743732A9D1EC2D895127A8CA0883AB. Informe: E:\Nordra Studio\Respaldo\Prueba-Restauracion-20261018-190405\resultado.json. Manifiesto del archivo actualizado con el alcance de esta prueba.

La instancia se detuvo al terminar. Los clústeres temporales de los intentos locales se eliminaron tras verificar sus rutas y ausencia de postmaster.pid; se conservaron informes y registros. Contraseña temporal eliminada y entorno del proceso restaurado.

Esta prueba demuestra restauración lógica local de los esquemas y datos exportados; no demuestra funcionamiento del servicio de Supabase Auth, políticas de roles/privilegios originales, API, configuración alojada ni archivos binarios de Storage. Los intentos previos fallaron por espera del arranque y esquema public preexistente en la base local, corregidos sin modificar el archivo de respaldo. La copia en Drive aún necesita comprobación tras descarga y su ciclo de eliminación específico sigue pendiente.
