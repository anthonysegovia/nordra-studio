// Offline transparent curtains. Keep the seven commercial palettes in sync with motion.js.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const source = readFileSync('src/site/scripts/motion.js', 'utf8');
const palettes = [...source.matchAll(/cyan=vec3\(([^)]+)\),?\s*;?\s*blue=vec3\(([^)]+)\),?\s*;?\s*violet=vec3\(([^)]+)\)/g)]
  .map(match => match.slice(1).map(rgb => rgb.split(',').map(Number)));
if (palettes.length !== 7) throw new Error('Expected seven aurora palettes');
const width = 840, height = 546;
for (const [index, colors] of palettes.entries()) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let x = 0; x < width; x++) {
    const u = x / width;
    const folds = Math.sin(u * 11 + 1.3 * Math.sin(u * 5));
    const threads = (0.5 + 0.5 * Math.cos(u * 385 + 5 * folds)) ** 3;
    for (let y = 0; y < height; y++) {
      const v = y / height;
      let light = 0, altitude = 0;
      for (let layer = 0; layer < 2; layer++) {
        const edge = 0.55 + layer * 0.12 + 0.11 * Math.sin(u * 6 + layer) + 0.05 * Math.sin(u * 15 + layer);
        const h = edge - v;
        const reach = 0.08 + 0.13 * threads;
        const glow = Math.exp(-Math.abs(h) * (h < 0 ? 85 : 1 / reach));
        const weight = glow * (0.39 + threads * 0.55) * (1 - layer * 0.44);
        altitude += weight * Math.max(0, Math.min(1, h / 0.26));
        light += weight;
      }
      const hue = Math.min(1.999, 1.7 * altitude / Math.max(light, 0.0001) + 0.25 * u);
      const k = Math.floor(hue), blend = hue - k;
      const offset = (x + y * width) * 4;
      for (let c = 0; c < 3; c++) pixels[offset + c] = 255 * (colors[k][c] * (1 - blend) + colors[k + 1][c] * blend);
      pixels[offset + 3] = 255 * Math.min(0.81, light * Math.sin(Math.PI * u) ** 0.75);
    }
  }
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pixel_format', 'rgba',
    '-video_size', width + 'x' + height, '-i', 'pipe:0', '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '88',
    'public/nordra/v541/assets/aurora-mobile-' + index + '.webp'], { input: pixels });
  if (result.status !== 0) throw new Error(String(result.stderr));
}
