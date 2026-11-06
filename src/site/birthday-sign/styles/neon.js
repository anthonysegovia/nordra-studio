// Brick wall, old posters and filament bulbs load only with Neon.
export function paintWorld(c,dark,r,{W,H,copy}){
  const bw = W < 700 ? 62 : 88, bh = W < 700 ? 22 : 30, m = W < 700 ? 3 : 4;
  c.fillStyle = dark ? '#121020' : '#dccbab'; c.fillRect(0, 0, W, H);
  const bricks = [];
  for (let y = 0, row = 0; y < H + bh; y += bh + m, row++) {
    for (let x = row % 2 ? -bw / 2 : 0; x < W + bw; x += bw + m) {
      const v = r();
      c.fillStyle = dark ? `hsl(${248 + (r() - .5) * 26} 20% ${13 + v * 6}%)` : `hsl(${38 + (r() - .5) * 8} ${30 + v * 18}% ${89 + v * 6}%)`;
      c.beginPath(); c.roundRect(x, y, bw, bh, 2.5); c.fill();
      c.fillStyle = dark ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.5)'; c.fillRect(x + 2, y, bw - 4, 1.5);
      c.fillStyle = dark ? 'rgba(0,0,0,.3)' : 'rgba(120,90,50,.14)'; c.fillRect(x + 2, y + bh - 1.5, bw - 4, 1.5);
      for (let i = 0; i < 22; i++) { c.fillStyle = dark ? `rgba(255,255,255,${r() * .04})` : `rgba(110,80,40,${r() * .08})`; c.fillRect(x + r() * bw, y + r() * bh, 1.2, 1.2); }
      bricks.push([x, y, bw, bh]);
    }
  }
  posters(c, dark, r, W, H, copy);
  return bricks;
}
export function garlandWorld(n,w,y,small,{el,gsvg}){
  const bulbs = [];
  for (let i = 0; i < n; i++) {
    const x = (i + .5) * w / n, yy = y(x);
    const g = el('g', { class: 'bulb', style: `--sw:${3.4 + (i % 3) * .7}s;--sd:${-(i * .37) % 2}s` }, gsvg);
    el('rect', { class: 'socket', x: x - 3.2, y: yy, width: 6.4, height: 7, rx: 1.2 }, g);
    el('path', { class: 'glass', d: `M${x - 4.2} ${yy + 7}C${x - 9} ${yy + 13} ${x - 6} ${yy + 24} ${x} ${yy + 24}C${x + 6} ${yy + 24} ${x + 9} ${yy + 13} ${x + 4.2} ${yy + 7}Z` }, g);
    bulbs.push(g);
  }
  return bulbs;
}
function posters(c, dark, r, W, H, copy){
  const items = [[copy.posterParty, '#ff4fa3'], [copy.posterDJ, '#3cc6ff'], ['24·07', '#ffd84a'], ['KARAOKE', '#22f0bd']];
  items.forEach(([txt, col], k) => {
    const x = W * [.08, .5, .93, .34][k], y = H * [.84, .08, .64, .95][k], w = W < 700 ? 90 : 150, h = w * 1.3, a = (r() - .5) * .3;
    c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = dark ? .055 : .08;
    c.beginPath(); c.moveTo(-w / 2, -h / 2); for (let q = 0; q <= 8; q++) c.lineTo(-w / 2 + w * q / 8, -h / 2 + (r() - .5) * 8); c.lineTo(w / 2, h / 2); for (let q = 8; q >= 0; q--) c.lineTo(-w / 2 + w * q / 8, h / 2 + (r() - .5) * 10); c.closePath();
    c.fillStyle = col; c.fill(); c.fillStyle = dark ? '#000' : '#fff'; c.font = `700 ${w * .2}px NocheSora`; c.textAlign = 'center'; c.fillText(txt, 0, 0, w * .9);
    c.restore();
  });
}

export const fonts=['Neonderthaw','Tilt Neon','Monoton','Yellowtail'];
