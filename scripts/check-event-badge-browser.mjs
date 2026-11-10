import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launch, instrument, profile } from './event-badge-browser-support.mjs';

const url = process.env.BADGE_URL || 'http://127.0.0.1:5198';
const output = process.env.BADGE_EVIDENCE || path.join(os.tmpdir(), 'nordra-event-badge');
fs.mkdirSync(output, { recursive: true });
const results = [];
const browser = await launch();
async function pageFor(context) {
  const page = await context.newPage();
  // Vercel injects this endpoint only on hosting, outside the local build.
  await page.route('**/_vercel/insights/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.route('**/va.vercel-scripts.com/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  return page;
}
async function realTap(page, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  const box = await page.locator(selector).boundingBox();
  assert(box);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}
async function badgePoint(page) {
  return page.evaluate(() => {
    const bounds = window.__badge.bounds();
    const x = bounds.reduce((s, p) => s + p.x, 0) / 4;
    const y = bounds.reduce((s, p) => s + p.y, 0) / 4;
    return { x, y, hit: window.__badge.hit(x, y) };
  });
}
async function dragBadge(page, point, mobile) {
  if (mobile) {
    const session = await page.context().newCDPSession(page);
    const touch = (type, x) => session.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: point.y }] });
    await touch('touchStart', point.x);
    for (let step = 1; step <= 20; step++) await touch('touchMove', point.x + 75 * step / 20);
    await touch('touchEnd', point.x + 75);
    await session.detach();
  } else {
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x + 75, point.y, { steps: 20 });
    await page.mouse.up();
  }
}
try {
  if (process.env.BADGE_SUITE !== 'static') for (const viewport of [{ width: 1440, height: 900 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) for (const lang of ['es', 'en']) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport, locale: 'en-US' });
    await profile(context);
    await context.addInitScript(() => sessionStorage.setItem('nordra-badge-entered', '1'));
    const page = await pageFor(context);
    await instrument(page);
    await page.goto(`${url}/${lang === 'en' ? 'en/' : ''}eventos?theme=${theme}`);
    await page.waitForFunction(() => window.__badge?.state.entered);
    await page.evaluate(() => window.__badge.rest());
    const fit = await page.evaluate(() => {
      const points = window.__badge.bounds();
      const caption = document.querySelector('.badge-hero .caption').getBoundingClientRect();
      const stage = document.querySelector('#badge-stage').getBoundingClientRect();
      const actions = document.querySelector('.badge-hero .actions').getBoundingClientRect();
      const top = Math.min(...points.map(p => p.y)), bottom = Math.max(...points.map(p => p.y));
      return { scroll: scrollY, top, bottom, captionBottom: caption.bottom, gap: caption.top - bottom,
        lanyardSpace: top - stage.top, buttonsClear: Math.min(...points.map(p => p.x)) > actions.right,
        overflow: document.documentElement.scrollWidth > innerWidth,
        arrowGap: parseFloat(getComputedStyle(document.querySelector('.badge-hero .link')).columnGap) };
    });
    assert.equal(fit.scroll, 0);
    assert(fit.top >= 0 && fit.bottom <= viewport.height && fit.captionBottom <= viewport.height, JSON.stringify({ viewport, fit }));
    assert(fit.gap > 0 && fit.lanyardSpace > 80 && fit.buttonsClear && !fit.overflow, JSON.stringify({ viewport, fit }));
    assert.equal(fit.arrowGap, 14);
    await page.screenshot({ path: path.join(output, `round2-${lang}-${theme}-${viewport.width}x${viewport.height}-scroll0.png`) });
    results.push({ viewport, lang, theme, initialViewport: fit });
    await context.close();
  }
  if (process.env.BADGE_SUITE !== 'static') for (const lang of ['es', 'en']) for (const mobile of [false, true]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 664 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1, hasTouch: true, isMobile: mobile, locale: 'en-US' });
    await profile(context);
    const page = await pageFor(context);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await instrument(page);
    await page.goto(`${url}/${lang === 'en' ? 'en/' : ''}eventos?theme=${theme}`);
    await page.evaluate(() => document.fonts.ready);
    const title = (await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim();
    assert.equal(title, lang === 'en' ? 'Bring your people together' : 'Aquí empieza el encuentro');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow');
    if (mobile) {
      assert.equal(await page.evaluate(() => window.__webglContexts), 0);
      const poster = page.locator(`.badge-poster-${theme} img`);
      assert(await poster.evaluate(img => img.naturalWidth >= 780));
      await page.locator('#badge-stage').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `round2-${lang}-${theme}-390x664-poster.png`) });
      assert(await page.evaluate(() => document.querySelector('[data-badge-start]').getBoundingClientRect().top >= document.querySelector('#badge-stage').getBoundingClientRect().bottom), 'Motion control must clear the badge stage');
      await realTap(page, '[data-badge-start]');
      await page.locator('#badge-stage').scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() => window.__badge?.state.entered);
    await page.evaluate(() => {
      window.__captionFailures = [];
      window.__captionTimer = setInterval(() => {
        const label = document.querySelector('[data-badge-kind]');
        const style = getComputedStyle(label);
        if (!label.textContent.trim() || Number(style.opacity) < 1 || style.visibility !== 'visible') window.__captionFailures.push(label.outerHTML);
      }, 16);
    });
    await page.waitForTimeout(7000);
    const fps = await page.evaluate(() => { const frames = window.__badge.frames.filter(time => time > performance.now() - 4000); return (frames.length - 1) * 1000 / (frames.at(-1) - frames[0]); });
    if (!mobile) assert(fps > 50, `Expected >50 fps, received ${fps}`);
    // Establish an idle point without changing physics or interaction handlers.
    await page.waitForFunction(() => window.__badge.state.phase === 'idle');
    const point = await badgePoint(page);
    assert(point.hit, 'Badge center must be a ray hit');
    const kind = await page.locator('[data-badge-kind]').textContent();
    await page.touchscreen.tap(point.x, point.y);
    await page.waitForFunction(previous => document.querySelector('[data-badge-kind]').textContent !== previous, kind);
    await page.waitForFunction(() => window.__badge.state.phase === 'idle');
    const drag = await badgePoint(page);
    await dragBadge(page, drag, mobile);
    const turned = await page.evaluate(() => Math.abs(Math.sin(window.__badge.state.turn)));
    assert(turned > .1, 'Drag changes rotation');
    await page.mouse.move(0, 0);
    await page.waitForFunction(() => { const s = window.__badge.state; return Math.abs(s.turn - s.turnT) < .12 && Math.abs(s.turnV) < .35; });
    const fit = await page.evaluate(() => {
      const points = window.__badge.bounds(), caption = document.querySelector('.badge-hero .caption').getBoundingClientRect();
      const actions = document.querySelector('.badge-hero .actions').getBoundingClientRect();
      const left = Math.min(...points.map(p => p.x)), right = Math.max(...points.map(p => p.x));
      const top = Math.min(...points.map(p => p.y)), bottom = Math.max(...points.map(p => p.y));
      return { captionGap: caption.top - bottom, buttonsClear: right < actions.left || left > actions.right || top > actions.bottom || bottom < actions.top };
    });
    assert(fit.captionGap > 0, `Badge overlaps caption ${JSON.stringify(fit)}`);
    assert(fit.buttonsClear, 'Badge overlaps buttons');
    await page.screenshot({ path: path.join(output, `${lang}-${theme}-${mobile ? 'mobile' : 'desktop'}-live.png`) });
    await page.locator('[data-business-toggle]').click();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.__badge.state.running), false);
    const before = await page.evaluate(() => document.querySelector('#badge-stage canvas').toDataURL());
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => document.querySelector('#badge-stage canvas').toDataURL()), before, 'Paused canvas changed');
    assert(await page.locator(`.badge-poster-${theme}`).isVisible());
    assert.deepEqual(await page.evaluate(() => { clearInterval(window.__captionTimer); return window.__captionFailures; }), []);
    if (theme === 'light') assert.equal(await page.locator('.badge-hero .venue').isVisible(), false);
    await page.locator('#eventos-response-title').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${lang}-${theme}-${mobile ? 'mobile' : 'desktop'}-response.png`) });
    assert.equal(await page.evaluate(() => window.__badge.state.running), false);
    // Repeat visits skip the drop while preserving automatic reprints.
    await page.evaluate(() => { sessionStorage.setItem('nordra-journey', JSON.stringify({ paused: false })); });
    await page.goto(`${url}/${lang === 'en' ? 'en/' : ''}eventos?theme=${theme}&motion=playing`);
    if (mobile) { await realTap(page, '[data-badge-start]'); await page.locator('#badge-stage').scrollIntoViewIfNeeded(); }
    await page.waitForFunction(() => window.__badge?.state.entered);
    const repeated = await page.evaluate(() => window.__badge.state);
    assert.equal(repeated.phase, 'idle');
    assert.equal(repeated.stamp, 1);
    assert(Math.abs(repeated.drop) < .03);
    await page.locator('#eventos-response-title').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !window.__badge.state.running);
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide')));
    assert.equal(await page.locator('#badge-stage canvas').count(), 0, 'Page exit releases the canvas');
    assert.deepEqual(errors, []);
    results.push({ lang, mobile, theme, fps, fit, realTouch: true, errors });
    console.log(lang, mobile, theme, fps.toFixed(1));
    await context.close();
  }
  if (process.env.BADGE_SUITE !== 'motion') for (const mobile of [false, true]) for (const mode of ['reduced', 'cores', 'memory', 'saveData', 'paused']) for (const lang of ['es', 'en']) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 664 } : { width: 1440, height: 900 }, locale: 'en-US', reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
    await profile(context, { cores: mode === 'cores' ? 3 : 8, memory: mode === 'memory' ? 2 : 8, saveData: mode === 'saveData' });
    const page = await pageFor(context);
    await page.goto(`${url}/${lang === 'en' ? 'en/' : ''}eventos?theme=${theme}${mode === 'paused' ? '&motion=paused' : ''}`);
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => window.__webglContexts), 0, mode);
    assert.equal(await page.locator('#badge-stage canvas').count(), 0);
    const poster = page.locator(`.badge-poster-${theme} img`);
    assert(await poster.isVisible());
    assert.match(await poster.evaluate(img => img.currentSrc), new RegExp(`badge-poster-${theme}-${mobile ? 'mobile' : 'desktop'}.webp`));
    if (lang === 'en') assert.match(await poster.evaluate(img => img.currentSrc), /\/event-badge\/en\//);
    assert(await poster.evaluate(img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator('.badge-hero .hint').isVisible(), false);
    assert.equal(await page.locator('[data-badge-start]').isVisible(), false);
    results.push({ mode, lang, theme, mobile, webglContexts: 0 });
    await context.close();
  }
  if (process.env.BADGE_SUITE !== 'static') for (const transition of ['reduced', 'context-loss']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
    await profile(context);
    await context.addInitScript(() => sessionStorage.setItem('nordra-badge-entered', '1'));
    const page = await pageFor(context);
    await instrument(page);
    await page.goto(`${url}/en/eventos?theme=light`);
    await page.waitForFunction(() => window.__badge?.state.current === 1);
    if (transition === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.evaluate(() => document.querySelector('#badge-stage canvas').dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await page.waitForFunction(() => !document.querySelector('#badge-stage canvas'));
    assert.equal(await page.locator('[data-badge-kind]').textContent(), 'Conference', 'Fallback label must match the Conexión 27 portrait');
    assert(await page.locator('.badge-poster-light').isVisible());
    assert.equal(await page.locator('.badge-hero .hint').isVisible(), false);
    results.push({ transition, resetCaption: true, canvasReleased: true });
    await context.close();
  }
  fs.writeFileSync(path.join(output, `browser-${process.env.BADGE_SUITE || 'all'}-results.json`), JSON.stringify(results, null, 2));
} finally { await browser.close(); }
