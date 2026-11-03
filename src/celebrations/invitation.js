import { sampleGuestAccess } from '../lib/weddingSampleGuest';
import { entranceVisibility, initialTheme } from './entrance.mjs';
import { showReturnToSite } from '../site/return-to-site.js';

const entrance = document.querySelector('.celebration-entrance');
const menu = document.querySelector('.celebration-header');
const content = document.querySelector('.celebration-content');
const openButton = document.querySelector('[data-open]');
const skipButton = document.querySelector('[data-skip]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const openingDuration = 700;
let phase = 'closed', timer;
const sections = new Set(['bienvenida', 'detalles', 'agenda', 'vestimenta', 'confirmacion']);
const requestedSection = location.hash.slice(1);

function syncTheme() {
  try { document.documentElement.dataset.theme = initialTheme(localStorage); }
  catch { document.documentElement.dataset.theme = 'light'; }
}
syncTheme();
addEventListener('storage', event => { if (!event.key || event.key === 'nordra-theme') syncTheme(); });

function render() {
  const visibility = entranceVisibility(phase);
  entrance.hidden = visibility.entranceHidden;
  entrance.inert = visibility.entranceHidden;
  content.hidden = visibility.contentHidden;
  content.inert = visibility.contentHidden;
  menu.hidden = visibility.menuHidden;
  menu.inert = visibility.menuHidden;
  document.body.dataset.phase = phase;
  entrance.setAttribute('aria-busy', String(phase === 'opening'));
  openButton.disabled = phase === 'opening';
}

function goTo(id) {
  if (phase !== 'open' || !sections.has(id)) return;
  const section = document.getElementById(id);
  section.scrollIntoView({ behavior: reduce.matches ? 'instant' : 'smooth', block: 'start' });
  section.focus({ preventScroll: true });
}

function finishOpening() {
  clearTimeout(timer);
  if (phase === 'open') return;
  phase = 'open'; render();
  goTo(sections.has(requestedSection) ? requestedSection : 'bienvenida');
}

openButton.addEventListener('click', () => {
  if (phase !== 'closed') return;
  if (reduce.matches) { finishOpening(); return; }
  phase = 'opening'; render();
  // Skip remains reachable by keyboard while the opening runs.
  skipButton.focus({ preventScroll: true });
  timer = setTimeout(finishOpening, openingDuration);
});
skipButton.addEventListener('click', finishOpening);
reduce.addEventListener('change', () => { if (reduce.matches && phase === 'opening') finishOpening(); });
document.querySelector('[data-cover]').addEventListener('click', () => {
  clearTimeout(timer); phase = 'closed'; render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  entrance.scrollTop = 0;
  openButton.focus({ preventScroll: true });
});
menu.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); goTo(link.hash.slice(1));
}));
entrance.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); finishOpening(); return; }
  if (event.key !== 'Tab') return;
  const controls = [openButton, skipButton].filter(button => !button.disabled);
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && (document.activeElement === first || document.activeElement === entrance)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || document.activeElement === entrance)) { event.preventDefault(); first.focus(); }
});

// The public preview stays local. Only a personal capability enables cloud replies.
const form = document.querySelector('.celebration-rsvp');
const status = document.querySelector('[data-rsvp-status]');
const access = sampleGuestAccess(location.hash);
if (access) {
  form.querySelector('[type=submit]').disabled=true;
  import('./personal-rsvp.js').then(({personalRsvp})=>personalRsvp(form,status,access,
    document.documentElement.dataset.invitation==='conexion'?'event':'birthday'));
} else form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = form.elements.namedItem('guest').value.trim();
  if (!name) { form.elements.namedItem('guest').focus(); return; }
  const attending = form.elements.namedItem('attendance').value === 'yes';
  status.textContent = `${name}, ${attending ? 'así se vería tu confirmación' : 'así se vería tu respuesta'}. Es una muestra: no se ha enviado ni guardado ninguna respuesta.`;
  status.focus({ preventScroll: true });
});
form.addEventListener('input', () => { status.textContent = ''; });
render();
// Initial focus stays on the cover even when the URL points to confirmation.
entrance.focus({ preventScroll: true });
addEventListener('pagehide', () => clearTimeout(timer), { once: true });

// A restored page must not remain in a transition whose timer was cancelled.
addEventListener('pageshow', () => { if (phase === 'opening') finishOpening(); });
showReturnToSite();
