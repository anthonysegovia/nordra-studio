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

function compare() {
  const figure = root.querySelector('[data-compare]');
  const range = figure?.querySelector('.compare-range');
  if (!range) return;
  const set = value => {
    figure.style.setProperty('--split', `${value}%`);
    figure.toggleAttribute('data-split-low', value < 18);
    figure.toggleAttribute('data-split-high', value > 82);
    range.setAttribute('aria-valuetext', value <= 5 ? 'Solo Boreal' : value >= 95 ? 'Solo Aurora' : `${Math.round(value)}% Aurora, ${Math.round(100 - value)}% Boreal`);
  };
  range.hidden = false;
  range.addEventListener('input', () => set(+range.value));
  figure.addEventListener('pointermove', event => {
    const box = figure.getBoundingClientRect();
    figure.style.setProperty('--lx', `${(event.clientX - box.left) / box.width * 100}%`);
    figure.style.setProperty('--ly', `${(event.clientY - box.top) / box.height * 100}%`);
  });
  set(+range.value);
  // A single, gentle hint that the line moves, the first time the panel is in view.
  const hint = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    hint.disconnect();
    if (still() || range.matches(':active, :focus')) return;
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / 1600);
      if (range.matches(':active, :focus')) return;
      const value = 50 - Math.sin(t * Math.PI) * 16;
      range.value = value; set(value);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, { threshold: .6 });
  hint.observe(figure);
}

function journey() {
  // Stacked Cards Spread: the pile opens once it is in view.
  const stack = root.querySelector('[data-journey-stack]');
  if (!stack || still() || matchMedia('(max-width:700px)').matches) return;
  stack.setAttribute('data-stacked', '');
  const open = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    open.disconnect();
    setTimeout(() => stack.removeAttribute('data-stacked'), 180);
  }, { threshold: .45 });
  open.observe(stack);
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
    glow(); compare(); journey(); season();
    window.NordraCarousel?.positions(root.querySelector('.journey-stack'), 'Posición en el recorrido');
    window.NordraCarousel?.positions(root.querySelector('.season-fan'), 'Posición en las temporadas');
    window.NordraCarousel?.positions(root.querySelector('.invite-grid'), 'Posición en los planes', card => card.querySelector('h3').textContent.trim());
  };
  'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200);
}
