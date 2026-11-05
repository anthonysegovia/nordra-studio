export function opening() {
  const entrance = document.querySelector('.celebration-entrance'),
    content = document.querySelector('.celebration-content'),
    menu = document.querySelector('.celebration-header'),
    button = document.querySelector('[data-open]'),
    skip = document.querySelector('[data-skip]'),
    reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 'closed',
    timer;
  const requested = location.hash.slice(1);
  const sections = new Set(
    ['bienvenida', ...content.querySelectorAll('section[id]')].map((s) =>
      typeof s === 'string' ? s : s.id,
    ),
  );
  // Native fragment navigation runs after module initialization and can move
  // focus into hidden content. Preserve the URL without invoking that jump.
  if (sections.has(requested)) {
    const url = location.href;
    history.replaceState(
      history.state,
      '',
      location.pathname + location.search,
    );
    const restore = () =>
      setTimeout(() => {
        history.replaceState(history.state, '', url);
        if (phase === 'closed') entrance.focus({ preventScroll: true });
      }, 0);
    if (document.readyState === 'complete') restore();
    else addEventListener('load', restore, { once: true });
  }
  function front() {
    entrance.querySelectorAll('[data-src]').forEach((img) => {
      img.src = img.dataset.src;
      img.srcset = img.dataset.srcset;
      delete img.dataset.src;
      delete img.dataset.srcset;
    });
  }
  function render() {
    document.body.dataset.phase = phase;
    entrance.hidden = phase === 'open';
    entrance.inert = phase === 'open';
    content.hidden = phase !== 'open';
    content.inert = phase !== 'open';
    menu.hidden = phase !== 'open';
    menu.inert = phase !== 'open';
    button.disabled = phase === 'opening';
    entrance.setAttribute('aria-busy', String(phase === 'opening'));
  }
  function go(id) {
    if (phase !== 'open' || !sections.has(id)) return;
    const target = document.getElementById(id);
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    target.focus({ preventScroll: true });
    if (id === 'bienvenida') scrollTo({ top: 0, behavior: 'instant' });
  }
  function finish() {
    clearTimeout(timer);
    if (phase === 'open') return;
    phase = 'open';
    render();
    // Reserve dimensions in HTML, then request all scene materials before scrolling.
    content.querySelectorAll('img[src]').forEach((img) => {
      img.loading = 'eager';
      img.decode().catch(() => {});
    });
    document.dispatchEvent(new Event('gafete:opened'));
    go(
      sections.has(requested)
        ? requested
        : requested.startsWith('invitacion=')
          ? 'confirmacion'
          : 'bienvenida',
    );
  }
  button.addEventListener('click', () => {
    if (phase !== 'closed') return;
    front();
    phase = 'opening';
    document.body.classList.toggle('reduced-opening', reduce.matches);
    render();
    skip.focus({ preventScroll: true });
    timer = setTimeout(finish, reduce.matches ? 240 : 2600);
  });
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && phase !== 'open') {
      e.preventDefault();
      finish();
    }
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      go(a.hash.slice(1));
    }),
  );
  document.querySelector('[data-cover]').addEventListener('click', () => {
    clearTimeout(timer);
    phase = 'closed';
    render();
    scrollTo(0, 0);
    button.focus({ preventScroll: true });
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches && phase === 'opening') finish();
  });
  addEventListener('pagehide', () => clearTimeout(timer));
  addEventListener('pageshow', () => {
    if (phase === 'opening') finish();
  });
  render();
  entrance.focus({ preventScroll: true });
  // Front starts loading only after the cover's first render; interior remains lazy.
  button.addEventListener('pointerenter', front, { once: true });
  button.addEventListener('pointerdown', front, { once: true });
}
