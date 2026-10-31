// Offline capture of real screens for /invitaciones: the sample guest panel (Aurora and Boreal views),
// the Valentina y Sebastián invitation and the public seasonal designs. Nothing here ships in the bundle.
// Usage: node scripts/capture-invitation-assets.mjs --tools "<package.json with Playwright>" [--base https://nordrastudio.mx]
// FFmpeg must be on PATH.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';

const { values } = parseArgs({ options: {
  base: { type: 'string', default: 'https://nordrastudio.mx' },
  tools: { type: 'string' },
  chrome: { type: 'string', default: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
  output: { type: 'string', default: 'public/nordra/v545/assets' },
  work: { type: 'string', default: 'review/invitation-assets' },
} });
const require = createRequire(values.tools ? path.resolve(values.tools) : import.meta.url);
const { chromium } = require('playwright');
fs.mkdirSync(values.output, { recursive: true }); fs.mkdirSync(values.work, { recursive: true });

function webp(png, name, widths, quality = 80) {
  for (const width of widths) {
    const out = path.join(values.output, `${name}-${width}.webp`);
    const run = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', `scale=${width}:-2:flags=lanczos`, '-c:v', 'libwebp', '-quality', String(quality), out]);
    if (run.status !== 0) throw new Error(run.stderr.toString());
    console.log(out, fs.statSync(out).size);
  }
}

const browser = await chromium.launch({ executablePath: values.chrome });
try {
  // Guest panel: Invitados (Aurora) and Mesas (Boreal), with the panel's own sample data.
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce' });
  const panel = await desk.newPage();
  await panel.goto(`${values.base}/panel-boda.html`, { waitUntil: 'networkidle' });
  await panel.waitForTimeout(1200);
  const shot = async (name) => { const file = path.join(values.work, `${name}.png`); await panel.screenshot({ path: file }); return file; };
  webp(await shot('panel-aurora'), 'inv-panel-aurora', [760, 1280]);
  await panel.getByRole('button', { name: 'Mesas', exact: true }).click();
  await panel.waitForTimeout(1200);
  webp(await shot('panel-boreal'), 'inv-panel-boreal', [760, 1280]);
  await desk.close();

  // The guest's journey through the real invitation, at phone size.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await phone.newPage();
  await page.goto(`${values.base}/invitaciones/valentina-y-sebastian/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.activeElement?.blur());
  const phoneShot = async (name) => { const file = path.join(values.work, `${name}.png`); await page.screenshot({ path: file }); return file; };
  webp(await phoneShot('guest-cover'), 'inv-guest-cover', [390, 780]);
  await page.getByRole('button', { name: 'Abrir invitación' }).click();
  await page.waitForTimeout(2500);
  webp(await phoneShot('guest-open'), 'inv-guest-open', [390, 780]);
  for (const [id, name] of [['iv-style', 'guest-style'], ['iv-rsvp', 'guest-rsvp']]) {
    await page.evaluate(target => { const el = document.getElementById(target); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80); }, id);
    await page.waitForTimeout(1500);
    webp(await phoneShot(name), `inv-${name}`, [390, 780]);
  }
  await phone.close();

  // Public seasonal designs, as linked from /temporada.
  for (const [slug, name] of [['posada-pinata', 'season-posada'], ['celebra-2027', 'season-celebra'], ['halloween', 'season-halloween']]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(`${values.base}/demos/${slug}/index.html`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1800);
    await p.evaluate(() => document.activeElement?.blur());
    const file = path.join(values.work, `${name}.png`); await p.screenshot({ path: file });
    webp(file, `inv-${name}`, [390, 780]);
    await ctx.close();
  }
} finally { await browser.close(); }
