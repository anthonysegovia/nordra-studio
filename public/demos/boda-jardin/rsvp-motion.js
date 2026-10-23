// The sample response stays local. Its form folds away as the reply card appears.
(() => {
  const dialog = document.querySelector('#dialog');
  const panels = dialog.querySelector('.rsvp-panels');
  const form = dialog.querySelector('#form');
  const confirmation = dialog.querySelector('#confirmation');
  const attendance = form.querySelector('#attendance');
  const guests = form.querySelector('#guests');
  const trigger = document.querySelector('#rsvp');
  const fields = new Map();
  let confirmed = false, revision = 0, animations = [];

  function cancelAnimations(freeze = false) {
    if (freeze && animations.length) {
      for (const element of [panels, form, confirmation]) {
        const style = getComputedStyle(element);
        if (element === panels) element.style.height = style.height;
        else { element.style.opacity = style.opacity; element.style.transform = style.transform; }
      }
    }
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function settle() {
    cancelAnimations();
    panels.style.height = ''; panels.classList.remove('is-changing');
    for (const [element, visible] of [[form, !confirmed], [confirmation, confirmed]]) {
      element.hidden = !visible; element.inert = !visible;
      element.setAttribute('aria-hidden', String(!visible));
      element.style.opacity = ''; element.style.transform = '';
    }
  }
  function syncGuests() {
    guests.disabled = attendance.value === 'no';
    form.querySelector('.guest-field').classList.toggle('is-unavailable', guests.disabled);
  }
  function settleFields() {
    fields.forEach(animation => animation.cancel()); fields.clear();
  }
  function animateField(field) {
    fields.get(field)?.cancel();
    if (!weddingMotionAllowed() || !field.animate) return;
    const animation = field.animate([
      {opacity: .65, transform: 'translateY(2px)'},
      {opacity: 1, transform: 'none'}
    ], {duration: 360, easing: 'cubic-bezier(.22,1,.36,1)'});
    fields.set(field, animation);
    animation.finished.catch(() => {}).finally(() => { if (fields.get(field) === animation) fields.delete(field); });
  }
  trigger.addEventListener('click', () => {
    ++revision; confirmed = false; settle(); settleFields();
    form.reset(); syncGuests(); dialog.showModal();
  });
  dialog.querySelector('#close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    ++revision; cancelAnimations(true); settleFields();
    trigger.focus({preventScroll: true});
  });
  attendance.addEventListener('change', syncGuests);
  [attendance, guests].forEach(field => field.addEventListener('change', () => animateField(field)));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (confirmed) return;
    confirmed = true;
    const currentRevision = ++revision;
    const start = panels.getBoundingClientRect().height;
    const attending = attendance.value === 'yes';
    dialog.querySelector('#result').textContent = attending ? '¡Qué alegría!' : 'Gracias';
    dialog.querySelector('#result-detail').textContent = attending
      ? `${guests.value} ${guests.value === '1' ? 'lugar de muestra.' : 'lugares de muestra.'}`
      : 'por hacérnoslo saber.';
    form.inert = true; form.setAttribute('aria-hidden', 'true');
    confirmation.hidden = false; confirmation.inert = false; confirmation.setAttribute('aria-hidden', 'false');
    confirmation.tabIndex = -1;
    if (!weddingMotionAllowed() || !panels.animate) { settle(); confirmation.focus({preventScroll:true}); return; }
    const end = confirmation.getBoundingClientRect().height + 8;
    panels.style.height = `${start}px`; panels.classList.add('is-changing');
    animations = [
      panels.animate([{height:`${start}px`},{height:`${end}px`}], {duration:530,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'}),
      form.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-3px)'}], {duration:160,easing:'ease-out',fill:'both'}),
      confirmation.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}], {duration:440,delay:90,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
    ];
    confirmation.focus({preventScroll:true});
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (revision === currentRevision && dialog.open) settle();
    }).catch(() => {});
  });
  document.addEventListener('wedding:motionchange', () => { if (!weddingMotionAllowed()) { ++revision; settle(); settleFields(); } });
  if ('ResizeObserver' in window) {
    let width;
    new ResizeObserver(entries => {
      const next = entries[0].contentRect.width;
      if (width !== undefined && Math.abs(next - width) > .5 && animations.length) { ++revision; settle(); }
      width = next;
    }).observe(panels);
  }
  settle(); syncGuests();
})();
