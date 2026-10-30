# Tokens de color del sitio comercial

Esta organización conserva los valores publicados en `e186741`. Las decisiones de identidad y publicación pertenecen a [AGENTS.md](../AGENTS.md): Nordra mantiene sus auroras cyan, azul y violeta; Bodas usa marfil y neutros cálidos; el tema claro es el predeterminado. Esta extracción no crea una paleta, escala tipográfica ni sistema de espaciado nuevo.

## Fuente y carga

[tokens.css](../src/site/styles/tokens.css) contiene las 56 declaraciones de rol de los 16 bloques que estaban en `scene.css`. Conserva sus selectores, condiciones de herencia y orden relativo. `scene.css` lo importa antes de todas sus reglas mediante `@import './tokens.css'`. Vite integra ambos en la misma hoja compilada de cada página; no hay un enlace CSS adicional en los HTML.

Los roles son:

| Variable | Uso existente |
| --- | --- |
| `--bg` | Fondo de la identidad |
| `--ink` | Texto principal y marcas de mayor contraste |
| `--muted` | Texto secundario |
| `--line` | Líneas y separadores; conservar el canal alfa |
| `--accent` | Acento de la identidad o sección |

## Paletas por identidad

Valores en el contenedor principal a anchura de escritorio. Los colores de ocho dígitos incluyen alfa; no deben sustituirse por un color opaco. Las excepciones móviles y de herencia se describen después.

| Identidad | Tema | `--bg` | `--ink` | `--muted` | `--line` | `--accent` |
| --- | --- | --- | --- | --- | --- | --- |
| Nordra general / Inicio | Claro | `#f6f9fc` | `#142a36` | `#586f7a` | `#25465c25` | `#22616f` |
| Nordra general / Inicio | Oscuro | `#081420` | `#f1f5fc` | `#a5bac9` | `#d8e8fc25` | `#a3d8e4` |
| Negocios | Claro | `#f6f9fc` | `#142a36` | `#586f7a` | `#25465c25` | `#22616f` |
| Negocios | Oscuro | `#081420` | `#f1f5fc` | `#a5bac9` | `#d8e8fc25` | `#a3d8e4` |
| Invitaciones | Claro | `#f6f9fc` | `#142a36` | `#586f7a` | `#25465c25` | `#6a587d` |
| Invitaciones | Oscuro | `#081420` | `#f1f5fc` | `#a5bac9` | `#d8e8fc25` | `#cebee7` |
| Bodas | Claro | `#fcfaf6` | `#655040` | `#756456` | `#ded2c2` | `#795e49` |
| Bodas | Oscuro | `#302820` | `#fff7eb` | `#dfd0bd` | `#8c786466` | `#ead4b8` |
| Cumpleaños | Claro | `#f6f5ff` | `#222951` | `#67677c` | `#4845bb25` | `#4845bb` |
| Cumpleaños | Oscuro | `#141326` | `#f1eeff` | `#c5bddb` | `#c5bddb44` | `#bdb2ff` |
| Eventos | Claro | `#f4f8f6` | `#193e3d` | `#58716d` | `#337b6c33` | `#337b6c` |
| Eventos | Oscuro | `#0e2424` | `#e6f4ed` | `#b5cfc7` | `#a6e4cf44` | `#a6e4cf` |
| Temporada | Claro | `#faf7f3`* | `#34313f` | `#716877` | `#71687730` | `#785587`* |
| Temporada | Oscuro | `#24202c`* | `#f6f1e9` | `#d1c8d2` | `#d1c8d240` | `#dec1ec`* |
| Estudio | Claro | `#f6f9fc` | `#142a36` | `#586f7a` | `#25465c25` | `#22616f` |
| Estudio | Oscuro | `#081420` | `#f1f5fc` | `#a5bac9` | `#d8e8fc25` | `#a3d8e4` |

Negocios y Estudio heredan la paleta general: no se añadieron bloques por identidad que antes no existían. En Invitaciones, `body` también conserva la paleta general; únicamente `.invitations` tiene los acentos `#6a587d` / `#cebee7` de la tabla.

Los valores de Temporada marcados con * son respaldos. Se conservan literalmente `var(--seasonal-bg,#faf7f3)` y `var(--seasonal-accent,#785587)` en claro, y `var(--seasonal-bg,#24202c)` y `var(--seasonal-accent,#dec1ec)` en oscuro. `seasonal-flow.js` puede proporcionar los valores dinámicos: no se movieron ni sustituyeron esas asignaciones.

## Cascada que debe conservarse

- `.occasion-page.invitations` conserva `--accent: inherit` después de los acentos generales de Invitaciones. Así las páginas de ocasión reciben su identidad desde `body`.
- Los acentos oscuros `.dark .theme-wedding`, `.dark .theme-birthday` y `.dark .theme-gathering` permanecen después de esa regla de herencia, con `#ead4b8`, `#bdb2ff` y `#a6e4cf`, respectivamente. Por eso los comentarios de algunas identidades aparecen en más de un punto de `tokens.css`.
- Dos ajustes de contraste permanecen en `nordra-theatre.css`, dentro de `@media(max-width:700px)`, en su posición posterior a `scene.css`. No se centralizan alterando la precedencia entre hojas:

| Selector móvil | Variable | Valor |
| --- | --- | --- |
| `.dark` | `--muted` | `#bdcbd5` |
| `body.dark[data-scene=bodas]` | `--muted` | `#ddd0be` |

El primero sustituye al `--muted` general de Inicio, Negocios, Invitaciones y Estudio. Las reglas de identidad de Cumpleaños, Eventos y Temporada tienen mayor especificidad y conservan su propio `--muted`. En Bodas actúa la segunda regla móvil. No se cambia ningún valor para resolver diferencias de cascada: debe preservarse el orden que ya producía el resultado publicado.

## Variables que siguen junto a sus componentes

`--case-accent`, `--case-tint`, `--case-one`, `--case-two` y `--case-three` describen las composiciones BRUMA y Lúmina (`.design-case`, `.case-bruma`, `.case-lumina`). Sus variantes oscuras siguen en `scene.css`: son paletas locales del componente, no roles generales de Negocios o Temporada.

`--paper`, `--paper-shade`, `--path-open`, `--paper-open`, `--paper-fade`, `--travel-*`, `--assembly*`, `--thaw`, `--frost-alpha` y `--navigation-height` siguen junto a sus materiales, geometría y comportamiento. No se mueven a esta hoja de roles. Tampoco se sustituyen colores hex aislados, tipografías, tamaños, espaciados o movimientos.

## Uso y protección

Usar los roles existentes cuando el elemento realmente deba heredar la identidad; no reemplazar automáticamente cualquier hex por el rol visualmente más cercano. Las paletas de React en `src/styles`, las invitaciones públicas y los renderers de aurora quedan fuera de esta consolidación.

[design-tokens.json](../scripts/fixtures/design-tokens.json) se generó antes de la extracción desde `e186741`. Registra selectores, orden, valores exactos, herencia, `!important` y condiciones de los ajustes móviles conservados. [design-tokens.test.mjs](../scripts/design-tokens.test.mjs) analiza CSS con PostCSS, ya instalado por Vite, sin navegador ni dependencias nuevas.

La prueba entra automáticamente en `npm test` mediante `scripts/*.test.mjs`. Detecta cambios de paleta sin referencia actualizada, definiciones fuera de su ubicación y un orden de importación incorrecto. Una regla independiente mantiene explícitas las paletas de Bodas y comprueba sus neutros cálidos (`R >= G >= B`), incluida la variante móvil: introducir azul o violeta falla aunque se actualice el JSON. Las pruebas negativas ejercitan ambos casos.

Actualizar la referencia requiere revisar el cambio de diseño conforme a [AGENTS.md](../AGENTS.md); regenerarla para ocultar un fallo no constituye validación. Cualquier extracción posterior debe comparar valores calculados en `body`, contenedores y secciones, claro/oscuro y móvil/escritorio, además de capturas y navegación con tema conservado.
