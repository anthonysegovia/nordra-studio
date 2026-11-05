import { walkGafete } from './gafete-real-journey.mjs';
import { chromium } from 'playwright';
import { preview } from 'vite';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const out = 'documentacion/gafete/final';
fs.mkdirSync(out, { recursive: true });
const server = await preview({
    preview: { host: '127.0.0.1', port: 5614, strictPort: true },
  }),
  base = 'http://127.0.0.1:5614';
const b = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  }),
  metrics = [];
const lum = (rgb) =>
  rgb
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
try {
  for (const width of [390, 1440]) {
    const ctx = await b.newContext({
      viewport: { width, height: width === 390 ? 844 : 1000 },
      deviceScaleFactor: 1,
      hasTouch: width === 390,
      recordVideo: {
        dir: out,
        size: { width, height: width === 390 ? 844 : 1000 },
      },
    });
    const p = await ctx.newPage();
    await p.addInitScript(() => {
      window.__gafeteLcp = [];
      new PerformanceObserver((list) =>
        window.__gafeteLcp.push(
          ...list.getEntries().map((e) => ({ time: e.startTime, url: e.url })),
        ),
      ).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const cdp = await ctx.newCDPSession(p);
    if (width === 390)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.goto(base + '/invitaciones/conexion-27/');
    await p.evaluate(() => document.fonts.ready);
    await p.locator('.back-face').evaluate((i) => i.decode());
    await p.waitForTimeout(500);
    const initial = await p.evaluate(() => ({
      images: performance
        .getEntriesByType('resource')
        .filter((e) => e.initiatorType === 'img' || /mesa-live/.test(e.name))
        .map((e) => ({
          url: new URL(e.name).pathname,
          encoded: e.encodedBodySize,
          transferred: e.transferSize,
          start: e.startTime,
          end: e.responseEnd,
        })),
      paint: performance
        .getEntriesByType('paint')
        .map((e) => ({ name: e.name, time: e.startTime })),
      lcp: window.__gafeteLcp,
    }));
    await p.screenshot({ path: `${out}/portada-${width}.png` });
    await p.evaluate(() => {
      window.__frames = [];
      let active = true;
      function frame(t) {
        if (document.body.dataset.phase === 'opening') window.__frames.push(t);
        if (active) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      document.addEventListener(
        'gafete:opened',
        () => {
          active = false;
        },
        { once: true },
      );
    });
    await p.locator('[data-open]').click();
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/giro-${width}.png` });
    await p.waitForFunction(() => document.body.dataset.phase === 'open');
    const frames = await p.evaluate(() => window.__frames);
    const gaps = frames
      .slice(1)
      .map((v, i) => v - frames[i])
      .sort((a, b) => a - b);
    const median = gaps[Math.floor(gaps.length / 2)],
      p95 = gaps[Math.floor(gaps.length * 0.95)];
    if (width === 390)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await p.waitForTimeout(800);
    await p.locator('#cuando').scrollIntoViewIfNeeded();
    await p.waitForTimeout(1400);
    await p.locator('#agenda').scrollIntoViewIfNeeded();
    await p.waitForTimeout(1800);
    await p.locator('#detalles').scrollIntoViewIfNeeded();
    await p.waitForTimeout(900);
    await p.locator('[data-card="0"]').click();
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(1100);
    await p.locator('#confirmacion').scrollIntoViewIfNeeded();
    await p.waitForTimeout(1000);
    await p.locator('[value=yes]').check();
    await p.waitForTimeout(2000);
    const video = p.video();
    await ctx.close();
    const videoPath = await video.path();
    execFileSync(
      process.env.FFMPEG_PATH || 'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-t',
        '19',
        '-vf',
        'tpad=stop_mode=clone:stop_duration=19',
        '-an',
        '-c:v',
        'libvpx-vp9',
        '-cpu-used',
        '4',
        '-crf',
        '32',
        '-b:v',
        '0',
        `${out}/recorrido-${width}.webm`,
      ],
      { stdio: 'ignore' },
    );
    const page = await b.newPage({
      viewport: { width, height: width === 390 ? 844 : 1000 },
    });
    await page.goto(base + '/invitaciones/conexion-27/');
    await page.locator('[data-open]').click();
    await page.waitForFunction(() => document.body.dataset.phase === 'open');
    await walkGafete(page);
    await page.screenshot({
      path: `${out}/interior-${width}.png`,
      fullPage: true,
    });
    await page
      .locator('#confirmacion')
      .screenshot({ path: `${out}/acceso-neutral-${width}.png` });
    const neutralHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    await page.locator('[value=yes]').check();
    await page.waitForTimeout(350);
    await page
      .locator('#confirmacion')
      .screenshot({ path: `${out}/acceso-si-${width}.png` });
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    if (width === 390) assert.ok(height <= 2600);
    // Measure against the actual composited background, not a palette swatch.
    const text = await page.evaluate(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      const selectors = [
        '.scene-intro>p',
        '.register-links a',
        '.access-brand',
        '.access-date',
        '.ribbon-menu a',
        '.venue-v2',
        '.program-ink p',
        '.fan-card',
        '.guest-data',
        '.access-question',
        '.ticket-word',
        '.sample-notice',
      ];
      return selectors.flatMap((s) =>
        [...document.querySelectorAll(s)].map((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const color = getComputedStyle(el).color;
          const rects = [];
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            for (let i = 0; i < node.length; i++) {
              if (!node.textContent[i].trim()) continue;
              range.setStart(node, i);
              range.setEnd(node, i + 1);
              const r = range.getBoundingClientRect();
              rects.push({
                x: r.x + scrollX + r.width * 0.4,
                y: r.y + scrollY + r.height * 0.4,
                w: r.width * 0.2,
                h: r.height * 0.2,
              });
            }
          }
          el.style.color = 'transparent';
          el.style.textShadow = 'none';
          return { selector: s, text: el.textContent, color, rects };
        }),
      );
    });
    await page.addStyleTag({
      content: '*{color:transparent!important;text-shadow:none!important}',
    });
    await page.waitForTimeout(250);
    const background = await page.screenshot({ fullPage: true });
    const raw = await sharp(background)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const contrast = text.map((t) => {
      const ink = lum(
        t.color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number),
      );
      let min = 99;
      for (const r of t.rects)
        for (
          let y = Math.max(0, Math.ceil(r.y));
          y < Math.min(raw.info.height, r.y + r.h);
          y += 3
        )
          for (
            let x = Math.max(0, Math.ceil(r.x));
            x < Math.min(raw.info.width, r.x + r.w);
            x += 3
          ) {
            const at = (y * raw.info.width + x) * 4,
              bg = lum([...raw.data.subarray(at, at + 3)]);
            min = Math.min(
              min,
              (Math.max(bg, ink) + 0.05) / (Math.min(bg, ink) + 0.05),
            );
          }
      return {
        selector: t.selector,
        text: t.text,
        minRatio: Math.round(min * 100) / 100,
      };
    });
    metrics.push({
      width,
      cpuSlowdown: width === 390 ? 4 : 1,
      initialImages: initial,
      medianFps: 1000 / median,
      p95FrameMs: p95,
      meanFps: ((frames.length - 1) * 1000) / (frames.at(-1) - frames[0]),
      height,
      neutralHeight,
      contrast,
    });
    await page.close();
    const ref = `documentacion/gafete/boceto/interior-${width}.png`,
      final = `${out}/interior-${width}.png`,
      h = Math.max(
        (await sharp(ref).metadata()).height,
        (await sharp(final).metadata()).height,
      );
    const title = Buffer.from(
      `<svg width="${width * 2 + 24}" height="80"><rect width="100%" height="100%" fill="#edf2f4"/><text x="20" y="50" font-family="Arial" font-size="24">Final</text><text x="${width + 44}" y="50" font-family="Arial" font-size="24">Boceto aprobado</text></svg>`,
    );
    await sharp({
      create: {
        width: width * 2 + 24,
        height: h + 80,
        channels: 3,
        background: '#e7ecef',
      },
    })
      .composite([
        { input: title, left: 0, top: 0 },
        { input: final, left: 0, top: 80 },
        { input: ref, left: width + 24, top: 80 },
      ])
      .png()
      .toFile(`${out}/comparacion-${width}.png`);
  }
  fs.writeFileSync(
    out + '/rendimiento-contraste.json',
    JSON.stringify(metrics, null, 2),
  );
  console.log(
    metrics.map((m) => ({
      width: m.width,
      fps: m.medianFps,
      p95: m.p95FrameMs,
      height: m.height,
      contrastFailures: m.contrast.filter((t) => t.minRatio < 4.5),
    })),
  );
  assert.ok(metrics.every((m) => m.medianFps >= (m.width === 390 ? 30 : 59)));
  assert.ok(metrics.every((m) => m.contrast.every((c) => c.minRatio >= 4.5)));
} finally {
  await b.close();
  await server.close();
}
