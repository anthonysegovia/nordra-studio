import { invitation } from './config.mjs';
const e = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const ratios = {
  'registro-impreso-v2': 2 / 3,
  'cordon-tejido-v2': 1 / 3,
  'programa-html': 4 / 3,
  'abanico-html': 1,
  'cafe-v2': 1,
  'frente-html': 1.5,
  'reverso-live': 1.5,
  'acceso-html': 1046 / 700,
  'boleto-html': 400 / 1440,
  'boleto-si-html': 400 / 1440,
};
const art = (name, cls = '', small = 780, large = 1536, immediate = false) =>
  `<img class="${cls}" width="${small}" height="${Math.round(small * ratios[name])}" ${immediate ? '' : 'loading="lazy" decoding="async"'} src="/artwork/event-gafete/${name}-${small}.webp" srcset="/artwork/event-gafete/${name}-${small}.webp ${small}w, /artwork/event-gafete/${name}-${large}.webp ${large}w" sizes="(max-width:700px) 390px, 800px" alt="">`;
const light = '<div class="light-field" aria-hidden="true"></div>';
const cord = (cls) => art('cordon-tejido-v2', 'woven ' + cls);
export function scene(c = invitation) {
  const p = c.copy;
  const date = c.date.split('-').reverse().join(' · ');
  const turn = (
    art('frente-html', 'front-print', 480, 960) +
    art('reverso-live', 'front-cord', 480, 960)
  ).replaceAll(' src', ' data-src');
  return `<div class="celebration-entrance" tabindex="-1" aria-labelledby="cover-title">
<div class="cover table">
<div class="cover-copy">
<p class="pretitle">${e(p.sender)}</p>
<h1 id="cover-title">${e(p.title).replace(' ya ', '<br> ya ')}</h1>
</div>
<div class="flip-stage">
<button class="badge-back" type="button" data-open aria-label="${e(p.openLabel)}">${art('reverso-live', 'back-face', 480, 960, true)}<span class="front-face">${turn}<span class="turn-brand">${e(c.name)}</span>
<span class="turn-data-v2">
<span>${e(date)}</span>
<strong data-turn-name>Tu nombre aquí</strong>
<span>Asistente</span>
</span>
</span>
<span class="edge-glint" aria-hidden="true">
</span>
</button>
</div>
<div class="cover-hint">${e(p.hint)}<svg class="curved-arrow" viewBox="0 0 100 80" aria-hidden="true">
<path d="M5 10C80 0 85 38 42 66m0 0 1-16m-1 16 18-4" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
</div>
<div class="opening-copy">
<p>${e(c.name)}</p>
<p>${e(c.line)}</p>
</div>
<button class="skip" type="button" data-skip>${e(p.skip)}</button>
</div>
</div>
<main class="celebration-content" hidden inert>
<div class="material-interior">
<header class="scene-intro">${light}<div class="celebration-header" hidden inert>
<nav class="ribbon-menu" aria-label="Invitación">
<a href="#cuando">Fecha</a>
<a href="#agenda">Agenda</a>
<a href="#detalles">Detalles</a>
<a href="#confirmacion">Mi acceso</a>
</nav>
</div>
<h1 id="bienvenida" tabindex="-1">${e(c.name)}</h1>
<p>${e(c.line)}</p>
</header>
<section id="cuando" class="registration-v2" tabindex="-1">${light}${cord('registration-cord')}<h2>${e(p.when).replace(': ', ':<br> ')}</h2>
<div class="register-paper reveal">${art('registro-impreso-v2')}<span class="sr-only">Registro</span>
<div class="register-data">
<p class="hour-v2">${e(c.hour)}</p>
<p class="venue-v2">${e(c.place)} · ${e(c.city)}</p>
<p class="countdown-v2" data-clock>
</p>
<div class="register-links">
<a href="${e(c.calendar)}" download>${e(p.calendar)}</a>
<a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(c.city)}" target="_blank" rel="noopener noreferrer">${e(p.location)}</a>
</div>
</div>
</div>
</section>
<section id="agenda" class="agenda-v2" tabindex="-1">${light}${cord('agenda-cord')}<h2>${e(p.program).replace(' el ', '<br> el ')}</h2>
<div class="program-paper reveal">${art('programa-html')}<ol class="program-ink">${c.agenda
    .map(
      ([time, title, description]) => `<li>
<time>${e(time)}</time>
<h3>${e(title)}</h3>
<p>${e(description)}</p>
</li>`,
    )
    .join('')}</ol>
</div>${art('cafe-v2', 'coffee-prop')}</section>
<section id="detalles" class="details-v2" tabindex="-1">${light}${cord('details-cord')}<h2>${e(p.details)}</h2>
<div class="printed-fan reveal" role="group" aria-label="Antes de llegar">${art('abanico-html')} ${c.cards.map((text, i) => `<button class="fan-card fan-${i}" type="button" data-card="${i}" aria-pressed="false">${e(text).replace('Trae tarjetas: vas a querer intercambiarlas', 'Trae<br>tarjetas:<br>vas a querer<br>intercambiarlas')}</button>`).join('')}<p class="sr-only" data-card-status role="status" aria-live="polite">
</p>
</div>
</section>
<section id="confirmacion" class="access-v2 confirmation" tabindex="-1">${light}${cord('access-cord')}<h2>${e(p.access)}</h2>
<form class="celebration-rsvp" data-saved="${e(p.saved)}" data-yes-message="${e(p.yesMessage)}" data-no-message="${e(p.noMessage)}">
<div class="personal-fields" hidden>
<label for="guest">${e(p.guest)}</label>
<input id="guest" name="guest" maxlength="100" autocomplete="name">
</div>
<div class="access-object reveal">${art('acceso-html', 'access-art', 700, 1400)}<p class="access-brand">${e(c.name)}</p>
<p class="access-date">${e(date)}</p>
<div class="guest-data" data-admission>${e(p.publicPass)}</div>
<p class="access-question">${e(p.question)}</p>
<a class="qr-wrap" hidden>
<img class="access-qr" width="360" height="360" alt="Pase QR">
<span class="access-caption">${e(p.qr)}</span>
</a>
<fieldset class="ticket-tabs">
<legend class="sr-only">${e(p.question)}</legend>${[
    ['yes', p.yes],
    ['no', p.no],
  ]
    .map(
      ([value, text]) => `<label class="ticket-${value}">
<input type="radio" name="attendance" value="${value}" required>
<span class="ticket-surface">${art(value === 'yes' ? 'boleto-si-html' : 'boleto-html', '', 400, 800)}<span class="ticket-word">${e(text)}</span>
<span class="punch-hole" aria-hidden="true">
</span>
</span>
</label>`,
    )
    .join('')}</fieldset>
<span class="punched-disc" aria-hidden="true">
</span>
</div>
<button class="save" type="submit" hidden>${e(p.save)}</button>
<div class="response-copy">
<p class="sample-notice">${e(p.sample)}</p>
<p class="local-note sr-only">
</p>
<p data-rsvp-status class="status-v2" role="status" tabindex="-1">
</p>
</div>
</form>
<button class="back-to-cover" data-cover type="button" aria-label="Volver a la portada">${e(c.name)}</button>
</section>
</div>
</main>
<noscript>
<p class="no-script">Activa JavaScript para abrir esta invitación. <a href="/invitaciones">Ver invitaciones</a>
</p>
</noscript>`;
}
export function renderGafete(html, c = invitation) {
  if (!html.includes('{{gafete:body}}')) return html;
  return html
    .replace('{{gafete:body}}', scene(c))
    .replaceAll('{{gafete:name}}', e(c.name))
    .replaceAll('{{gafete:ink}}', e(c.palette.ink))
    .replaceAll('{{gafete:accent}}', e(c.palette.accent));
}
