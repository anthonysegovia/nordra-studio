(() => {
  'use strict';
  const nav = document.querySelector('.mobile-nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  let active = -1;
  function update() {
    scheduled = false;
    const keyboard = document.activeElement?.matches('input, textarea') && window.visualViewport && visualViewport.height < window.innerHeight * .78;
    nav.dataset.keyboard = String(Boolean(keyboard));
    if (!document.documentElement.classList.contains('is-open')) return;
    let next = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= window.innerHeight * .36) next = index; });
    if (active === next) return;
    active = next;
    nav.style.setProperty('--nav-index', String(next));
    links.forEach((link, index) => index === next ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  nav.hidden = false;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('focusin', schedule); document.addEventListener('focusout', schedule);
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  update();
})();
