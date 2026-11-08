// El HTML y su espacio reservado se pintan antes de descargar Three.
export function loadHero(load) {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const still = new URLSearchParams(location.search).has('quieto') || reduced.matches || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  hero.classList.toggle('hero-still', !!still);
  hero.classList.add('go');
  const run = () => load().then(() => { hero.dataset.loaded = 'true'; }).catch(error => {
    console.warn('No se pudo iniciar el hero 3D', error);
    hero.classList.add('hero-fallback');
    hero.querySelector('canvas')?.remove();
    hero.querySelectorAll('#pause,#replay').forEach(button => { button.hidden = true; });
  });
  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
    else setTimeout(run, 300);
  }));
  if (document.readyState === 'complete') schedule();
  else addEventListener('load', schedule, { once: true });
}
