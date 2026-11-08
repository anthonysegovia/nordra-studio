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
  // Escritorio: el 3D empieza a descargarse de inmediato, sin esperar a que terminen las imágenes.
  // Teléfono: primero se pinta el texto y el póster; el 3D arranca en cuanto el navegador queda libre.
  if (!matchMedia('(max-width:860px)').matches) { run(); return; }
  const schedule = () => requestAnimationFrame(() => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 600 });
    else setTimeout(run, 150);
  });
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
}
