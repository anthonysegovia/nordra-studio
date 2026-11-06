export function paintWorld(c, dark, r, context){
const {W,H,css,star4}=context;
const w = 'caja', rects = [];

    c.fillStyle = dark ? '#2a1226' : '#f1dbe3'; c.fillRect(0, 0, W, H);
    // papel de regalo: rombos dorados y arrugas suaves
    c.strokeStyle = dark ? 'rgba(226,192,122,.13)' : 'rgba(170,120,50,.16)'; c.lineWidth = 1;
    for (let k = -H; k < W + H; k += 46) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + H, H); c.stroke(); c.beginPath(); c.moveTo(k + H, 0); c.lineTo(k, H); c.stroke(); }
    c.fillStyle = dark ? 'rgba(226,192,122,.22)' : 'rgba(170,120,50,.22)';
    for (let x = 0; x < W + 46; x += 46) for (let y = 0; y < H + 46; y += 46) { c.beginPath(); c.arc(x + ((y / 46) % 2 ? 23 : 0), y, 1.6, 0, 6.3); c.fill(); }
    for (let i = 0; i < 26; i++) { c.fillStyle = r() < .5 ? `rgba(255,255,255,${dark ? .025 : .12})` : `rgba(60,10,40,${dark ? .08 : .035})`; c.beginPath(); const x = r() * W, y = r() * H; c.moveTo(x, y); for (let j = 0; j < 4; j++) c.lineTo(x + (r() - .5) * 420, y + (r() - .5) * 300); c.fill(); }

return rects;
}
const STAR = (x, y, s) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
export function garlandWorld(n, w, y, small, context){
const {rand,el,gsvg}=context;
const out = [], wd = 'caja', rr = rand(11);

    const cols = ['#7a2c5e', '#c9973e', '#f3c6d6', '#fffaf1'], m = Math.round(n * 1.7);
    for (let i = 0; i < m; i++) {
      const x0 = i * w / m + 3, x1 = (i + 1) * w / m - 3, xm = (x0 + x1) / 2;
      const g = el('g', { class: 'bulb flag', style: `--sw:${3 + (i % 4) * .5}s;--sd:${-(i * .29) % 2}s` }, gsvg);
      el('path', { class: 'flag-shape', d: `M${x0} ${y(x0)}L${x1} ${y(x1)}L${xm} ${y(xm) + (small ? 22 : 34)}Z`, fill: cols[i % 4] }, g);
    }

return out;
}
export const fonts = ["Pinyon Script"];
