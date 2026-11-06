export function paintWorld(c, dark, r, context){
const {W,H,css,star4}=context;
const w = 'xv', rects = [];

    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, css('--xv-sky1') || '#0b0e2c'); g.addColorStop(1, css('--xv-sky2') || '#251a4f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const m = c.createRadialGradient(W * .78, H * .18, 0, W * .78, H * .18, W * .3); m.addColorStop(0, dark ? 'rgba(220,210,255,.28)' : 'rgba(255,255,255,.8)'); m.addColorStop(1, 'transparent'); c.fillStyle = m; c.fillRect(0, 0, W, H);
    for (let i = 0; i < (dark ? 260 : 110); i++) { const s = r() * (dark ? 1.6 : 2.4) + .3; c.fillStyle = dark ? `rgba(255,255,255,${.3 + r() * .7})` : `rgba(140,110,220,${.2 + r() * .4})`; if (s > 1.4) star4(c, r() * W, r() * H, s * 2.2); else { c.beginPath(); c.arc(r() * W, r() * H, s, 0, 6.3); c.fill(); } }
    // XV · 8 · cortinas recogidas con lazos dorados
    for (const side of [0, 1]) {
      const cw = Math.max(46, W * .08), tieY = H * .84, x0 = side ? W : 0, dir = side ? -1 : 1;
      c.save(); c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + dir * cw * 1.5, 0); c.quadraticCurveTo(x0 + dir * cw * 1.1, tieY * .6, x0 + dir * cw * .42, tieY); c.quadraticCurveTo(x0 + dir * cw * .9, tieY + (H - tieY) * .5, x0 + dir * cw * 1.15, H); c.lineTo(x0, H); c.closePath(); c.clip();
      for (let k = 0; k < 16; k++) { const fx = Math.min(x0, x0 + dir * cw * 1.6) + k * cw * 1.6 / 16, fg = c.createLinearGradient(fx, 0, fx + cw * .1, 0); fg.addColorStop(0, css('--xv-c1')); fg.addColorStop(.5, css('--xv-c2')); fg.addColorStop(1, css('--xv-c3')); c.fillStyle = fg; c.fillRect(fx, 0, cw * .1 + 1, H); }
      c.restore();
      const tx = x0 + dir * cw * .42; c.strokeStyle = '#d9b25a'; c.lineWidth = 4; c.beginPath(); c.ellipse(tx, tieY, cw * .32, 6, 0, 0, 6.3); c.stroke();
      c.fillStyle = '#d9b25a'; c.beginPath(); c.moveTo(tx - 5, tieY + 6); c.lineTo(tx + 5, tieY + 6); c.lineTo(tx + 9, tieY + 34); c.lineTo(tx - 9, tieY + 34); c.closePath(); c.fill();
      c.strokeStyle = '#a87a22'; c.lineWidth = 1; for (let q = -7; q <= 7; q += 3.5) { c.beginPath(); c.moveTo(tx + q * .6, tieY + 14); c.lineTo(tx + q, tieY + 34); c.stroke(); }
    }

return rects;
}
const STAR = (x, y, s) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
export function garlandWorld(n, w, y, small, context){
const {rand,el,gsvg}=context;
const out = [], wd = 'xv', rr = rand(11);

    for (let i = 0; i < n; i++) {
      const x = (i + .5) * w / n, yy = y(x), L = (small ? 18 : 30) + rr() * (small ? 34 : 70);
      const g = el('g', { class: 'bulb', style: `--sw:${4 + (i % 3) * .8}s;--sd:${-(i * .41) % 2}s` }, gsvg);
      el('path', { class: 'strand', d: `M${x} ${yy}V${yy + L}` }, g);
      el('path', { class: 'star', d: STAR(x, yy + L + 6, small ? 5 : 7) }, g);
      el('path', { class: 'star', d: STAR(x, yy + L * .5, small ? 3 : 4) }, g);
      out.push(g);
    }

return out;
}
export const fonts = ["Pinyon Script"];
