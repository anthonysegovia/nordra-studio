export function paintWorld(c, dark, r, context){
const {W,H,css,star4}=context;
const w = 'bar', rects = [];

    c.fillStyle = dark ? '#160d07' : '#c9a273'; c.fillRect(0, 0, W, H);
    const rail = H * .8;
    for (let x = 0; x < W;) {
      const pw = (W < 700 ? 44 : 70) + r() * (W < 700 ? 30 : 50), v = r();
      c.fillStyle = dark ? `hsl(${22 + v * 8} 42% ${11 + v * 6}%)` : `hsl(${28 + v * 8} 46% ${58 + v * 10}%)`; c.fillRect(x, 0, pw - 2, rail);
      c.strokeStyle = dark ? 'rgba(0,0,0,.25)' : 'rgba(90,50,20,.14)'; c.lineWidth = 1;
      for (let k = 0; k < 9; k++) { const gx = x + 4 + r() * (pw - 10); c.beginPath(); c.moveTo(gx, 0); for (let y = 0; y < rail; y += 40) c.lineTo(gx + Math.sin(y / 70 + k) * 3, y); c.stroke(); }
      if (r() < .5) { c.strokeStyle = dark ? 'rgba(0,0,0,.35)' : 'rgba(90,50,20,.2)'; c.beginPath(); c.ellipse(x + pw / 2, r() * rail, 4, 10, 0, 0, 6.3); c.stroke(); }
      for (let y = 0; y < rail; y += 120) rects.push([x, y, pw - 2, Math.min(120, rail - y)]);
      x += pw;
    }
    // BAR · 10 · rombos de latón en los paneles
    c.strokeStyle = dark ? 'rgba(201,154,75,.4)' : 'rgba(130,90,30,.35)'; c.lineWidth = 1.2;
    for (let x = 70; x < W; x += 180) for (let y = 80; y < rail - 50; y += 150) { c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 11, y); c.lineTo(x, y + 18); c.lineTo(x - 11, y); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(x, y - 34); c.lineTo(x, y - 18); c.moveTo(x, y + 18); c.lineTo(x, y + 34); c.stroke(); }
    c.fillStyle = dark ? '#c99a4b' : '#a8803a'; c.fillRect(0, rail, W, 4);
    c.fillStyle = dark ? '#100904' : '#8a6440'; c.fillRect(0, rail + 4, W, H - rail);

return rects;
}
const STAR = (x, y, s) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
export function garlandWorld(n, w, y, small, context){
const {rand,el,gsvg}=context;
const out = [], wd = 'bar', rr = rand(11);

    for (let i = 0; i < n; i++) {
      const x = (i + .5) * w / n, yy = y(x);
      const g = el('g', { class: 'bulb', style: `--sw:${3.6 + (i % 3) * .6}s;--sd:${-(i * .37) % 2}s` }, gsvg);
      el('rect', { x: x - 3.4, y: yy, width: 6.8, height: 8, rx: 1, fill: '#a8803a' }, g);
      el('path', { class: 'edison', d: `M${x - 3.6} ${yy + 8}C${x - 8} ${yy + 16} ${x - 7} ${yy + 30} ${x} ${yy + 32}C${x + 7} ${yy + 30} ${x + 8} ${yy + 16} ${x + 3.6} ${yy + 8}Z` }, g);
      el('path', { class: 'filament', d: `M${x - 2} ${yy + 11}V${yy + 20}l1-2 1 2 1-2 1 2V${yy + 11}` }, g);
      out.push(g);
    }

return out;
}
export const fonts = ["Poiret One","Caveat"];
