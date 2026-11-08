/* Invitaciones · light on the plan cards, the Aurora/Boreal slider, the guest journey and client work.
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

if (root?.querySelector('.invite-offers')) {
  const start = () => {
    glow();
    window.NordraCarousel?.positions(root.querySelector('.journey-stack'), document.documentElement.lang==='en'?'Guest journey position':'Posición en el recorrido');
  };
  'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200);
}
