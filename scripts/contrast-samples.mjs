// Complement axe where gradients/photos prevent a computed-background result.
// Hide glyph fill only (no layout/color/background changes), then sample the
// rendered background under the actual text ranges. This is a regression check,
// not a substitute for visual review of moving backgrounds.
export async function sampleContrast(page, uncertain) {
  const targets = uncertain.filter(n => !n.checks.every(c => c.data?.messageKey === 'nonBmp')).map(n => n.target);
  const samples = await page.evaluate(targets => targets.flatMap(target => {
    if (target.length !== 1) throw Error('Unexpected iframe contrast target');
    const el = document.querySelector(target[0]);
    if (!el) throw Error(`Missing contrast target ${target[0]}`);
    const style = getComputedStyle(el), size = parseFloat(style.fontSize);
    let opacity = 1;
    for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    let left = 0, right = innerWidth;
    for (let node = el.parentElement; node; node = node.parentElement) {
      if (/hidden|clip|auto|scroll/.test(getComputedStyle(node).overflowX)) {
        const box = node.getBoundingClientRect(); left = Math.max(left, box.left); right = Math.min(right, box.right);
      }
    }
    const rects = [...el.childNodes].filter(n => n.nodeType === 3 && /[\p{L}\p{N}]/u.test(n.textContent)).flatMap(n => {
      const range = document.createRange(); range.selectNodeContents(n);
      return [...range.getClientRects()].filter(r => r.right > left && r.left < right).map(r => ({ x: Math.max(r.left, left) + scrollX, y: r.y + scrollY, width: Math.min(r.right, right) - Math.max(r.left, left), height: r.height }));
    });
    const colorCanvas = document.createElement('canvas'); colorCanvas.width = colorCanvas.height = 1;
    const colorContext = colorCanvas.getContext('2d'); colorContext.fillStyle = style.color; colorContext.fillRect(0, 0, 1, 1);
    const rgba = [...colorContext.getImageData(0, 0, 1, 1).data]; rgba[3] /= 255;
    return rects.length ? [{ target, color: style.color, rgba, opacity, rects, required: size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5 }] : [];
  }), targets);
  const hide = await page.addStyleTag({ content: '* { -webkit-text-fill-color: transparent !important; text-shadow: none !important; text-decoration-color: transparent !important; }' });
  let png;
  try { png = await page.screenshot({ fullPage: true, animations: 'disabled' }); }
  finally { await hide.evaluate(el => el.remove()); }
  return page.evaluate(async ({ png, samples }) => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
    const luminance = rgb => rgb.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return samples.map(sample => {
      const rgba = sample.rgba, alpha = rgba[3] * sample.opacity;
      let minimum = Infinity, background;
      for (const rect of sample.rects) for (const fy of [.2, .5, .8]) for (const fx of [.05, .25, .5, .75, .95]) {
        const x = Math.min(canvas.width - 1, Math.max(0, Math.round(rect.x + rect.width * fx)));
        const y = Math.min(canvas.height - 1, Math.max(0, Math.round(rect.y + rect.height * fy)));
        const bg = [...ctx.getImageData(x, y, 1, 1).data];
        const fg = rgba.slice(0, 3).map((v, i) => v * alpha + bg[i] * (1 - alpha));
        const a = luminance(fg), b = luminance(bg);
        const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        if (ratio < minimum) { minimum = ratio; background = { x, y, rgb: bg.slice(0, 3) }; }
      }
      return { target: sample.target, required: sample.required, ratio: minimum, color: sample.color, background };
    });
  }, { png: png.toString('base64'), samples });
}
