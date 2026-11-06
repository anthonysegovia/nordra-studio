export function paintWorld(c, dark, r, context){
const {W,H,css,star4}=context;
const w = 'espacio', rects = [];

    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, dark ? '#0b1033' : '#d7e6ff'); g.addColorStop(1, dark ? '#24145a' : '#efe4ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const neb = [[.3, .3, '#5a2a8c'], [.75, .65, '#1b4a8a']]; for (const [nx, ny, col] of neb) { const n = c.createRadialGradient(W * nx, H * ny, 0, W * nx, H * ny, W * .35); n.addColorStop(0, dark ? col + 'aa' : 'rgba(255,255,255,.7)'); n.addColorStop(1, 'transparent'); c.fillStyle = n; c.fillRect(0, 0, W, H); }
    if (!dark) for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(r() * W, r() * H * .8, 60 + r() * 90, 14 + r() * 14, 0, 0, 6.3); c.fill(); }
    for (let i = 0; i < (dark ? 240 : 60); i++) { c.fillStyle = dark ? `rgba(255,255,255,${.3 + r() * .7})` : `rgba(90,110,200,${.25 + r() * .35})`; const s = r() * 1.5 + .3; if (s > 1.5) star4(c, r() * W, r() * H, s * 2.4); else { c.beginPath(); c.arc(r() * W, r() * H, s, 0, 6.3); c.fill(); } }
    const planet = (x, y, rad, a, b, ring) => { const p = c.createRadialGradient(x - rad * .35, y - rad * .35, rad * .1, x, y, rad); p.addColorStop(0, a); p.addColorStop(1, b); c.fillStyle = p; c.beginPath(); c.arc(x, y, rad, 0, 6.3); c.fill(); if (ring) { c.strokeStyle = 'rgba(255,220,150,.6)'; c.lineWidth = rad * .08; c.beginPath(); c.ellipse(x, y, rad * 1.7, rad * .38, -.3, 0, 6.3); c.stroke(); } };

return rects;
}
const STAR = (x, y, s) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
export function garlandWorld(n, w, y, small, context){
const {rand,el,gsvg}=context;
const out = [], wd = 'espacio', rr = rand(11);

    const cols = ['#ff7a3d', '#22d3c5', '#a57bff', '#ff5a5f'];
    for (let i = 0; i < n; i++) {
      const x = (i + .5) * w / n, yy = y(x), L = (small ? 16 : 26) + rr() * (small ? 30 : 60);
      const g = el('g', { class: 'bulb', style: `--sw:${5 + (i % 3) * .9}s;--sd:${-(i * .43) % 2}s` }, gsvg);
      el('path', { class: 'strand', d: `M${x} ${yy}V${yy + L}` }, g);
      if (i % 2) el('path', { class: 'star', d: STAR(x, yy + L + 7, small ? 6 : 8), style: 'fill:#ffd84a' }, g);
      else {
        const rad = (small ? 6 : 9) + rr() * 4;
        el('circle', { class: 'planet', cx: x, cy: yy + L + rad, r: rad, fill: cols[(i / 2 | 0) % 4] }, g);
        if (i % 4 === 0) el('ellipse', { cx: x, cy: yy + L + rad, rx: rad * 1.7, ry: rad * .4, fill: 'none', stroke: 'rgba(255,230,170,.85)', 'stroke-width': 1.6, transform: `rotate(-18 ${x} ${yy + L + rad})` }, g);
      }
      out.push(g);
    }

return out;
}
export const fonts = ["Fredoka"];
