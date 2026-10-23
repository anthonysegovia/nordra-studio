/* Shared document navigation: preserve real links, history and native gestures. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const nativeTransitions = 'onpageswap' in window && 'onpagereveal' in window;
  const routes = new Set(['/', '/negocios.html', '/invitaciones.html',
    ...['cafe-nordra', 'lumina', 'boda-jardin', 'halloween', 'halloween-mansion', 'posada', 'celebra-2027'].map(name => `/demos/${name}/`)]);
  const canonicalPath = path => path.replace(/\/index\.html$/, '/');
  // Language variants belong to the public demo; payment/admin URLs do not.
  const publicPage = url => routes.has(canonicalPath(url.pathname)) &&
    [...url.searchParams].every(([key, value]) => key === 'lang' && ['es', 'en'].includes(value));
  const current = new URL(location.href);
  let departure = 0;

  addEventListener('pagereveal', event => {
    if (event.viewTransition) root.dataset.nativeArrival = 'true';
  });
  addEventListener('pageshow', event => {
    clearTimeout(departure);
    departure = 0;
    delete root.dataset.journeyLeaving;
    document.querySelector('[data-journey-selected]')?.removeAttribute('data-journey-selected');
    if (event.persisted) root.dataset.nativeArrival = 'true';
  });
  addEventListener('pagehide', () => clearTimeout(departure));

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || !publicPage(target) || !publicPage(current) ||
      (canonicalPath(target.pathname) === canonicalPath(current.pathname) && target.search === current.search)) return;
    if (reduce.matches) return;
    link.setAttribute('data-journey-selected', '');
    if (nativeTransitions) return;

    // Browsers without cross-document transitions get the same quiet departure.
    event.preventDefault();
    if (departure) return;
    root.dataset.journeyLeaving = 'true';
    departure = setTimeout(() => location.assign(target.href), 220);
  });
})();
