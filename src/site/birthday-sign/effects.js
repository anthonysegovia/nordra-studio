export function drawPiece(c, p, t, star4){
  c.save(); c.translate(p.x, p.y); c.rotate(p.rest ? p.r * .2 : p.r); c.fillStyle = p.c; c.globalAlpha = .9;
  if (p.kind === 'glitter') { c.globalAlpha = .45 + .55 * Math.abs(Math.sin(t / 90 + p.tw)); c.fillRect(-1.4, -1.4, 2.8, 2.8); }
  else if (p.kind === 'petal') { c.scale(1, .55 + .45 * Math.sin(t / 220 + p.tw)); c.beginPath(); c.ellipse(0, 0, p.w * 1.15, p.w * .72, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(-p.w * .3, -p.w * .2, p.w * .45, p.w * .25, 0, 0, 6.3); c.fill(); }
  else if (p.kind === 'star') star4(c, 0, 0, p.w * .95);
  else if (p.kind === 'meteor') { c.rotate(-p.r + .7); const g = c.createLinearGradient(-p.w * 3, 0, p.w, 0); g.addColorStop(0, 'rgba(255,190,110,0)'); g.addColorStop(1, '#ffb36b'); c.fillStyle = g; c.fillRect(-p.w * 3, -1.3, p.w * 4, 2.6); c.fillStyle = '#fff'; c.beginPath(); c.arc(p.w, 0, 1.9, 0, 6.3); c.fill(); }
  else c.fillRect(-p.w / 2, -p.h / 2, p.w, p.rest ? p.h * .6 : p.h);
  c.restore();
}

export function worldFx(c, t, lit, ctx){
let {world,still,body,W,H,sign0,star4,sparks,smokeP,shoot,lastShoot,emit}=ctx;
  const wd = world();
  sparks = sparks.filter(s => (s.age = t - s.t0) < s.life && s.age >= 0 || s.age < 0);
  for (const s of sparks) { if (s.age < 0) continue; const k = s.age / s.life; c.globalAlpha = 1 - k; c.fillStyle = s.c; if (s.kind === 'diamond') star4(c, s.x, s.y - k * 10, s.s * (1 - k * .4)); else { c.beginPath(); c.arc(s.x + s.vx * s.age / 16, s.y + s.vy * s.age / 16 + k * k * 34, s.s * (1 - k), 0, 6.3); c.fill(); } }
  c.globalAlpha = 1;
  if (still()) return;
  smokeP = smokeP.filter(p => t - p.t0 < p.life);
  if (wd === 'bar' && lit > .3) {                         // BAR · 4 · humo en el haz
    if (emit && smokeP.length < 14 && Math.random() < .05) smokeP.push({ x: sign0.x + (Math.random() - .5) * sign0.w, y: sign0.y + sign0.h * .5, r: 40 + Math.random() * 70, t0: t, life: 9000 + Math.random() * 5000, dx: (Math.random() - .5) * .02 });
    smokeP = smokeP.filter(p => t - p.t0 < p.life);
    for (const p of smokeP) { const k = (t - p.t0) / p.life, x = p.x + Math.sin(t / 2000 + p.r) * 30 + p.dx * (t - p.t0), y = p.y - k * sign0.h * 1.4, r = p.r * (1 + k), a = Math.sin(k * Math.PI) * .1 * lit; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,205,140,${a})`); g.addColorStop(1, 'rgba(255,205,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); }
  }
  if (wd === 'espacio') {                                  // ESPACIO · 5 · estrellas fugaces
    if (emit && t - lastShoot > 3200 && Math.random() < .012) { lastShoot = t; shoot.push({ x: Math.random() * W * .6, y: Math.random() * H * .3, t0: t, life: 900, ang: .42 + Math.random() * .3 }); }
    shoot = shoot.filter(s => t - s.t0 < s.life);
    const col = body.classList.contains('dark') ? '255,255,255' : '80,100,200';
    for (const s of shoot) { const k = (t - s.t0) / s.life, len = 150, d = k * W * .45, x = s.x + Math.cos(s.ang) * d, y = s.y + Math.sin(s.ang) * d, x0 = x - Math.cos(s.ang) * len, y0 = y - Math.sin(s.ang) * len; const g = c.createLinearGradient(x0, y0, x, y); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${(1 - k) * .9})`); c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x, y); c.stroke(); }
  }
Object.assign(ctx,{sparks,smokeP,shoot,lastShoot});
}
