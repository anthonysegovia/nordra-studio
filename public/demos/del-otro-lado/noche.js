(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const main = document.querySelector('main');
  const threshold = document.querySelector('.threshold');
  const enterButton = document.querySelector('#enter');
  const motionButton = document.querySelector('#motion-toggle');
  const soundButton = document.querySelector('#sound-toggle');
  let manuallyPaused = false;
  let entered = false;
  let entering = false;
  const motionOff = () => manuallyPaused || reduced.matches || document.hidden;

  // Animate complete pieces of content, so reading never depends on individual letters appearing.
  const motionTargets = document.querySelectorAll('h1,h2,h3,p,button,a:not(.skip-link),label,legend,input:not([type=radio]),select,time,.fact-label,.tiny-note,.demo-label,.threshold-note,.footer-note,.letter-sign,.swatches,.portal-art,.dress-orb,.wish-sky,.hero-bottom,.countdown,.seal,.rooftop');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    if (element.closest('main') && !entered && !entering) return;
    if (element.closest('dialog') && !element.closest('dialog').open) return;
    element.classList.add('is-visible');
    observer.unobserve(element);
  }), { threshold: .08 });
  root.classList.add('motion-ready');
  motionTargets.forEach((element, index) => {
    element.dataset.motion = 'reveal';
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 60}ms`);
    element.addEventListener('animationend', event => {
      if (event.target === element && event.animationName === 'rise-in') element.classList.remove('reveal');
    });
    observer.observe(element);
  });

  threshold.hidden = false;
  main.inert = true;
  document.body.classList.add('is-sealed');
  window.scrollTo({ top: 0, behavior: 'instant' });
  function enter(destination = 'night-title') {
    if (entering || entered) return;
    entering = true;
    enterButton.disabled = true;
    const art = document.querySelector('.threshold-art');
    art.style.transform = getComputedStyle(art).transform;
    art.style.filter = getComputedStyle(art).filter;
    art.style.animation = 'none';
    document.body.classList.add('is-opening');
    main.querySelectorAll('.hero .reveal').forEach(element => { observer.unobserve(element); observer.observe(element); });
    const finish = () => {
      if (entered) return;
      entered = true;
      threshold.hidden = true;
      main.inert = false;
      document.body.classList.remove('is-sealed', 'is-opening');
      main.querySelectorAll('.reveal').forEach(element => { observer.unobserve(element); observer.observe(element); });
      const target = document.getElementById(destination);
      if (destination === 'night-title') {
        window.scrollTo({ top: 0, behavior: 'instant' });
        target.focus({ preventScroll: true });
      }
      else target.scrollIntoView({ behavior: motionOff() ? 'instant' : 'smooth', block: 'start' });
    };
    // Overlap the entrance fade with the invitation appearing, keeping the artwork still.
    const onOpeningEnd = event => {
      if (event.target === threshold && event.propertyName === 'opacity') {
        threshold.removeEventListener('transitionend', onOpeningEnd);
        finish();
      }
    };
    threshold.addEventListener('transitionend', onOpeningEnd);
    setTimeout(finish, motionOff() ? 0 : 1000);
  }
  enterButton.addEventListener('click', () => enter());
  document.querySelector('.skip-link').addEventListener('click', event => {
    if (!entered) { event.preventDefault(); enter('detalles'); }
  });
  // Opening a saved section link goes directly to the useful content.
  if (['#detalles', '#respuesta'].includes(location.hash)) {
    enter(location.hash.slice(1));
  }

  const canvas = document.querySelector('#sky');
  const ctx = canvas.getContext('2d');
  const magic = document.querySelector('#magic-layer');
  const magicContext = magic.getContext('2d');
  const gateScenery = document.querySelector('.threshold-scenery');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let lastTrail = 0;
  let width = 0, height = 0, stars = [], sparks = [], frame = 0, lastFrame = 0;
  function resizeSky() {
    width = innerWidth; height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    magic.width = canvas.width; magic.height = canvas.height;
    magicContext?.setTransform(scale, 0, 0, scale, 0, 0);
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    stars = Array.from({ length: width < 700 ? 36 : 64 }, () => ({ x: Math.random() * width, y: Math.random() * height, r: .5 + Math.random() * .8, phase: Math.random() * 6.28, speed: .35 + Math.random() * .3 }));
    drawSky(performance.now());
  }
  function drawSky(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = .15 + .25 * (1 + Math.sin(time * .0004 * star.speed + star.phase)) / 2;
      ctx.fillStyle = `rgba(205,224,243,${alpha})`;
      ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!magicContext) return;
    magicContext.clearRect(0, 0, width, height);
    sparks = sparks.filter(spark => time - spark.born < spark.life);
    for (const spark of sparks) {
      const progress = (time - spark.born) / spark.life;
      const x = spark.x + Math.cos(spark.angle) * spark.distance * progress;
      const y = spark.y + Math.sin(spark.angle) * spark.distance * progress + progress * progress * 18;
      const radius = spark.size * (1 - progress);
      magicContext.fillStyle = `rgba(213,226,255,${Math.max(0, 1 - progress) * .75})`;
      magicContext.beginPath();
      magicContext.moveTo(x, y - radius * 2.4); magicContext.quadraticCurveTo(x + radius * .3, y - radius * .3, x + radius * 2.4, y);
      magicContext.quadraticCurveTo(x + radius * .3, y + radius * .3, x, y + radius * 2.4);
      magicContext.quadraticCurveTo(x - radius * .3, y + radius * .3, x - radius * 2.4, y);
      magicContext.quadraticCurveTo(x - radius * .3, y - radius * .3, x, y - radius * 2.4); magicContext.fill();
    }
  }
  function animateSky(time) {
    if (motionOff()) { frame = 0; return; }
    if (time - lastFrame >= 32) { drawSky(time); lastFrame = time; }
    frame = requestAnimationFrame(animateSky);
  }
  function syncMotion() {
    root.classList.toggle('motion-paused', motionOff());
    motionButton.setAttribute('aria-pressed', String(manuallyPaused || reduced.matches));
    motionButton.setAttribute('aria-label', manuallyPaused ? 'Activar animaciones' : reduced.matches ? 'Movimiento reducido por tu dispositivo' : 'Pausar animaciones');
    motionButton.querySelector('span').textContent = manuallyPaused ? 'Activar' : reduced.matches ? 'Suave' : 'Pausar';
    motionButton.disabled = reduced.matches;
    if (motionOff()) { cancelAnimationFrame(frame); frame = 0; sparks = []; drawSky(performance.now()); }
    else if (!frame) frame = requestAnimationFrame(animateSky);
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  window.addEventListener('resize', resizeSky, { passive: true });
  resizeSky(); syncMotion();
  function scatter(x, y, amount = 18, distance = 80, life = 1300) {
    if (motionOff()) return;
    const born = performance.now();
    for (let index = 0; index < amount; index++) sparks.push({ x, y, angle: Math.random() * Math.PI * 2, distance: 10 + Math.random() * distance, born, life, size: .8 + Math.random() * 1.7 });
    sparks = sparks.slice(-75);
  }
  document.addEventListener('pointermove', event => {
    if (motionOff() || !finePointer.matches || event.pointerType !== 'mouse') return;
    const now = performance.now();
    if (now - lastTrail < 65) return;
    lastTrail = now;
    scatter(event.clientX, event.clientY, 1, 18, 750);
    if (!entered && !entering) {
      gateScenery.style.setProperty('--gate-x', `${(event.clientX / width - .5) * 14}px`);
      gateScenery.style.setProperty('--gate-y', `${(event.clientY / height - .5) * 10}px`);
    }
  }, { passive: true });
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('button,a,input,select') : null;
    if (!target || motionOff()) return;
    const bounds = target.getBoundingClientRect();
    scatter(event.detail ? event.clientX : bounds.x + bounds.width / 2, event.detail ? event.clientY : bounds.y + bounds.height / 2, target === enterButton ? 0 : 14, 65);
  });
  document.addEventListener('focusin', event => {
    if (event.target.matches('input:not([type=radio]),select')) {
      const bounds = event.target.getBoundingClientRect();
      scatter(bounds.right - 15, bounds.y + bounds.height / 2, 9, 35, 900);
    }
  });
  function sparkle(element) {
    if (motionOff()) return;
    const bounds = element.getBoundingClientRect();
    scatter(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 36, 125, 1700);
  }

  // An audible original recording; the control reflects real media playback events.
  const music = document.getElementById('night-music');
  const soundStatus = document.getElementById('sound-status');
  let resumeOnReturn = false;
  music.volume = .6;
  soundButton.hidden = false;
  function syncAudio() {
    const playing = !music.paused && !music.ended;
    soundButton.setAttribute('aria-pressed', String(playing));
    soundButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    soundButton.querySelector('span').textContent = playing ? 'Pausar música' : 'Música';
    soundButton.dataset.audioState = playing ? 'playing' : 'paused';
  }
  music.addEventListener('playing', () => { soundStatus.textContent = ''; syncAudio(); });
  music.addEventListener('pause', syncAudio);
  music.addEventListener('ended', syncAudio);
  music.addEventListener('error', () => { soundStatus.textContent = 'No pudimos cargar la música. Toca Música para intentarlo de nuevo.'; syncAudio(); });
  soundButton.addEventListener('click', async () => {
    soundButton.disabled = true;
    try {
      if (music.paused) {
        if (music.error) music.load();
        soundStatus.textContent = 'Preparando la música';
        await music.play();
      } else { music.pause(); soundStatus.textContent = ''; }
    } catch {
      soundStatus.textContent = 'No se pudo reproducir. Toca Música para intentarlo de nuevo.';
      syncAudio();
    } finally { soundButton.disabled = false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeOnReturn = !music.paused; music.pause(); }
    else if (resumeOnReturn) { resumeOnReturn = false; music.play().catch(() => { syncAudio(); }); }
  });

  const newYear = Date.parse('2027-01-01T00:00:00-06:00');
  function updateCountdown() {
    const remaining = Math.max(0, Math.floor((newYear - Date.now()) / 1000));
    const values = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60 };
    for (const [id, value] of Object.entries(values)) {
      const element = document.getElementById(id);
      if (element.textContent !== String(value)) { element.textContent = String(value); if (!motionOff()) { element.classList.remove('tick'); void element.offsetWidth; element.classList.add('tick'); } }
    }
    if (!remaining) document.getElementById('countdown-title').textContent = 'Ya estamos del otro lado. Bienvenido, 2027.';
  }
  updateCountdown();
  const countdownTimer = setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);
  window.addEventListener('pagehide', () => { clearInterval(countdownTimer); cancelAnimationFrame(frame); music.pause(); });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { location.reload(); return; }
    requestAnimationFrame(() => {
      if (!entered && !entering) window.scrollTo({ top: 0, behavior: 'instant' });
    });
  });

  const rsvp = document.getElementById('rsvp-dialog');
  const locationDialog = document.getElementById('location-dialog');
  const triggers = new WeakMap();
  function openDialog(dialog, trigger) {
    triggers.set(dialog, trigger);
    dialog.classList.remove('is-closing');
    dialog.showModal();
    dialog.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    document.body.style.overflow = 'hidden';
  }
  function closeDialog(dialog) {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.close(); dialog.classList.remove('is-closing'); document.body.style.overflow = '';
      triggers.get(dialog)?.focus({ preventScroll: true });
    }, motionOff() ? 0 : 270);
  }
  document.getElementById('rsvp-open').addEventListener('click', event => openDialog(rsvp, event.currentTarget));
  document.getElementById('location-open').addEventListener('click', event => openDialog(locationDialog, event.currentTarget));
  [rsvp, locationDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    let startedOutside = false;
    const isOutside = event => { const bounds = dialog.getBoundingClientRect(); return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom; };
    dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && isOutside(event); });
    dialog.addEventListener('click', event => { if (startedOutside && event.target === dialog && isOutside(event)) closeDialog(dialog); startedOutside = false; });
  });
  const form = document.getElementById('rsvp-form');
  const guest = document.getElementById('guest-name');
  const formError = document.getElementById('rsvp-error');
  const fields = document.getElementById('rsvp-fields');
  const success = document.getElementById('rsvp-success');
  form.addEventListener('change', () => {
    const going = new FormData(form).get('attendance') === 'yes';
    document.getElementById('company-field').hidden = !going;
  });
  guest.addEventListener('input', () => { guest.removeAttribute('aria-invalid'); formError.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = guest.value.trim();
    if (!name) { guest.setAttribute('aria-invalid', 'true'); formError.textContent = 'Dinos cómo te llamamos. Un apodo también cuenta.'; guest.focus(); return; }
    const data = new FormData(form), going = data.get('attendance') === 'yes', people = Number(data.get('company'));
    document.getElementById('success-title').textContent = going ? `${name}, tu copa va aquí` : `${name}, brindaremos por ti`;
    document.getElementById('success-copy').textContent = going ? (people === 1 ? 'En una invitación real, los anfitriones sabrían que llegas a compartir la noche.' : `En una invitación real, los anfitriones contarían con ${people} lugares para tu grupo.`) : 'En una invitación real, los anfitriones recibirían tu respuesta y sabrían que esta vez no podrás acompañarlos.';
    fields.hidden = true; success.hidden = false;
    rsvp.setAttribute('aria-labelledby', 'success-title');
    rsvp.scrollTo({ top: 0, behavior: 'instant' });
    success.focus({ preventScroll: true });
    sparkle(success.querySelector('svg'));
  });
  document.getElementById('rsvp-again').addEventListener('click', () => {
    success.hidden = true; fields.hidden = false; form.reset(); formError.textContent = ''; guest.removeAttribute('aria-invalid');
    rsvp.setAttribute('aria-labelledby', 'rsvp-dialog-title');
    document.getElementById('company-field').hidden = false; guest.focus();
  });
})();
