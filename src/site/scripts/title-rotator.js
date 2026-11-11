// Home title: the accent line cycles through several endings.
// «Cristal»: frost ferns grow across the current words and freeze them, the ice
// cracks into shards and a few six-armed snowflakes, and a small star of light
// crosses the line: each new letter crystallises as it passes and then thaws
// into the accent colour.
// The <h1> keeps a static, readable text; the rotating copy is aria-hidden.
const root = document.querySelector('[data-title-rotator]');

if (root) {
  const phrases = [...root.querySelectorAll('[data-phrase]')].map(node => node.textContent.trim()).filter(Boolean);
  const stage = root.querySelector('.title-rotator-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 3600, FROST = 720, CRACK = 160, SHATTER = 360, SWEEP = 760, CRYSTAL = 1150;
  const TAU = Math.PI * 2;
  let index = 0, timer = 0, visible = true, busy = false, run = 0;

  const canvas = document.createElement('canvas');
  canvas.className = 'title-frost';
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);
  const ctx = canvas.getContext('2d');
  let effects = [], frame = 0, box = null, dpr = 1, ink = {};

  const stopped = () => reduced.matches || document.body.dataset.journeyMotion === 'paused' || document.hidden || !visible;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = t => 1 - (1 - t) ** 3;

  function letters(text) {
    const word = document.createElement('span');
    word.className = 'title-rotator-word';
    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'title-rotator-char';
      span.textContent = char === ' ' ? ' ' : char;
      word.append(span);
    }
    return word;
  }

  function measure(text) {
    const probe = letters(text);
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    stage.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width + 4;
  }

  function settle(text) {
    stage.replaceChildren(letters(text));
    stage.style.width = `${Math.ceil(measure(text))}px`;
  }

  // ---- Canvas: one layer for frost, shards, snowflakes and the star. ----
  function fit() {
    const r = root.getBoundingClientRect();
    const padX = r.height * 0.9, padTop = r.height * 0.7, padBottom = r.height * 2;
    box = { left: r.left - padX, top: r.top - padTop, w: r.width + padX * 2, h: r.height + padTop + padBottom };
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.style.cssText = `left:${-padX}px;top:${-padTop}px;width:${box.w}px;height:${box.h}px`;
    canvas.width = Math.round(box.w * dpr);
    canvas.height = Math.round(box.h * dpr);
    const css = getComputedStyle(root);
    for (const key of ['line', 'glow', 'shard', 'star']) ink[key] = css.getPropertyValue(`--frost-${key}`).trim();
  }

  const local = rect => ({ x: rect.left - box.left, y: rect.top - box.top, w: rect.width, h: rect.height });

  function add(effect) {
    effect.start = performance.now();
    effects.push(effect);
    if (!frame) frame = requestAnimationFrame(tick);
    return effect;
  }

  function tick(now) {
    frame = 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box.w, box.h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    effects = effects.filter(effect => effect.draw(Math.max(0, now - effect.start), now) !== false);
    frame = effects.length ? requestAnimationFrame(tick) : 0;
  }

  function clearEffects() {
    effects = [];
    cancelAnimationFrame(frame);
    frame = 0;
    if (box) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // A frost fern: a wandering stem with branches and twigs at 60°, like ice on glass.
  function frost(word) {
    const h = word.h, segs = [];
    const speed = (word.w + h * 0.4) / (FROST / 1000);
    function grow(x, y, angle, length, depth, dist) {
      const n = Math.max(2, Math.round(length / (h * (depth ? 0.07 : 0.17))));
      const step = length / n;
      for (let i = 0; i < n; i++) {
        const a = angle + rand(-0.22, 0.22);
        const x2 = x + Math.cos(a) * step, y2 = y + Math.sin(a) * step;
        segs.push({ x, y, x2, y2, d: dist, len: step, depth });
        dist += step;
        if (depth < 2 && i > 0 && Math.random() < (depth ? 0.45 : 0.6)) {
          const side = Math.random() < 0.5 ? -1 : 1;
          grow(x, y, angle + side * TAU / 6, h * (depth ? rand(0.1, 0.18) : rand(0.28, 0.5)), depth + 1, dist);
          if (!depth && Math.random() < 0.3) grow(x, y, angle - side * TAU / 6, h * rand(0.16, 0.28), depth + 1, dist);
        }
        x = x2; y = y2;
      }
    }
    grow(word.x - h * 0.15, word.y + h * 0.56, rand(-0.05, 0.05), word.w + h * 0.3, 0, 0);
    const width = [1.5, 1, 0.7];
    return {
      crack: Infinity,
      draw(t) {
        let alpha = 1, flash = 0;
        if (t > this.crack) {
          const k = (t - this.crack) / 520;
          if (k >= 1) return false;
          flash = Math.max(0, 1 - k * 4);
          alpha = 1 - ease(k);
        }
        const reach = t / 1000 * speed;
        let tip = null;
        for (const pass of [0, 1]) {
          ctx.globalAlpha = alpha * (pass ? 0.95 : 0.22 + flash * 0.35);
          ctx.strokeStyle = pass ? ink.line : ink.glow;
          for (const s of segs) {
            const p = clamp((reach - s.d) / s.len);
            if (!p) continue;
            ctx.lineWidth = width[s.depth] * (pass ? 1 : 4.5) + (pass ? flash : 0);
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            const x = s.x + (s.x2 - s.x) * p, y = s.y + (s.y2 - s.y) * p;
            ctx.lineTo(x, y);
            ctx.stroke();
            if (!s.depth && p < 1) tip = { x, y };
          }
        }
        if (tip && alpha === 1) glint(tip.x, tip.y, h * 0.09, 1);
        ctx.globalAlpha = 1;
      },
    };
  }

  // A soft point of light with four thin rays.
  function glint(x, y, size, alpha, turn = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.globalAlpha = alpha * 0.5;
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.2);
    halo.addColorStop(0, ink.glow);
    halo.addColorStop(1, `${ink.glow}00`);
    ctx.fillStyle = halo;
    ctx.fillRect(-size * 2.2, -size * 2.2, size * 4.4, size * 4.4);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ink.star;
    for (const [w, l] of [[size * 0.16, size * 1.9], [size * 0.1, size * 1.1]]) {
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.moveTo(0, -l); ctx.lineTo(w, 0); ctx.lineTo(0, l); ctx.lineTo(-w, 0);
        ctx.closePath();
        ctx.fill();
        ctx.rotate(TAU / 4);
      }
      ctx.rotate(TAU / 8);
    }
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // A six-armed snowflake with two pairs of side branches on every arm.
  function crystal(r, line) {
    ctx.lineWidth = line;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6, c = Math.cos(a), s = Math.sin(a);
      ctx.moveTo(0, 0); ctx.lineTo(c * r, s * r);
      for (const [at, len] of [[0.45, 0.32], [0.72, 0.22]]) {
        const bx = c * r * at, by = s * r * at;
        for (const side of [-1, 1]) {
          const b = a + side * TAU / 6;
          ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(b) * r * len, by + Math.sin(b) * r * len);
        }
      }
    }
    ctx.stroke();
  }

  // The frozen letters crack: a couple of shards per letter and a few snowflakes.
  function shatter(chars) {
    const pieces = [], flakes = [];
    chars.forEach((char, i) => {
      if (!char.textContent.trim()) return;
      const r = local(char.getBoundingClientRect());
      const cx = r.x + r.w / 2, cy = r.y + r.h * 0.55, s = r.h;
      for (let k = 0; k < 2; k++) {
        const size = s * rand(0.07, 0.13);
        pieces.push({
          x: cx + rand(-0.3, 0.3) * r.w, y: cy + rand(-0.25, 0.25) * s,
          vx: rand(-55, 55), vy: rand(-70, -15), spin: rand(-6, 6), turn: rand(0, TAU),
          pts: [0, 1, 2].map(j => [Math.cos(j * TAU / 3 + rand(-0.5, 0.5)) * size * rand(0.6, 1.2), Math.sin(j * TAU / 3 + rand(-0.5, 0.5)) * size * rand(0.6, 1.2)]),
          life: rand(700, 1000),
        });
      }
      if (i % 2 === 0) {
        flakes.push({
          x: cx, y: cy, r: Math.max(4, s * rand(0.07, 0.12)), vy: rand(22, 40), sway: rand(6, 14), phase: rand(0, TAU),
          spin: rand(-1.2, 1.2), turn: rand(0, TAU), life: rand(1900, 2600), delay: i * 18,
        });
      }
    });
    return {
      draw(t) {
        let alive = false;
        const sec = t / 1000;
        for (const p of pieces) {
          const k = t / p.life;
          if (k >= 1) continue;
          alive = true;
          ctx.save();
          ctx.translate(p.x + p.vx * sec, p.y + p.vy * sec + 240 * sec * sec);
          ctx.rotate(p.turn + p.spin * sec);
          ctx.globalAlpha = 1 - k * k;
          ctx.beginPath();
          ctx.moveTo(...p.pts[0]); ctx.lineTo(...p.pts[1]); ctx.lineTo(...p.pts[2]);
          ctx.closePath();
          ctx.fillStyle = ink.shard;
          ctx.fill();
          ctx.strokeStyle = ink.line;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        }
        for (const f of flakes) {
          const age = t - f.delay, k = age / f.life;
          if (k >= 1) continue;
          alive = true;
          if (k < 0) continue;
          const fs = age / 1000;
          ctx.save();
          ctx.translate(f.x + Math.sin(f.phase + fs * 2.4) * f.sway, f.y + f.vy * fs);
          ctx.rotate(f.turn + f.spin * fs);
          const fade = Math.min(1, k / 0.12) * (1 - Math.max(0, (k - 0.55) / 0.45));
          ctx.strokeStyle = ink.glow;
          ctx.globalAlpha = fade * 0.35;
          crystal(f.r, 3);
          ctx.strokeStyle = ink.line;
          ctx.globalAlpha = fade;
          crystal(f.r, 1);
          ctx.restore();
        }
        return alive;
      },
    };
  }

  // The star crosses the new words, leaving a short trail of ice dust.
  function sweep(from, to, y, size) {
    const dust = [];
    let last = 0;
    return {
      draw(t) {
        const k = clamp(t / SWEEP), x = from + (to - from) * ease(k);
        if (k < 1 && t - last > 28) {
          last = t;
          dust.push({ x, y: y + rand(-0.4, 0.4) * size, born: t, vy: rand(8, 26), vx: rand(-10, 4), r: rand(0.7, 1.6) });
        }
        let alive = k < 1;
        for (const d of dust) {
          const a = 1 - (t - d.born) / 700;
          if (a <= 0) continue;
          alive = true;
          const s = (t - d.born) / 1000;
          ctx.globalAlpha = a * 0.9;
          ctx.fillStyle = ink.line;
          ctx.beginPath();
          ctx.arc(d.x + d.vx * s, d.y + d.vy * s, d.r, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        const out = clamp((t - SWEEP) / 380);
        if (out < 1) {
          alive = true;
          const grow = Math.min(1, t / 160);
          glint(x, y, size * grow * (1 - out * 0.7), 1 - out, t / 900);
        }
        return alive;
      },
    };
  }

  // ---- The cycle. ----
  function schedule() {
    clearTimeout(timer);
    if (phrases.length > 1 && !stopped()) timer = setTimeout(next, HOLD);
  }

  function later(id, ms, fn) {
    setTimeout(() => { if (id === run) fn(); }, ms);
  }

  function next() {
    if (busy || stopped()) return schedule();
    busy = true;
    const id = ++run;
    fit();
    const current = stage.querySelector('.title-rotator-word');
    const outChars = current ? [...current.children] : [];
    const word = local(stage.getBoundingClientRect());
    const fern = add(frost(word));
    // Each letter freezes when the frost reaches it.
    outChars.forEach(char => {
      const r = local(char.getBoundingClientRect());
      char.style.animationDelay = `${Math.round(clamp((r.x - word.x) / word.w) * FROST * 0.85)}ms`;
    });
    current?.classList.add('is-freezing');
    index = (index + 1) % phrases.length;
    const text = phrases[index];

    later(id, FROST + CRACK, () => {
      fern.crack = performance.now() - fern.start;
      current?.classList.add('is-shattering');
      add(shatter(outChars));
    });

    later(id, FROST + CRACK + SHATTER, () => {
      // The old words are gone and the new ones still invisible: resize at once
      // so the star can follow the final position of every letter.
      stage.style.transition = 'none';
      stage.style.width = `${Math.ceil(measure(text))}px`;
      void stage.offsetWidth;
      stage.style.transition = '';
      const incoming = letters(text);
      incoming.classList.add('is-waiting');
      stage.replaceChildren(incoming);
      fit();
      const chars = [...incoming.children];
      const span = local(incoming.getBoundingClientRect());
      const from = span.x - span.h * 0.2, to = span.x + span.w + span.h * 0.15;
      chars.forEach(char => {
        const r = local(char.getBoundingClientRect());
        const k = clamp((r.x + r.w / 2 - from) / (to - from));
        char.style.animationDelay = `${Math.round((1 - (1 - k) ** (1 / 3)) * SWEEP)}ms`;
      });
      incoming.classList.replace('is-waiting', 'is-crystallising');
      add(sweep(from, to, span.y + span.h * 0.5, span.h * 0.2));
      later(id, SWEEP + CRYSTAL, () => {
        incoming.classList.remove('is-crystallising');
        chars.forEach(char => { char.style.animationDelay = ''; });
        busy = false;
        schedule();
      });
    });
  }

  function sync() {
    if (stopped()) {
      clearTimeout(timer);
      if (reduced.matches || document.body.dataset.journeyMotion === 'paused') {
        run++; index = 0; busy = false; clearEffects(); settle(phrases[0]);
      }
    } else if (!busy) schedule();
  }

  settle(phrases[0]);
  root.classList.add('is-ready');
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(root);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-journey-motion'] });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', () => { if (!busy) settle(phrases[index]); });
  document.fonts?.ready.then(() => { if (!busy) settle(phrases[index]); });
}
