// Share image for /invitaciones (1200 × 630): the real Valentina y Sebastián cover in a phone, on warm Nordra light.
// Usage: node scripts/render-invitation-og.mjs --tools "<package.json with Playwright>". FFmpeg must be on PATH.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';

const { values } = parseArgs({ options: {
  tools: { type: 'string' },
  chrome: { type: 'string', default: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
  output: { type: 'string', default: 'public/nordra/v545/og-invitaciones.jpg' },
  work: { type: 'string', default: 'review/invitation-assets' },
} });
const require = createRequire(values.tools ? path.resolve(values.tools) : import.meta.url);
const { chromium } = require('playwright');
// Inline the files: a page set with setContent cannot load file:// resources.
const file = (name, type) => `data:${type};base64,${fs.readFileSync(name).toString('base64')}`;
fs.mkdirSync(values.work, { recursive: true });

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Sora;src:url(${file('public/fonts/sora/Sora-latin.woff2', 'font/woff2')}) format('woff2');font-weight:100 800}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Sora,sans-serif;color:#2d211a;
background:radial-gradient(60% 80% at 78% 40%,#f6cf9f 0%,transparent 70%),radial-gradient(50% 60% at 12% 100%,#efb69a80,transparent 70%),#fbf6ef}
.copy{position:absolute;left:84px;top:150px;width:600px}
.eyebrow{font-size:17px;letter-spacing:.2em;color:#8a5a3e;margin:0 0 22px}
h1{font-size:76px;line-height:1.02;letter-spacing:-.05em;font-weight:500;margin:0}
p{font-size:24px;line-height:1.5;color:#6b5546;margin:26px 0 0;max-width:470px}
.logo{position:absolute;left:84px;bottom:58px;height:54px}
.phone{position:absolute;right:130px;top:24px;width:276px;height:584px;padding:8px;border-radius:46px;background:#1f1a16;box-shadow:0 40px 80px -30px #5a3a2290;transform:rotate(4deg)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:38px;display:block}
</style><div class="copy"><p class="eyebrow">MONTERREY · TODO MÉXICO</p><h1>Invitaciones digitales</h1><p>Con confirmación de asistencia y panel de invitados.</p></div>
<img class="logo" src="${file('public/nordra/v541/assets/logo-original.webp', 'image/webp')}" alt="">
<div class="phone"><img src="${file('public/nordra/v541/assets/wedding-live-cover.webp', 'image/webp')}" alt=""></div>`;

const browser = await chromium.launch({ executablePath: values.chrome });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = path.join(values.work, 'og-invitaciones.png');
  await page.screenshot({ path: png });
  const run = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '3', values.output]);
  if (run.status !== 0) throw new Error(run.stderr.toString());
  console.log(values.output, fs.statSync(values.output).size);
} finally { await browser.close(); }
