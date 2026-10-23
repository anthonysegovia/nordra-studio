/* Bruma motion: progressive enhancement, no hidden content or scroll interception. */
(() => {
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 const ease = 'cubic-bezier(.22,1,.36,1)';
 const active = new Set();
 // Bruma's atmosphere: warm window light and slow rising coffee vapour.
 // Only transform/opacity animate; no canvas, video, filters or frame loop.
 let ambientPaused = false;
 // One viewport-sized background serves all paper sections, rather than
 // allocating a full-height animated layer for every section of the menu.
 const pageAmbience = document.createElement('div');
 pageAmbience.className = 'page-ambience';
 pageAmbience.setAttribute('aria-hidden', 'true');
 document.body.prepend(pageAmbience);
 const ambientScenes = [pageAmbience, ...document.querySelectorAll('.hero, .bruma-footer')];
 const visibleScenes = new Set();
 const visiblePaperSections = new Set();
 ambientScenes.forEach(scene => {
  const atmosphere = document.createElement('div');
  atmosphere.className = 'bruma-atmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = '<i class="ambient-light"></i><i class="ambient-steam"></i><i class="ambient-steam ambient-steam-second"></i>';
  scene.prepend(atmosphere);
 });
 const ambientToggle = document.createElement('button');
 ambientToggle.type = 'button';
 ambientToggle.className = 'ambient-toggle';
 document.querySelector('.hero').append(ambientToggle);
 function syncAtmosphere() {
  const blocked = ambientPaused || reduce.matches || document.hidden || document.querySelector('#selection').open;
  ambientScenes.forEach(scene => scene.classList.toggle('ambient-running', (scene === pageAmbience ? visiblePaperSections.size > 0 : visibleScenes.has(scene)) && !blocked));
  const paused = ambientPaused || reduce.matches;
  ambientToggle.textContent = document.documentElement.lang === 'en' ? (paused ? 'Resume atmosphere' : 'Pause atmosphere') : (paused ? 'Activar ambiente' : 'Pausar ambiente');
  ambientToggle.setAttribute('aria-pressed', String(paused));
  ambientToggle.hidden = reduce.matches;
 }
 const ambientObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? visibleScenes.add(entry.target) : visibleScenes.delete(entry.target));
  syncAtmosphere();
 });
 ambientScenes.filter(scene => scene !== pageAmbience).forEach(scene => ambientObserver.observe(scene));
 const paperObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? visiblePaperSections.add(entry.target) : visiblePaperSections.delete(entry.target));
  syncAtmosphere();
 });
 document.querySelectorAll('.values-band, .menu-section, .finder, .story, .visit-details').forEach(section => paperObserver.observe(section));
 new MutationObserver(syncAtmosphere).observe(document.querySelector('#selection'), { attributes: true, attributeFilter: ['open'] });
 ambientToggle.addEventListener('click', () => { ambientPaused = !ambientPaused; syncAtmosphere(); });
 new MutationObserver(syncAtmosphere).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
 reduce.addEventListener('change', syncAtmosphere);
 document.addEventListener('visibilitychange', syncAtmosphere);
 syncAtmosphere();
 const animate = (element, frames, options = {}) => {
  if (!element || reduce.matches || document.hidden) return;
  const animation = element.animate(frames, { duration: 800, easing: ease, ...options });
  active.add(animation);
  animation.finished.catch(() => {}).finally(() => active.delete(animation));
  return animation;
 };
 const reveal = (element, delay = 0) => animate(element,
  [{ opacity: .65, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
  { delay, fill: 'backwards' });

 // A hand-drawn cup becomes the signature of the fictional café.
 const seal = document.querySelector('.story-mark');
 seal.querySelector('.sun-mark').innerHTML = `<svg class="ritual-cup" viewBox="0 0 120 100" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path class="cup-line" pathLength="1" d="M25 43H83V61C83 78 72 84 54 84S25 77 25 61Z"/><path class="cup-line" pathLength="1" d="M83 47H91C106 47 106 68 91 68H82M17 90H92"/><path class="steam-line" pathLength="1" d="M39 34C24 21 52 18 39 5"/><path class="steam-line" pathLength="1" d="M55 34C40 21 68 18 55 5"/><path class="steam-line" pathLength="1" d="M71 34C56 21 84 18 71 5"/></g></svg>`;
 // Light on paper: a short entrance, then movement follows the reader's scroll.
 const lightFrame=document.createElement('div');
 lightFrame.className='header-light';
 lightFrame.setAttribute('aria-hidden','true');
 const headerLight=document.createElement('div');
 headerLight.className='header-light-surface';
 lightFrame.append(headerLight);
 document.querySelector('.header').prepend(lightFrame);
 animate(headerLight,[{opacity:0,transform:'translateX(-8%)'},{opacity:.7,transform:'translateX(0)'}],{duration:3200});
 const progress = document.createElement('div');
 progress.className = 'reading-progress';
 progress.setAttribute('aria-hidden', 'true');
 document.querySelector('.header').append(progress);

 // Keep headline and actions readable immediately; only the atmosphere settles in.
 animate(document.querySelector('.hero-brand'),
  [{ transform: 'translateY(-12px) scaleX(1.04)' },
   { transform: 'translateY(0) scaleX(1)' }], { duration: 1000 });
 animate(document.querySelector('.hero-image img'),
  [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 1600 });

 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (!entry.isIntersecting) return;
   observer.unobserve(entry.target);
   reveal(entry.target);
   if (entry.target === seal) {
    seal.querySelectorAll('.cup-line, .steam-line').forEach((path, i) =>
     animate(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 1400, delay: i * 130, fill: 'backwards' }));
   }
  });
 }, { threshold: .12 });
 document.querySelectorAll('.section-heading, .finder, .story-mark, .story > div:last-child, .space-overlay, .visit-details > div, .footer-top').forEach(el => observer.observe(el));

 // Observe cards again after a language change; never hide links from keyboard users.
 const watchCards = () => document.querySelectorAll('.menu-item').forEach(el => observer.observe(el));
 watchCards();
 new MutationObserver(watchCards).observe(document.querySelector('#menu-grid'), { childList: true });

 const space = document.querySelector('.space-image');
 const photo = space.querySelector('img');
 let spaceVisible = false;
 new IntersectionObserver(([entry]) => { spaceVisible = entry.isIntersecting; schedule(); }).observe(space);
 let frame = 0;
 function paint() {
  frame = 0;
  const root = document.documentElement;
  const distance = root.scrollHeight - root.clientHeight;
  // Read geometry before writes so scroll effects share a single layout pass.
  const rect = !reduce.matches && spaceVisible ? space.getBoundingClientRect() : null;
  progress.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
  headerLight.style.transform=reduce.matches?'none':`translateX(${Math.sin(window.scrollY / 1400) * 12}%)`;
  if (rect) {
   const offset = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight));
   photo.style.transform = `translateY(${offset * 24}px) scale(1.06)`;
  }
 }
 function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(paint); }
 addEventListener('scroll', schedule, { passive: true });
 addEventListener('resize', schedule, { passive: true });
 schedule();
 const stop = () => {
  document.getAnimations().forEach(animation => {
   if (!animation.effect?.target?.closest('.bruma-atmosphere')) animation.cancel();
  });
  photo.style.removeProperty('transform');
  headerLight.style.removeProperty('transform');
 };
 reduce.addEventListener('change', () => { if (reduce.matches) stop(); else schedule(); });
 document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
 document.addEventListener('focusin', event => {
  // Arriving by keyboard must not leave the focused control in an entrance animation.
  active.forEach(animation => {
   if (animation.effect?.target?.contains(event.target)) animation.finish();
  });
 });

 document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
   animate(document.querySelector('.bag-count'),
    [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', background: '#49634d' }, { transform: 'scale(1)' }],
    { duration: 460 });
   animate(add, [{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: 240 });
  }
  if (event.target.closest('[data-taste]')) {
   animate(document.querySelector('#recommendation'),
    [{ opacity: .2, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 450 });
  }

 });
})();
