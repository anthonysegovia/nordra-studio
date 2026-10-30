# Nordra Studio

Sitio comercial y aplicaciones para invitaciones, gestión de invitados y pagos. Producción: https://nordrastudio.mx/. Proyecto Vercel: `nordra-studio`. Leer `AGENTS.md` antes de modificar diseño, navegación o publicación.

## Desarrollo y compilación

Node.js 24, según `package.json`:

```sh
npm ci
npm run dev
npx tsc -p . --noEmit
node --test scripts/horizon-flow.test.mjs
node --test server/*.test.js
npm run build
npm run preview
```

`npm run build` ejecuta TypeScript y genera `dist/`. El servidor local de Vite no reproduce todas las funciones y reglas de Vercel. Probar los flujos de servidor con fixtures; no usar tokens ni datos reales de invitados en pruebas.

## Arquitectura

- **Sitio comercial:** ocho HTML por ruta: `index.html`, `estudio.html`, `negocios.html`, `invitaciones.html`, `bodas.html`, `cumpleanos.html`, `eventos.html` y `temporada.html`.
- **Recursos del sitio:** CSS y JavaScript en `public/nordra/v541/` y `public/nordra/v544/`, servidos directamente, sin transformarse en módulos del bundle de Vite. Los nombres de esas carpetas son rutas de recursos, no la versión actual del producto. Sus parámetros de caché se actualizan manualmente al cambiar un recurso compartido.
- **Portada:** `public/nordra/v544/home.css`, `home.js` y `horizon-flow.js`. La aurora WebGL tiene calidad adaptativa, modo claro/oscuro, pausa y movimiento reducido. Su diseño y movimiento están aprobados.
- **Aplicaciones:** React 19, TypeScript y Tailwind 4. `vite.config.ts` define 15 entradas HTML para las páginas comerciales y los módulos de gestión, boda, invitación marfil, pases y recepción.
- **Backend:** funciones de Vercel en `api/`, lógica y pruebas en `server/`, migraciones de Supabase en `supabase/` e integración de pagos con Mercado Pago.

Los precios de Aurora y Boreal se insertan al compilar desde `src/data/invitationPricing.ts`, la misma configuración que usa el catálogo de cobros. No editar precios en los HTML: sus marcadores `{{offer:...}}` son resueltos por el plugin de Vite.

## Funciones conservadas

Los paneles, invitaciones personales, confirmaciones, QR, recepción y pagos conservan sus componentes React y rutas API. `gestion.html` es la entrada del módulo anterior para `?panel=...` y `?pago=...`. Vercel reescribe esos enlaces conservando su URL y parámetros; en desarrollo estático se redirigen a `gestion.html`. Las rutas de `spooky.nordrastudio.mx` y `confirmadoscova.nordrastudio.mx` mantienen prioridad.

La demostración RSVP de las páginas comerciales usa datos ficticios y no envía respuestas. Las invitaciones completas y los paneles existentes siguen separados.

La invitación marfil pública está en `/invitaciones/valentina-y-sebastian/`. El tema se guarda en `localStorage` (`nordra-theme`) y el estado del recorrido y pausa en `sessionStorage` (`nordra-journey`). Los enlaces internos no incorporan esas preferencias en la URL. Los parámetros explícitos `theme` y `motion` siguen admitidos para revisión.

Manrope se sirve en WOFF2 variable (200–800), con cobertura latina, signos del español y los caracteres usados por el sitio. El TTF original permanece como fuente de referencia para futuras ampliaciones. Las tres imágenes de `bruma-motion.html` se sirven como WebP externos, sin recomprimir. `robots.txt` excluye accesos operativos y demos; `sitemap.xml` enumera las ocho páginas comerciales. Esto no sustituye los controles de acceso a datos privados.

## Publicación

No modificar las rutas de `vercel.json`: preservan las reescrituras de paneles y pagos, los enlaces personales y los subdominios `spooky.nordrastudio.mx` y `confirmadoscova.nordrastudio.mx`.

Antes de publicar, comprobar la versión activa de producción y comparar el repositorio con `../../nordra-studio-publicar` (ruta desde este checkout). Esa copia se ha utilizado para publicaciones directas y contiene diferencias, incluidos los términos del servicio. El responsable debe decidir la versión de los términos y la futura vía de publicación; no renombrar, congelar ni sincronizar automáticamente esa carpeta.

Un push a `main` puede publicar el sitio completo y requiere autorización expresa. El saneamiento se prepara en ramas locales con commits separados; una compilación o un commit no equivale a una publicación. Para un despliegue autorizado, verificar primero una compilación preparada con `--skip-domain` y comprobar después el deployment y los dominios correspondientes.

No incluir `.env`, `*.private.json`, respaldos ni material de trabajo en commits o despliegues. `artwork-source/`, `documentacion/` y `public/demos/posada-luz/` son contenido sin rastrear que debe preservarse y excluirse de la publicación. Vite copia el contenido de `public/`: una compilación del checkout de trabajo puede incluir archivos sin rastrear; preparar el artefacto de publicación desde los archivos rastreados y revisados. Mantener las credenciales del entorno en Vercel.

Las animaciones respetan la pausa global y `prefers-reduced-motion`. Los recursos de la propuesta y sus revisiones permanecen en su carpeta independiente; no son la carpeta que se publica.

## Saneamiento técnico

La etiqueta local `baseline-saneamiento` señala `7ea72d2`, referencia de producción al iniciar el saneamiento. La fase 1 parte de `bc8b6dc`, que incorpora la eliminación aprobada de numeración decorativa; esa corrección y el saneamiento están pendientes de publicación. El plan de trabajo se consulta en `documentacion/plan-saneamiento-tecnico.md`, material local que no se incorpora automáticamente al repositorio.

Las capturas, mediciones y comparaciones se guardan fuera del repositorio. Comparar las ocho páginas y la invitación marfil en ambos temas, a 375 y 1440 px, antes y después de cada fase. No asumir equivalencia visual por haber superado TypeScript o la compilación.
