import { invitation } from './config.mjs';
import { countdown } from './clock.mjs';
import { opening } from './opening';
import { sampleGuestAccess } from '../../lib/weddingSampleGuest';
import { showReturnToSite } from '../../site/return-to-site';
try {
  document.documentElement.dataset.theme =
    localStorage.getItem('nordra-theme') === 'dark' ? 'dark' : 'light';
} catch {}
opening();
showReturnToSite();
const reduce = matchMedia('(prefers-reduced-motion: reduce)'),
  clock = document.querySelector('[data-clock]');
function tick() {
  clock.replaceChildren(
    ...countdown(invitation)
      .split(/(\d+)/)
      .map((p, i) => {
        if (!(i % 2)) return document.createTextNode(p);
        const n = document.createElement('strong');
        n.textContent = p;
        return n;
      }),
  );
}
tick();
let timer;
function syncClock() {
  clearInterval(timer);
  if (!document.hidden) {
    tick();
    timer = setInterval(tick, 30000);
  }
}
syncClock();
document.addEventListener('visibilitychange', syncClock);
addEventListener('pagehide', () => clearInterval(timer));
const observer = new IntersectionObserver(
  (entries) => {
    for (const item of entries)
      if (item.isIntersecting) {
        item.target.classList.add('arrived');
        // Observe the section, not a cord whose initial clip has zero area.
        item.target.querySelectorAll(':scope > .woven').forEach((cord) => {
          cord.classList.add('arrived');
        });
        observer.unobserve(item.target);
      }
  },
  { threshold: 0.08 },
);
document
  .querySelectorAll('.reveal,.material-interior > section')
  .forEach((el) => observer.observe(el));
const cards = [...document.querySelectorAll('[data-card]')];
function selectCard(i, focus = false) {
  cards.forEach((c, n) => {
    c.setAttribute('aria-pressed', String(n === i));
    c.classList.toggle('front', n === i);
  });
  document.querySelector('[data-card-status]').textContent =
    invitation.cards[i];
  if (focus) cards[i].focus();
}
cards.forEach((c, i) => {
  c.addEventListener('click', () => selectCard(i));
  c.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      selectCard(
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? cards.length - 1
            : (i + (e.key === 'ArrowRight' ? 1 : cards.length - 1)) %
              cards.length,
        true,
      );
    }
  });
});
const form = document.querySelector('.celebration-rsvp'),
  status = document.querySelector('[data-rsvp-status]'),
  object = document.querySelector('.access-object'),
  admission = document.querySelector('[data-admission]'),
  qr = document.querySelector('.qr-wrap'),
  access = sampleGuestAccess(location.hash);
let flashed = false,
  qrVersion = 0,
  answer = 'pending';
function stamp(value, flash) {
  answer = value;
  object.dataset.answer = value;
  object.classList.toggle('accepted', value === 'yes');
  object.classList.remove('punching');
  if (flash && !reduce.matches) {
    void object.offsetWidth;
    object.classList.add('punching');
    setTimeout(() => object.classList.remove('punching'), 320);
  }
  if (value !== 'yes') {
    qr.hidden = true;
    qrVersion++;
  }
}
async function updateQr() {
  const pass = [...form.children].find((e) => e.tagName === 'A');
  const version = ++qrVersion;
  if (!access || answer !== 'yes' || !pass || pass.hidden || !pass.href) {
    qr.hidden = true;
    return;
  }
  try {
    const { default: QRCode } = await import('qrcode');
    const image = await QRCode.toDataURL(pass.href, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#123044', light: '#ffffff' },
    });
    if (version !== qrVersion) return;
    qr.href = pass.href;
    qr.querySelector('img').src = image;
    qr.hidden = false;
    if (!flashed) {
      flashed = true;
      object.classList.add('qr-flash');
      setTimeout(() => object.classList.remove('qr-flash'), 650);
    }
  } catch {
    qr.hidden = true;
  }
}
if (access) {
  document.body.classList.add('personal');
  Object.assign(form.dataset, {
    personalNotice: invitation.copy.personalNotice,
    save: invitation.copy.save,
    saved: invitation.copy.saved,
    yesMessage: invitation.copy.yesMessage,
    noMessage: invitation.copy.noMessage,
    companion: 'Acompañante',
    qr: invitation.copy.qr,
  });
  form.querySelector('.personal-fields').hidden = false;
  form.querySelector('.save').hidden = false;
  form.querySelector('.save').disabled = true;
  form.addEventListener('pass-person', ({ detail: p }) => {
    admission.replaceChildren();
    const line = document.createElement('span');
    line.textContent = 'Admite a ' + p.name;
    const seats = document.createElement('span');
    seats.className = 'guest-seats';
    seats.textContent = p.seats + ' ' + (p.seats === 1 ? 'lugar' : 'lugares');
    admission.append(line, seats);
    document.querySelector('[data-turn-name]').textContent = p.name;
    stamp(p.attendance, false);
    queueMicrotask(updateQr);
  });
  form.addEventListener('pass-response', ({ detail: p }) => {
    stamp(p.attendance, true);
    queueMicrotask(updateQr);
  });
  form.addEventListener('pass-unavailable', () => {
    form.querySelector('.ticket-tabs').disabled = true;
    qr.hidden = true;
  });
  import('../personal-rsvp.js')
    .then(async ({ personalRsvp }) => {
      const pending = personalRsvp(form, status, access, 'event');
      const picker = form.querySelector('select');
      if (picker) {
        const fields = form.querySelector('.personal-fields');
        const ribbon = document.createElement('div');
        ribbon.className = 'picker-ribbon';
        ribbon.append(picker);
        fields.prepend(ribbon);
        fields.prepend(form.querySelector('.sample-notice'));
        picker.addEventListener('pointerdown', () =>
          ribbon.classList.add('picker-open'),
        );
        picker.addEventListener('keydown', (e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key))
            ribbon.classList.add('picker-open');
        });
        for (const event of ['change', 'blur'])
          picker.addEventListener(event, () =>
            ribbon.classList.remove('picker-open'),
          );
      }
      await pending;
    })
    .catch(() => {
      status.textContent = 'No pudimos cargar tu invitación';
      form.querySelector('.ticket-tabs').disabled = true;
    });
} else {
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', () => {
    const value = form.elements.attendance.value;
    stamp(value, true);
    status.textContent =
      value === 'yes' ? invitation.copy.yesMessage : invitation.copy.noMessage;
  });
}
// Radio state previews the selected ticket; a personal answer is saved only on submit.
if (access)
  form.addEventListener('change', (e) => {
    if (e.target.name === 'attendance') {
      stamp(form.elements.attendance.value, true);
      qr.hidden = true;
    }
  });
