/* Invitaciones · light on the plan cards, the Aurora/Boreal slider, the guest journey and the next season.
   Starts once the page is idle; without JavaScript every section is already readable. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => reduced.matches || document.body.dataset.journeyMotion === 'paused';
const root = document.querySelector('[data-view="invitaciones"]:not([hidden])');

function glow() {
  // Boreal's slow orbit repaints every frame, so it only runs while the card is on screen.
  const featured = root.querySelector('.invite-featured');
  if (featured) new IntersectionObserver(([entry]) => featured.toggleAttribute('data-orbit', entry.isIntersecting && !still())).observe(featured);
  // Border Glow: the warm edge turns toward the pointer.
  root.querySelectorAll('.invite-card').forEach(card => {
    const light = card.querySelector('.invite-light');
    card.addEventListener('pointermove', event => {
      if (still() || card.classList.contains('invite-featured')) return;
      const box = card.getBoundingClientRect();
      const angle = Math.atan2(event.clientY - box.top - box.height / 2, event.clientX - box.left - box.width / 2) * 180 / Math.PI + 90;
      light.style.setProperty('--glow-angle', `${angle - 60}deg`);
    });
  });
}

function season() {
  // The page is built ahead of time; the visitor's date decides which season is next.
  // Same rule as upcomingSeason() in src/data/invitationPricing.ts, read from the windows the build wrote.
  const cards = [...root.querySelectorAll('.season-card')];
  if (!cards.length) return;
  const now = new Date(), day = (now.getMonth() + 1) * 100 + now.getDate();
  const md = value => { const [m, d] = value.split('-').map(Number); return m * 100 + d; };
  const next = cards.find(c => day >= md(c.dataset.seasonFrom) && day <= md(c.dataset.seasonTo)) ?? cards.find(c => md(c.dataset.seasonFrom) > day) ?? cards[0];
  cards.forEach(card => card.toggleAttribute('data-season-current', card === next));
  // On a phone the seasons are a swipeable row: start it at the next season.
  const fan = next.parentElement;
  if (fan.scrollWidth > fan.clientWidth) fan.scrollLeft = next.offsetLeft - (fan.clientWidth - next.offsetWidth) / 2;
}

if (root?.querySelector('.invite-offers')) {
  const start = () => {
    glow(); season();
    window.NordraCarousel?.positions(root.querySelector('.journey-stack'), document.documentElement.lang==='en'?'Guest journey position':'Posición en el recorrido');
    window.NordraCarousel?.positions(root.querySelector('.season-fan'), document.documentElement.lang==='en'?'Season position':'Posición en las temporadas');
    window.NordraCarousel?.positions(root.querySelector('.client-case-grid'), document.documentElement.lang==='en'?'Client position':'Posición en los clientes', card => card.querySelector('h3').textContent.trim());
  };
  'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200);
}
