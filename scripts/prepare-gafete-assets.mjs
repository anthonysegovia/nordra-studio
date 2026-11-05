import sharp from 'sharp';
import fs from 'node:fs';
const source = 'artwork-source/event-gafete-v1',
  out = 'public/artwork/event-gafete';
async function emit(
  name,
  input,
  widths,
  quality = 82,
  crop,
  alphaQuality = 90,
) {
  let b = fs.readFileSync(`${source}/${input}.webp`);
  if (crop) b = await sharp(b).extract(crop).toBuffer();
  for (const width of widths) {
    const f = `${out}/${name}-${width}.webp`;
    await sharp(b)
      .resize(width)
      .webp({ quality, alphaQuality, effort: 6 })
      .toFile(f);
    console.log(f, fs.statSync(f).size);
  }
}
await emit('mesa-live', 'mesa-calida-v2', [640, 1536], 58);
await emit('reverso-live', 'gafete-reverso', [480], 72);
await emit('reverso-live', 'gafete-reverso', [960], 60, undefined, 60);
for (const n of ['programa-html', 'abanico-html'])
  await emit(n, n, [780, 1536]);
await emit('frente-html', 'frente-html', [480, 960]);
await emit('acceso-html', 'frente-html', [700, 1400], 82, {
  left: 160,
  top: 490,
  width: 700,
  height: 1046,
});
await emit('boleto-html', 'boletos-html', [400, 800], 82, {
  left: 50,
  top: 560,
  width: 1440,
  height: 400,
});
await emit('boleto-si-html', 'boletos-html', [400, 800], 82, {
  left: 50,
  top: 110,
  width: 1440,
  height: 400,
});

for (const n of ['registro-impreso-v2', 'cordon-tejido-v2', 'cafe-v2'])
  await emit(n, n, [780, 1536]);
await emit('compartir', 'compartir', [1200]);
