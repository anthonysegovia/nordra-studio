(() => {
  'use strict';
  const root = document.documentElement;
  const name = root.dataset.invitationNav || root.dataset.nordraDemo;
  const posada = { theme: 'pine', open: '#open-invitation', items: [['Inicio','#inicio','home'],['Detalles','#detalles','calendar'],['Plan','#plan','list'],['Lugar','#lugar','pin'],['Confirmar','#confirmar','check']] };
  const spooky = { theme: 'plum', open: '#open', items: [['Inicio','.hero','home'],['Tu pase','.guest-pass','ticket'],['Detalles','.details','calendar'],['Confirmar','.rsvp','check']] };
  const configurations = {
    'del-otro-lado': { theme: 'night', open: '#enter', items: [['Inicio','#inicio','home'],['Detalles','#detalles','calendar'],['La noche','.evening','list'],['Vestimenta','.dress','star'],['Confirmar','#respuesta','check']] },
    'boda-jardin': { theme: 'sand', open: '#skip', items: [['Inicio','.hero','home'],['Fecha','#fecha','calendar'],['El día','#celebracion','pin'],['Detalles','#detalles','list'],['Confirmar','#respuesta','check']] },
    'celebra-2027': { theme: 'gold', open: '#enter-button', items: [['Inicio','.hero','home'],['Detalles','.event-strip','calendar'],['Programa','.program-section','list'],['Confirmar','.rsvp-section','check']] },
    'halloween': spooky,
    'spooky-party': spooky,
    'halloween-mansion': { theme: 'forest', open: '#open', items: [['Inicio','.hero','home'],['Las velas','.light-ritual','star'],['Detalles','.ticket','calendar'],['La fiesta','.story','list'],['Confirmar','#confirmar','check']] },
    'posada': { theme: 'pine', open: '#open', items: [['Inicio','.hero','home'],['La fecha','.date-card','calendar'],['Programa','.program-section','list'],['Confirmar','.rsvp-section','check']] },
    'posada-pinata': posada, 'posada-luz': posada, 'posada-covadonga': posada,
  };
  const config = configurations[name];
  if (!config || document.querySelector('.nordra-invitation-nav')) return;
  const main = document.querySelector('main#invitation');
  if (!main) return;
  const entry = document.querySelector('.threshold, #gate, #entry');
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-11 5h2m3 0h2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="m8 12 3 3 5-6"/><circle cx="12" cy="12" r="9"/>',
    ticket: '<path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Z"/><path d="M16 7v3m0 6v3"/>',
    star: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  };
  const sections = config.items.map(([label, selector, icon], index) => {
    const element = main.querySelector(selector);
    if (!element) return null;
    if (!element.id) element.id = `nordra-${icon}-${index}`;
    return { label, element, icon };
  }).filter(Boolean);
  if (sections.length < 3) return;
  const nav = document.createElement('nav');
  nav.className = 'nordra-invitation-nav';
  nav.hidden = true;
  nav.dataset.theme = config.theme;
  nav.setAttribute('aria-label', 'Navegación de la invitación');
  nav.style.setProperty('--nav-count', sections.length);
  const marker = document.createElement('span'); marker.className = 'nordra-nav-marker'; marker.setAttribute('aria-hidden', 'true'); nav.append(marker);
  const links = sections.map(({ label, element, icon }) => {
    const link = document.createElement('a');
    link.href = `#${element.id}`;
    link.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[icon]}</svg><span>${label}</span>`;
    nav.append(link); return link;
  });
  document.body.append(nav);
  root.classList.add('nordra-nav-installed');
  let frame = 0, active = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isReady = () => (!entry || entry.hidden) && !main.hidden && !main.inert && !document.body.classList.contains('is-sealed') && (!root.classList.contains('has-entry') || root.classList.contains('is-open'));
  const isVisible = element => !element.hidden && !element.closest('[hidden]') && getComputedStyle(element).display !== 'none';
  function setActive(index) {
    if (index === active) return;
    active = index; nav.style.setProperty('--nav-index', index);
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  }
  function visit(index) {
    const section = sections[index].element;
    document.dispatchEvent(new CustomEvent('nordra:before-navigate', { detail: { target: section } }));
    if (!isVisible(section)) return;
    const paused = root.dataset.motion === 'paused' || root.classList.contains('motion-paused');
    section.scrollIntoView({ behavior: reduced.matches || paused ? 'instant' : 'smooth', block: 'start' });
    setActive(index);
    const focus = section.querySelector('h1,h2,h3') || section;
    if (!focus.hasAttribute('tabindex')) focus.tabIndex = -1;
    focus.focus({ preventScroll: true });
  }
  function update() {
    frame = 0;
    const keyboard = document.activeElement?.matches('input,textarea,select') && window.visualViewport && visualViewport.height < innerHeight * .78;
    nav.dataset.keyboard = String(Boolean(keyboard));
    const ready = isReady();
    nav.hidden = !ready;
    root.classList.toggle('nordra-nav-open', ready);
    if (!ready) { setActive(0); return; }
    let current = 0;
    sections.forEach(({element}, i) => { if (isVisible(element) && element.getBoundingClientRect().top <= innerHeight * .32) current = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 8) current = sections.length - 1;
    setActive(current);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    // Keep existing private invitation fragments (such as RSVP edit tokens) intact.
    if (isReady()) visit(index);
  }));
  new MutationObserver(schedule).observe(main, { attributes: true, attributeFilter: ['hidden','inert','class'] });
  if (entry) new MutationObserver(schedule).observe(entry, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule, { passive: true });
  document.addEventListener('focusin', schedule); document.addEventListener('focusout', schedule);
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  update();
})();
