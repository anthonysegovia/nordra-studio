(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const entry = document.querySelector('#entry');
  const opening = document.querySelector('.opening');
  const starStage = document.querySelector('.star-stage');
  const star = document.querySelector('.star-response');
  const starLight = document.querySelector('.star-light');
  const starHalo = document.querySelector('.star-halo');
  const starTrigger = document.querySelector('.star-trigger');
  const openButton = document.querySelector('#open-invitation');
  const motionButton = document.querySelector('.motion-toggle');
  const afterOpening = document.querySelector('.after-opening');
  const heroCopy = document.querySelector('.hero-copy');
  const heroFoot = document.querySelector('.hero-foot');
  let opened = Boolean(location.hash && location.hash !== '#inicio');
  let openingNow = false;
  let manuallyPaused = false;
  let starAnimation;
  let stageAnimation;
  let lightAnimation;
  let haloAnimation;
  let entryExitTimeout;
  let openingTimeout;

  const motionAllowed = () => !reduced.matches && !manuallyPaused && !document.hidden;

  // A bounded set of transform-only flakes; no canvas loop or per-frame JS.
  const snow = document.querySelector('.snowfall');
  const snowFragment = document.createDocumentFragment();
  for (let i = 0; i < 38; i++) {
    const flake = document.createElement('span');
    flake.className = 'snowflake';
    const near = i % 4 === 0;
    flake.style.cssText = `--x:${(i * 61.8) % 100}%;--size:${near ? 11 + i % 5 : 4 + i % 5}px;--fall:${near ? 15 + i % 6 : 22 + i % 9}s;--delay:${-((i * 3.7) % 28)}s;--drift:${i % 2 ? -28 : 32}px;--alpha:${near ? .5 : .24};--spin:${i % 2 ? -95 : 105}deg`;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-snowflake');
    svg.append(use);
    flake.append(svg);
    snowFragment.append(flake);
  }
  snow.append(snowFragment);
  const lights = document.querySelector('.holiday-lights');
  for (let i = 0; i < 17; i++) {
    const bulb = document.createElement('i');
    bulb.style.cssText = `--bulb-x:${3 + i * 5.875}%;--bulb-y:${27 + Math.sin(i / 16 * Math.PI) * 43}%;--bulb-delay:${-i * .71}s`;
    lights.append(bulb);
  }
  const sparks = document.querySelector('.star-sparks');
  for (let i = 0; i < 20; i++) {
    const spark = document.createElement('i');
    const angle = i * Math.PI * 2 / 20;
    const radius = 110 + i % 4 * 28;
    spark.style.cssText = `--dx:${Math.cos(angle) * radius}px;--dy:${Math.sin(angle) * radius}px;--spark-delay:${i % 3 * 70}ms`;
    sparks.append(spark);
  }
  function animateStar(intensity = 1) {
    if (!motionAllowed()) return;
    starAnimation?.cancel();
    starAnimation = star.animate([
      { transform: 'rotate(0deg)' },
      { transform: `rotate(${-2.3 * intensity}deg)`, offset: .25 },
      { transform: `rotate(${1.5 * intensity}deg)`, offset: .6 },
      { transform: 'rotate(0deg)' }
    ], { duration: 1900, easing: 'cubic-bezier(.25,.65,.2,1)' });
  }

  function illuminateStar() {
    if (!motionAllowed()) return;
    // Repeated touches continue from the current light, without a bright restart.
    const lightLevel = getComputedStyle(starLight).opacity;
    const haloLevel = getComputedStyle(starHalo).opacity;
    lightAnimation?.cancel();
    haloAnimation?.cancel();
    lightAnimation = starLight.animate([
      { opacity: lightLevel }, { opacity: .62, offset: .42 }, { opacity: .14 }
    ], { duration: 2400, easing: 'cubic-bezier(.4,0,.2,1)' });
    haloAnimation = starHalo.animate([
      { opacity: haloLevel }, { opacity: 1, offset: .42 }, { opacity: haloLevel }
    ], { duration: 2600, easing: 'cubic-bezier(.4,0,.2,1)' });
    animateStar(.55);
  }

  function applyMotion() {
    const paused = reduced.matches || manuallyPaused;
    root.dataset.motion = paused || document.hidden ? 'paused' : 'playing';
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', reduced.matches ? 'Movimiento reducido activado en tu dispositivo' : paused ? 'Reanudar movimiento' : 'Pausar movimiento');
    const label = motionButton.querySelector('.motion-label');
    const labelText = reduced.matches ? 'Sin movimiento' : paused ? 'Ambiente en pausa' : 'Pausar ambiente';
    if (label.textContent !== labelText) {
      label.textContent = labelText;
      if (!reduced.matches) label.animate([{ opacity: .25 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
    }
    motionButton.disabled = reduced.matches;
    if (!motionAllowed()) {
      starAnimation?.cancel();
      stageAnimation?.cancel();
      lightAnimation?.cancel();
      haloAnimation?.cancel();
      if (openingNow) finishOpening();
    }
  }
  motionButton.hidden = false;
  applyMotion();
  motionButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; applyMotion(); });
  reduced.addEventListener('change', applyMotion);

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const item of entries) if (item.isIntersecting) {
      item.target.classList.add('is-visible');
      revealObserver.unobserve(item.target);
    }
  }, { threshold: .12 }) : null;
  function prepareReveals() {
    if (!revealObserver || reduced.matches) return;
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('reveal-ready');
      revealObserver.observe(el);
    });
  }
  function finishOpening() {
    clearTimeout(openingTimeout);
    clearTimeout(entryExitTimeout);
    if (opened) return;
    const previousSuspension = document.querySelector('.star-suspension').getBoundingClientRect();
    root.classList.add('is-open');
    root.classList.remove('is-opening', 'is-lighting');
    entry.hidden = true;
    heroCopy.inert = false;
    heroFoot.inert = false;
    afterOpening.inert = false;
    opened = true;
    openingNow = false;
    starTrigger.setAttribute('aria-label', 'Iluminar suavemente la piñata');
    opening.setAttribute('aria-labelledby', 'party-title');
    const currentStar = starStage.getBoundingClientRect();
    const currentSuspension = document.querySelector('.star-suspension').getBoundingClientRect();
    const scale = previousSuspension.width / currentSuspension.width;
    const x = previousSuspension.left + previousSuspension.width / 2 - currentSuspension.left - currentSuspension.width / 2;
    const y = previousSuspension.top - currentStar.top - (currentSuspension.top - currentStar.top) * scale;
    if (motionAllowed()) {
      stageAnimation = starStage.animate([
        { transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: '50% 0' },
        { transform: 'translate(0, 0) scale(1)', transformOrigin: '50% 0' }
      ], { duration: 1500, easing: 'cubic-bezier(.22,.68,.2,1)' });
    }
    document.querySelector('#party-title').focus({ preventScroll: true });
    prepareReveals();
  }
  function openInvitation() {
    if (opened || openingNow) return;
    openingNow = true;
    openButton.disabled = true;
    if (!motionAllowed()) { finishOpening(); return; }
    // Warm the paper, release gold sparks, then open the scene around it.
    root.classList.add('is-lighting');
    animateStar(1.35);
    entryExitTimeout = setTimeout(() => root.classList.add('is-opening'), 650);
    openingTimeout = setTimeout(finishOpening, 1750);
  }
  if (!opened) {
    entry.hidden = false;
    root.classList.add('has-entry');
    heroCopy.inert = true;
    heroFoot.inert = true;
    afterOpening.inert = true;
    opening.setAttribute('aria-labelledby', 'entry-title');
    starTrigger.setAttribute('aria-label', 'Encender la piñata y abrir la invitación');
  } else {
    root.classList.add('is-open');
    prepareReveals();
  }
  starTrigger.hidden = false;
  openButton.addEventListener('click', openInvitation);
  starTrigger.addEventListener('click', () => opened ? illuminateStar() : openInvitation());

  const ambienceObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(item => { item.target.dataset.offscreen = String(!item.isIntersecting); });
  }, { threshold: 0 }) : null;
  ambienceObserver?.observe(opening);

  // Keep actual anchors/history and bypass the opening when following a deep link.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (!opened) finishOpening();
      if (motionAllowed()) animateStar(.6);
      const hash = link.getAttribute('href');
      if (location.hash !== hash) history.pushState(null, '', hash);
      target.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'instant', block: 'start' });
      const heading = target.matches('[tabindex]') ? target : target.querySelector('[tabindex]');
      heading?.focus({ preventScroll: true });
    });
  });
  addEventListener('hashchange', () => { if (!opened && location.hash && location.hash !== '#inicio') finishOpening(); });

  const toast = document.querySelector('.toast');
  let toastTimeout;
  document.querySelectorAll('a[download$=".ics"]').forEach(link => {
    link.addEventListener('click', () => {
      // Download remains a real link; importing it is always up to the guest.
      clearTimeout(toastTimeout);
      toast.querySelector('span').textContent = 'Abre el archivo para añadir la fecha a tu calendario.';
      toast.classList.add('is-visible');
      if (motionAllowed()) {
        const art = link.closest('.date-letter');
        art?.animate([{ transform: 'rotate(1.2deg)' }, { transform: 'rotate(-.4deg)', offset: .4 }, { transform: 'rotate(1.2deg)' }], { duration: 1000, easing: 'ease-in-out' });
      }
      toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 5200);
    });
  });

  // Minute precision keeps the invitation quiet and avoids a constantly ticking UI.
  const eventStart = Date.parse('2026-12-19T18:00:00-06:00');
  const countdownWrap = document.querySelector('.countdown-wrap');
  const countdown = document.querySelector('.countdown');
  const finished = document.querySelector('.countdown-finished');
  const counterAnimations = new Map();
  let timer;
  function setNumber(el, value) {
    const next = String(value).padStart(2, '0');
    if (el.textContent === next) return;
    counterAnimations.get(el)?.cancel();
    if (!motionAllowed() || el.textContent === '—') { el.textContent = next; return; }
    const exit = el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-3px)' }], { duration: 180, fill: 'forwards', easing: 'ease-in' });
    counterAnimations.set(el, exit);
    exit.finished.then(() => {
      el.textContent = next;
      exit.cancel();
      const arrival = el.animate([{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: 'ease-out' });
      counterAnimations.set(el, arrival);
    }).catch(() => { el.textContent = next; });
  }
  function updateCountdown() {
    clearTimeout(timer);
    const minutes = Math.max(0, Math.ceil((eventStart - Date.now()) / 60000));
    countdownWrap.hidden = false;
    if (!minutes) {
      countdown.hidden = true;
      document.querySelector('#countdown-label').hidden = true;
      finished.textContent = Date.now() - eventStart < 86400000 ? '¡Hoy es la posada!' : 'La posada fue el 19 de diciembre.';
      if (finished.hidden) {
        finished.hidden = false;
        if (motionAllowed()) finished.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650 });
      }
      return;
    }
    setNumber(document.querySelector('[data-unit="days"]'), Math.floor(minutes / 1440));
    setNumber(document.querySelector('[data-unit="hours"]'), Math.floor(minutes % 1440 / 60));
    setNumber(document.querySelector('[data-unit="minutes"]'), minutes % 60);
    if (!document.hidden) timer = setTimeout(updateCountdown, 60000 - Date.now() % 60000 + 30);
  }
  updateCountdown();
  document.addEventListener('visibilitychange', () => { applyMotion(); updateCountdown(); });
  addEventListener('pagehide', () => {
    clearTimeout(timer);
    clearTimeout(toastTimeout);
    clearTimeout(entryExitTimeout);
    clearTimeout(openingTimeout);
  });
  addEventListener('pageshow', event => {
    if (event.persisted) {
      if (openingNow) finishOpening();
      applyMotion();
      updateCountdown();
      toast.classList.remove('is-visible');
    }
  });
})();
