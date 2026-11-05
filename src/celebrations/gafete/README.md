# El gafete

Plantilla aislada de eventos, renderizada como HTML por `template.mjs` durante Vite. `opening.js` controla portada, giro, salto y foco; `main.js` conecta reloj, entradas, tarjetas y el adaptador personal existente. Los estilos no modifican La caja ni la invitación de bodas.

## Configurar otro evento

Editar `config.mjs`: `name`, `line`, `date` (ISO), `hour`, `zone` IANA, `place`, `city`, `calendar`, `agenda`, `cards`, `copy` y `palette`. Los textos se escapan antes de renderizar. La zona resuelve el instante de la cuenta regresiva con `Intl`; no se debe cambiar la fecha sin actualizar también el calendario del nuevo evento.

Ejemplo de congreso:

```js
export const invitation = {
  // Conservar el resto del esquema y los textos comunes
  name: 'Congreso Nexo',
  line: 'Un día para compartir lo que viene',
  date: '2027-09-18',
  hour: '09:00',
  zone: 'America/Monterrey',
  place: 'Sede por confirmar',
  city: 'Monterrey',
  calendar: '/invitaciones/congreso-nexo/fecha.ics',
  agenda: [
    ['09:00', 'Registro', 'Recoge tu gafete'],
    ['10:00', 'Conferencia', 'Ideas para abrir la conversación'],
    ['12:00', 'Mesas de trabajo', 'Comparte tu experiencia'],
    ['14:00', 'Cierre', 'Nos llevamos nuevas conexiones'],
  ],
  cards: [
    'Ven cómodo, con tu estilo',
    'Trae tus preguntas',
    'Habrá café y agua',
  ],
  // copy.when, copy.question, confirmación y palette se adaptan al congreso
};
```

La imagen del reverso y la imagen social contienen la marca Conexión 27: para otra marca, exportar sus equivalentes y cambiar el nombre de recurso en `template.mjs` y `og:image`. Los datos, agenda, tarjetas, frente, fecha y confirmación se imprimen en HTML; no requieren editar imágenes. Las capas sin texto se derivaron del arte aprobado sin cambiar la disposición de los objetos.

## Confirmación y pases

Sin `#invitacion=`, los radios sólo cambian la muestra local; no hacen peticiones ni guardan datos. Con el enlace personal se carga dinámicamente `personal-rsvp.js`, conservando selector por persona y nombre de acompañante. Guardar usa `/api/wedding-links` con `occasion: event`. La respuesta del servidor determina si existe `passLink`: únicamente entonces se genera el QR, después de una confirmación afirmativa. El código no inventa pases para Aurora o para la muestra sin enlace.

El menú y el interior están `hidden inert` en el HTML inicial y durante la apertura, incluso con ancla. Escape y saltar terminan la apertura. La preferencia de movimiento reducido sustituye el giro por un fundido breve y elimina entradas al desplazar.

## Recursos y límites

`scripts/prepare-gafete-assets.mjs` exporta las capas con dos tamaños. La portada carga piedra y reverso; el frente se solicita al comenzar la interacción y el interior reserva las dimensiones reales y carga sus materiales en segundo plano al terminar la apertura. Los cordones se revelan al entrar su sección, no al observar la propia máscara cerrada. `check:build` incluye `check-gafete-budget.mjs`: máximo 120,000 bytes gzip contando importaciones dinámicas, RSVP y generador QR, sin Three.

La carpeta `documentacion/gafete/final/` contiene evidencia local excluida de Git.

## Recursos versionados

Solo se conservan diez originales WebP comprimidos, sus prompts y un manifiesto vigente en `artwork-source/event-gafete-v1/`. Los 23 archivos de `public/artwork/event-gafete/` son los usados por la plantilla y su imagen social. `scripts/prepare-gafete-assets.mjs` parte de los originales WebP. Los PNG y versiones descartadas se archivaron localmente fuera del repositorio.

La evidencia completa no se publica: `documentacion/gafete/` versiona documentos, JSON, scripts y tres WebP de resumen menores de 400 kB. Las capturas reales se producen con `check-gafete-browser.mjs` y `gafete-real-journey.mjs`: clic, rueda y lectura de dimensiones, sin forzar carga ni clases de revelado desde las pruebas.
