# Nordra Studio

Sitio público con el diseño aprobado de la revisión 5.41, integrado sobre React, TypeScript y Vite. Despliegue en el proyecto Vercel `nordra-studio` de `anthony-662e`.

## Desarrollo y compilación

```sh
npm install
npm run dev
npm run build
npm run preview
node --test server/*.test.js
```

Las páginas de presentación son HTML por ruta: `index.html`, `estudio.html`, `negocios.html`, `invitaciones.html`, `bodas.html`, `cumpleanos.html`, `eventos.html` y `temporada.html`. Comparten estilos, imágenes y controladores de movimiento en `public/nordra/v541/`. Cada documento contiene solamente su contenido. BRUMA carga su recorrido decorativo por separado.

Los precios de Aurora y Boreal se insertan al compilar desde `src/data/invitationPricing.ts`, la misma configuración que usa el catálogo de cobros. No editar precios en los HTML: sus marcadores `{{offer:...}}` son resueltos por el plugin de Vite.

## Funciones conservadas

Los paneles, invitaciones personales, confirmaciones, QR, recepción y pagos conservan sus componentes React y rutas API. `gestion.html` es la entrada del módulo anterior para `?panel=...` y `?pago=...`. Vercel reescribe esos enlaces conservando su URL y parámetros; en desarrollo estático se redirigen a `gestion.html`. Las rutas de `spooky.nordrastudio.mx` y `confirmadoscova.nordrastudio.mx` mantienen prioridad.

La demostración RSVP de las páginas comerciales usa datos ficticios y no envía respuestas. Las invitaciones completas y los paneles existentes siguen separados.

## Publicación

Verificar siempre el proyecto y la versión actualmente publicada. La copia `../nordra-studio-publicar` también ha servido como origen de publicaciones directas: no desplegar una base anterior sobre ella. La base de esta migración coincide con el commit `bccf36e9f5e287681cdfcfee455cc61591b7e94f` y el deployment `dpl_BcGzDF4Q9tUG5X3Rnpueuk2UAoqG`.

Preparar un deployment de producción con `--skip-domain`, verificarlo y promover exactamente ese deployment. No subir `.env`, archivos `*.private.json`, respaldos ni material de trabajo. La configuración de entorno del proyecto se conserva en Vercel.

Las animaciones respetan la pausa global y `prefers-reduced-motion`. Los recursos de la propuesta y sus revisiones permanecen en su carpeta independiente; no son la carpeta que se publica.
