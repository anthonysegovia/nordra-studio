// Calendar dates use the visitor's local time, including the whole of January 6.
function snowSeason(date) {
  const month = date.getMonth();
  return month >= 10 || (month === 0 && date.getDate() <= 6);
}

function winterSeason(date, override) {
  return override === '1' || (override !== '0' && snowSeason(date));
}

// x and y are fractions of the hero. The two fronts cross from opposite
// sides at different intervals, so even neighbouring flakes don't turn together.
function snowWind(x, y, time, out) {
  const right = Math.max(0, Math.cos(time * 0.77 - x * 2.6 - 2.25)) ** 4;
  const left = Math.max(0, Math.cos(time * 0.60 + x * 2.2 - 1.1)) ** 5;
  const eddy = Math.sin(5 * x + 3 * y - time * 0.85);
  out.x = 18 + 31 * Math.sin(time * 0.32 + y * 1.9) + 19 * eddy + 150 * right - 140 * left;
  out.lift = (right + left) * Math.max(0, eddy);
  return out;
}

(() => {
  const canvas = document.querySelector('.horizon-hero > .home-snow');
  if (!canvas) return;
  const override = new URLSearchParams(location.search).get('nieve');
  const hero = canvas.parentElement;
  function updateSeason() {
    const enabled = winterSeason(new Date(), override);
    if (hero.winterIce !== enabled) {
      hero.winterIce = enabled;
      hero.dispatchEvent?.(new Event('nordra-winter-season'));
    }
    return enabled;
  }
  updateSeason();
  if (override === '0') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false, pageActive = true, frame = 0, midnight = 0;
  let width = 0, height = 0, ratio = 0, last = null, time = 0;
  let context, sprites, titleTop = 0, titleBottom = 0;
  const flakes = [], rings = [];
  const wind = { x: 0, lift: 0 };
  const poster = hero.querySelector('.landscape-poster');
  const stage = hero.querySelector('.horizon-landscape');

  // Overlapping, off-centre soft lobes. The blue-grey light is a shadow
  // underneath the crystal, not a contrasting ring around a white disc.
  function makeSprite(layer) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 64;
    const brush = tile.getContext('2d');
    function lobe(x, y, rx, ry, angle, color, strength) {
      brush.save();
      brush.translate(x, y);
      brush.rotate(angle);
      brush.scale(rx, ry);
      const glow = brush.createRadialGradient(0, 0, 0, 0, 0, 1);
      glow.addColorStop(0, `rgba(${color},${strength})`);
      glow.addColorStop(0.45, `rgba(${color},${strength * 0.55})`);
      glow.addColorStop(1, `rgba(${color},0)`);
      brush.fillStyle = glow;
      brush.fillRect(-1, -1, 2, 2);
      brush.restore();
    }
    lobe(30, 35, 25, 18, -0.55, '102,139,162', layer === 3 ? 0.22 : 0.43);
    lobe(33, 29, 24, 15, -0.65, '255,255,255', layer === 0 ? 0.70 : 1);
    if (layer === 1 || layer === 2) {
      lobe(33, 30, 29, 21, -0.55, '250,253,255', 0.76);
      lobe(33, 29, 12, 8, -0.50, '255,255,255', 1);
      lobe(31, 31, 24, 7, 0.75, '255,255,255', 1);
      lobe(34, 30, 18, 5, -0.48, '255,255,255', 0.96);
      lobe(36, 27, 10, 4, 1.32, '246,253,255', 0.92);
    }
    return tile;
  }

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (w === width && h === height && dpr === ratio) return;
    width = w; height = h; ratio = dpr;
    const title = hero.querySelector('.horizon-title');
    if (title) {
      titleTop = title.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      titleBottom = titleTop + title.offsetHeight;
    }
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const phone = w <= 700;
    const count = Math.min(phone ? 65 : 140, Math.max(phone ? 35 : 80, Math.round(w * h / (phone ? 5500 : 9600))));
    flakes.length = 0;
    rings.length = 0;
    // Paint back to front. Nearly half the particles are in the distant mist.
    const farEnd = Math.round(count * 0.46), midEnd = Math.round(count * 0.78);
    const nearEnd = count - (phone ? 2 : 4);
    for (let i = 0; i < count; i++) {
      const layer = i < farEnd ? 0 : i < midEnd ? 1 : i < nearEnd ? 2 : 3;
      const z = (layer + Math.random()) / 4;
      const size = 5 + 28 * z * z;
      flakes.push({
        layer, z, x: Math.random() * w, y: Math.random() * h,
        vx: 0, vy: 20 + 90 * z, phase: Math.random() * 2 * Math.PI,
        frequency: 1.0 + Math.random(), size: layer === 3 ? size + 24 : layer === 0 ? size : size * 1.43
      });
    }
  }

  // Keep ripples attached to the lake as the camera advances or the poster changes.
  function waterContact(shore, z) {
    return shore + 6 + (height - shore) * z ** 1.8;
  }

  function paintRings(dt, shore) {
    context.lineWidth = 1.2;
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      ring.age += dt;
      const t = ring.age / 1.35;
      if (t >= 1) { rings.splice(i, 1); continue; }
      const radius = 2 + (12 + 24 * ring.z) * (1 - (1 - t) ** 2);
      context.globalAlpha = Math.min(1, t * 9) * (1 - t) ** 1.2;
      for (let band = 0; band < 2; band++) {
        const r = radius * (band ? 0.81 : 1);
        context.strokeStyle = band ? 'rgba(255,255,255,.72)' : 'rgba(64,104,132,.46)';
        context.beginPath();
        context.ellipse(ring.x, waterContact(shore, ring.z), r, r * (0.12 + 0.08 * ring.z), 0, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    if (last !== null && now - last < 32) return;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.08);
    last = now;
    time += dt;
    context.clearRect(0, 0, width, height);
    const lake = stage?.classList.contains('has-scene') ? stage.measureLake?.() : poster?.lakeBounds;
    if (!lake || !width || !height) return;
    paintRings(dt, lake.shore);
    for (const f of flakes) {
      const { z, layer } = f;
      const far = layer === 0;
      // Keep water contacts in front of the entire massif. z moves the
      // contact nearer to the viewer; the closest bokeh can exit below frame.
      const stop = far ? lake.horizon : waterContact(lake.shore, z);
      const spin = time * f.frequency + f.phase;
      snowWind(f.x / width, f.y / height, time, wind);
      const gain = dt * (1.2 + z);
      f.vx += ((wind.x + 13 * Math.sin(spin)) * (0.18 + 1.24 * z) - f.vx) * gain;
      f.vy += (19 + 96 * z + 8 * Math.cos(spin) - 178 * z * wind.lift - f.vy) * gain;
      const previousY = f.y;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.y >= stop) {
        if (!far && previousY < stop && stop < height - 3 && f.x >= 0 && f.x < width && rings.length < 10) {
          rings.push({ x: f.x, z, age: 0 });
          stage?.snowContact?.(f.x,stop);
        }
        f.y = -f.size;
        f.x = Math.random() * width;
        continue;
      }
      if (f.x > width + f.size && f.vx > 0) f.x = -f.size;
      if (f.x < -f.size && f.vx < 0) f.x = width + f.size;
      const mist = far ? Math.min(1, Math.max(0, (stop - f.y) / (height * 0.15))) : 1;
      const shimmer = 0.88 + 0.12 * Math.cos(spin);
      let opacity = layer === 0 ? 0.54 + z * 0.45 : Math.min(1, 0.83 + z * 0.24);
      if (layer === 3) {
        // Let the foreground drift past the headline without flashing behind the letters.
        const distance = Math.max(0, titleTop - f.y, f.y - titleBottom);
        opacity *= 0.34 + 0.66 * Math.min(1, distance / f.size);
      }
      context.globalAlpha = mist * shimmer * opacity;
      const size = f.size;
      if (layer >= 2) {
        const angle = 0.55 * Math.sin(spin) + f.vx * 0.003;
        const cos = Math.cos(angle) * ratio, sin = Math.sin(angle) * ratio;
        context.setTransform(cos, sin, -sin, cos, f.x * ratio, f.y * ratio);
        context.drawImage(sprites[layer], -size / 2, -size / 2, size, size);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      } else {
        context.drawImage(sprites[layer], f.x - size / 2, f.y - size / 2, size, size);
      }
    }
  }

  function sync() {
    const seasonal = updateSeason();
    const active = pageActive && inView && !document.hidden && !reduce.matches &&
      !document.body.classList.contains('dark') && !document.body.classList.contains('has-page-frame') &&
      document.body.dataset.journeyMotion !== 'paused' &&
      seasonal;
    canvas.classList.toggle('is-snowing', active);
    if (!active) {
      cancelAnimationFrame(frame); frame = 0; last = null;
      return;
    }
    if (!frame) {
      context ??= canvas.getContext('2d');
      if (!context) return;
      sprites ??= [0, 1, 2, 3].map(makeSprite);
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
