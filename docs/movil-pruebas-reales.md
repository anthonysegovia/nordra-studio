# Pruebas móviles en dispositivos reales

Sirve el build en una dirección accesible desde los dos teléfonos. Usa la misma versión, orientación, tema y conexión en cada comparación. Anota el modelo, versión del sistema y del navegador, ahorro de datos, movimiento reducido y si la caché estaba fría o caliente.

En iPhone, activa Web Inspector en los ajustes avanzados de Safari. Conecta el teléfono a un Mac de confianza, abre el sitio en Safari y selecciona la pestaña del teléfono desde el menú Desarrollo de Safari en el Mac. [Guía de Web Inspector](https://webkit.org/web-inspector/enabling-web-inspector/).

En un Android de gama media, activa las opciones de desarrollador y la depuración USB. Conecta el cable, acepta la clave del equipo y abre el sitio en Chrome. Desde el escritorio abre `chrome://inspect/#devices` e inspecciona la pestaña. Al terminar, desconecta el equipo y desactiva la depuración USB. [Guía de Chrome](https://developer.chrome.com/docs/devtools/remote-debugging/).

1. Inicio → Negocios → precios → WhatsApp. Desplázate con el pulgar, elige un paquete y abre WhatsApp desde la barra. Comprueba el mensaje sin enviarlo y vuelve al sitio. Revisa el pie y el área segura en vertical y horizontal.
2. Inicio → Invitaciones → vitrina → «Pruébala aquí» → clientes. Vuelve de la invitación, desliza las tarjetas y toca sus puntos. Comprueba que la posición anunciada coincide con la tarjeta visible.
3. Recarga el inicio. Comprueba en Red que el teléfono muestra el póster y no descarga Three. Repite con movimiento reducido y, si el navegador expone ahorro de datos, con esa opción activada.

En cada recorrido registra el control, el retraso entre toque y respuesta visible, el tramo donde el scroll pierde fluidez y qué elemento cambia de posición al cargar. Graba una traza de rendimiento y repite sin el inspector para distinguir el coste de la depuración. Guarda tiempos y capturas sin contenido de conversaciones ni datos personales. Las métricas de campo estarán disponibles cuando el responsable habilite Speed Insights en Vercel.
