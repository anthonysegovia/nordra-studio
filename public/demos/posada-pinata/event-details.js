(() => {
  'use strict';
  const form = document.querySelector('#rsvp-form');
  const fields = form.querySelector('.rsvp-fields');
  const submit = form.querySelector('.rsvp-submit');
  const name = form.elements.name;
  const feedback = form.querySelector('.rsvp-feedback');
  const status = document.querySelector('#rsvp-status');
  const receipt = document.querySelector('.rsvp-receipt');
  const letter = document.querySelector('.rsvp-letter');
  const motion = window.PosadaMotion;
  // Demo-only storage. Never use the real event's API or storage key here.
  const storageKey = 'nordra-demo-posada-pinata-rsvp-2026';
  const validName = value => typeof value === 'string' && value.length >= 2 && value.length <= 100 && !/[\p{Cc}\p{Cf}<>]/u.test(value);
  const valid = value => value?.version === 1 && validName(value.name) && ['yes', 'no'].includes(value.attendance);
  let saved;
  let busy = false;
  let persisted = false;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); if (!valid(saved)) saved = undefined; else persisted = true; } catch { /* Demo remains usable without storage. */ }

  function message(text) {
    status.textContent = text;
    feedback.dataset.visible = String(Boolean(text));
    if (text) motion?.run(status, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }]);
  }
  function fillReceipt() {
    document.querySelector('#receipt-title').textContent = saved.attendance === 'yes' ? 'Así se confirma' : 'Gracias por avisar';
    document.querySelector('#receipt-copy').textContent = saved.name + ', elegiste «' + (saved.attendance === 'yes' ? 'Sí, ahí estaré' : 'No podré ir') + '». ' + (persisted ? 'Tu prueba quedó guardada en este navegador.' : 'Tu prueba está disponible mientras mantengas esta página abierta; el navegador no permite guardarla.');
    submit.querySelector('span').textContent = 'Guardar cambios de prueba';
  }
  async function switchPanel(from, to) {
    const height = letter.getBoundingClientRect().height;
    const fade = motion?.run(from, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
    if (fade) await fade.finished.catch(() => {});
    from.hidden = true; to.hidden = false;
    motion?.run(letter, [{ height: height + 'px' }, { height: letter.getBoundingClientRect().height + 'px' }], { duration: 420 });
    motion?.run(to, [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450 });
  }
  name.addEventListener('input', () => { name.removeAttribute('aria-invalid'); message(''); });
  form.addEventListener('change', event => {
    if (event.target.name === 'attendance') { message(''); motion?.run(event.target.closest('label'), [{ opacity: .7 }, { opacity: 1 }]); }
  });
  submit.disabled = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const guestName = name.value.normalize('NFC').trim().replace(/\s+/gu, ' ');
    const attendance = new FormData(form).get('attendance');
    if (!validName(guestName)) {
      message('Escribe un nombre de ejemplo, de 2 a 100 caracteres.');
      name.setAttribute('aria-invalid', 'true'); name.focus(); return;
    }
    if (!['yes', 'no'].includes(attendance)) { message('Elige si podrás asistir.'); form.querySelector('input[name=attendance]').focus(); return; }
    busy = true; fields.disabled = true; form.setAttribute('aria-busy', 'true'); message('');
    try {
      // Editing always replaces this single demo response; it never adds guests.
      saved = { version: 1, name: guestName, attendance };
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); persisted = true; } catch { persisted = false; }
      name.value = guestName;
      fillReceipt();
      await switchPanel(form, receipt);
      receipt.focus({ preventScroll: true });
    } finally { busy = false; fields.disabled = false; form.removeAttribute('aria-busy'); }
  });
  document.querySelector('.rsvp-edit').addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try { message(''); await switchPanel(receipt, form); name.focus({ preventScroll: true }); }
    finally { busy = false; }
  });
  if (saved) {
    name.value = saved.name;
    form.querySelector('input[name=attendance][value=' + saved.attendance + ']').checked = true;
    fillReceipt(); form.hidden = true; receipt.hidden = false;
  }
  const map = document.querySelector('.map-panel iframe');
  map.addEventListener('load', () => motion?.run(map, [{ opacity: 0 }, { opacity: 1 }], { duration: 550 }));
})();
