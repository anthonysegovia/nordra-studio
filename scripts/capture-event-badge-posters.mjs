// npm run dev -- --port 5198, then node scripts/capture-event-badge-posters.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { launch, profile, instrument } from './event-badge-browser-support.mjs';

const url = process.env.BADGE_URL || 'http://127.0.0.1:5198';
const output = path.resolve('public/artwork/event-badge');
fs.mkdirSync(output, { recursive: true });
const browser = await launch();
try {
  for (const language of ['es', 'en']) for (const [format, viewport] of Object.entries({ mobile: { width: 390, height: 664 }, desktop: { width: 1440, height: 900 }, wide: { width: 2560, height: 1080 } })) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport, hasTouch: format === 'mobile', locale: 'es-MX', deviceScaleFactor: format === 'mobile' ? 2 : 1 });
      await profile(context);
      const page = await context.newPage();
      await instrument(page);
      await page.goto(`${url}/${language === 'en' ? 'en/' : ''}eventos?theme=${theme}`);
      if (format === 'mobile') await page.locator('[data-badge-start]').click();
      await page.waitForFunction(() => window.__badge);
      // Additive RGB cannot be represented faithfully in a transparent WebP.
      // Capture it already composited over the exact CSS atmosphere instead.
      await page.addStyleTag({ content: 'body *{visibility:hidden!important}.badge-hero,.badge-hero *{visibility:visible!important}.badge-hero>.copy,.badge-hero>.copy *,.badge-controls,.badge-controls *,.badge-poster,.badge-poster *,.badge-hero>.grain,.badge-hero>.vignette,.badge-hero>.caption,.badge-hero>.caption *,.badge-motion{visibility:hidden!important}.badge-hero .stage-wrap{mask-image:none!important;-webkit-mask-image:none!important}' });
      await page.locator('#badge-stage').scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        window.__badge.poster();
        for (const animation of document.querySelector('.badge-hero').getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = 0;
        }
      });
      const buffer = await page.locator('#badge-stage').screenshot();
      if (format === 'mobile') assert((await sharp(buffer).metadata()).width >= 780);
      let encoded;
      for (const quality of [86, 80, 74, 68, 60]) {
        encoded = await sharp(buffer).webp({ quality, effort: 6 }).toBuffer();
        if (encoded.length <= 150000) break;
      }
      assert(encoded.length <= 150000, 'Poster exceeds 150 KB');
      const directory = language === 'en' ? path.join(output, 'en') : output;
      fs.mkdirSync(directory, { recursive: true });
      const file = path.join(directory, `badge-poster-${theme}-${format}.webp`);
      fs.writeFileSync(file, encoded);
      console.log(language, path.basename(file), encoded.length);
      await context.close();
    }
  }
} finally { await browser.close(); }
