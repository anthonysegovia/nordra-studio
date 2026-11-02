// Calendar dates use the visitor's local time, including the whole of January 6.
function snowSeason(date) {
  const month = date.getMonth();
  return month >= 10 || (month === 0 && date.getDate() <= 6);
}

(() => {
  const canvas = document.querySelector('.horizon-hero > .home-snow');
  if (!canvas) return;
  const override = new URLSearchParams(location.search).get('nieve');
  if (override === '0') return;

  const hero = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false, pageActive = true, frame = 0, midnight = 0;
  let width = 0, height = 0, ratio = 0, last = null, time = 0;
  let context, sprite;
  const flakes = [];

  function makeSprite() {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 32;
    const brush = tile.getContext('2d');
    const glow = brush.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, '#fff');
    glow.addColorStop(0.30, 'rgba(255,255,255,.97)');
    glow.addColorStop(0.55, 'rgba(214,230,243,.76)');
    glow.addColorStop(0.72, 'rgba(108,139,166,.30)');
    glow.addColorStop(1, 'rgba(108,139,166,0)');
    brush.fillStyle = glow;
    brush.fillRect(0, 0, 32, 32);
    return tile;
  }

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (w === width && h === height && dpr === ratio) return;
    width = w; height = h; ratio = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const phone = w <= 700;
    const count = Math.min(phone ? 50 : 110, Math.max(phone ? 35 : 80, Math.round(w * h / (phone ? 6200 : 11000))));
    flakes.length = Math.min(flakes.length, count);
    while (flakes.length < count) {
      const depth = Math.random();
      flakes.push({
        x: Math.random(), y: Math.random(), size: 3 + 6 * depth,
        speed: 15 + 36 * depth, drift: 0.65 + depth * 0.55,
        opacity: 0.48 + depth * 0.42, phase: Math.random() * 2 * Math.PI
      });
    }
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    if (last !== null && now - last < 32) return;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.08);
    last = now;
    time += dt;
    const gust = Math.max(0, Math.sin(time * 0.44)) ** 4;
    const wind = 8 + 32 * Math.sin(time * 0.30) + 23 * gust;
    context.clearRect(0, 0, width, height);
    for (const flake of flakes) {
      // Wrap beyond the edge so a whole sprite leaves before it reappears.
      flake.x = (1 + flake.x + dt * (wind * flake.drift + 7 * Math.sin(time + flake.phase)) / (width + 12)) % 1;
      flake.y = (flake.y + dt * flake.speed / (height + 12)) % 1;
      context.globalAlpha = flake.opacity;
      context.drawImage(sprite, flake.x * (width + 12) - 10, flake.y * (height + 12) - 10, flake.size, flake.size);
    }
  }

  function sync() {
    const active = pageActive && inView && !document.hidden && !reduce.matches &&
      !document.body.classList.contains('dark') && !document.body.classList.contains('has-page-frame') &&
      document.body.dataset.journeyMotion !== 'paused' &&
      (override === '1' || snowSeason(new Date()));
    canvas.classList.toggle('is-snowing', active);
    if (!active) {
      cancelAnimationFrame(frame); frame = 0; last = null;
      return;
    }
    if (!frame) {
      context ??= canvas.getContext('2d');
      if (!context) return;
      sprite ??= makeSprite();
      resize();
      frame = requestAnimationFrame(draw);
    }
  }

  // A tab may stay open across either end of the season.
  function scheduleDateCheck() {
    clearTimeout(midnight);
    if (!pageActive || document.hidden || override === '1') return;
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    midnight = setTimeout(() => { sync(); scheduleDateCheck(); }, next - Date.now());
  }

  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(hero);
  new ResizeObserver(() => { if (frame) resize(); }).observe(hero);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class', 'data-journey-motion'] });
  reduce.addEventListener('change', sync);
  addEventListener('nordra-local-motion', sync);
  document.addEventListener('visibilitychange', () => { sync(); scheduleDateCheck(); });
  addEventListener('pagehide', () => { pageActive = false; sync(); scheduleDateCheck(); });
  addEventListener('pageshow', () => { pageActive = true; sync(); scheduleDateCheck(); });
  scheduleDateCheck();
})();
