// npm run test:browser -- --chrome <Chrome executable> [--url <built-site URL>]
// Without --url, serves source with Vite: this test never requires dist/.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'vite';
import { parseArgs } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { sampleContrast } from './contrast-samples.mjs';
const { values } = parseArgs({ options: {
  url: { type: 'string' }, chrome: { type: 'string' }, report: { type: 'string' },
  audit: { type: 'boolean', default: false },
} });
const server = values.url ? null : await createServer({ server: { host: '127.0.0.1', port: 0 } });
await server?.listen();
const base = values.url || server.resolvedUrls.local[0];
const browser = await chromium.launch({ headless: true, ...(values.chrome ? { executablePath: values.chrome } : {}) });
const rows = [];
try {
  const phone = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const home = await phone.newPage();
  const sceneRequests = [];
  home.on('request', request => {
    if (/landscape-scene|three(?:\.module|\.js|-)/.test(request.url())) sceneRequests.push(request.url());
  });
  await home.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await home.locator('.horizon-landscape canvas').count(), 0);
  await home.waitForTimeout(2000);
  assert.deepEqual(sceneRequests, [], 'Reduced motion must keep the mobile poster');
  await phone.close();
  for (const theme of ['light', 'dark']) for (const route of ['', 'estudio', 'negocios', 'invitaciones', 'bodas', 'cumpleanos', 'eventos', 'temporada']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('nordra-theme', theme), theme);
    const page = await context.newPage();
    await page.goto(`${base.replace(/\/$/, '')}/${route}?motion=paused`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Render offscreen content too. Otherwise content-visibility:auto leaves
    // blank pixels in full-page background samples below the current viewport.
    await page.addStyleTag({ content: '* { content-visibility: visible !important; }' });
    const small = await page.evaluate(() => {
      const nodes = [...document.body.querySelectorAll('*')];
      return nodes.filter(el => !el.closest('.nordra-phone,.invitation-art,[aria-hidden="true"],script,style,noscript') && el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && [...el.childNodes].some(n => n.nodeType === 3 && /[\p{L}\p{N}]/u.test(n.textContent)))
        .map(el => ({ tag: el.tagName, classes: el.className, text: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(), size: parseFloat(getComputedStyle(el).fontSize) }))
        .filter(el => el.size < 12);
    });
    const result = await new AxeBuilder({ page }).withRules(['color-contrast']).exclude('.nordra-phone').exclude('.invitation-art').analyze();
    const smallTargets = await page.evaluate(() => {
      const targets = document.querySelectorAll('a[href],button,summary,select,input,textarea,[role="button"],[role="tab"]');
      return [...targets].filter(el => !el.matches(':disabled') && !el.closest('[inert]') &&
        el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })).filter(el => {
        const boxes = [el, ...el.labels || []].map(node => node.getBoundingClientRect());
        return !boxes.some(box => box.width >= 44 && box.height >= 44);
      }).map(el => [el.tagName,el.className,el.textContent.trim().slice(0,60)]);
    });
    if (!values.audit) assert.deepEqual(smallTargets, [], route + ': mobile tap targets must be 44×44');
    const contrast = result.violations.flatMap(v => v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary, checks: n.any })));
    const uncertain = result.incomplete.flatMap(v => v.nodes.map(n => ({ target: n.target, html: n.html, checks: n.any })));
    const sampled = await sampleContrast(page, uncertain);
    const sampledFailures = sampled.filter(s => s.ratio < s.required);
    rows.push({ route: route || 'index', theme, small, contrast, uncertain, sampled, sampledFailures });
    console.log(`${route || 'index'} ${theme}: ${small.length} small text, ${contrast.length} axe contrast violations, ${sampledFailures.length} sampled contrast violations`);
    if (!route && !values.audit) {
      await page.getByRole('link', { name: 'Ver sus invitaciones' }).click();
      await page.waitForURL('**/invitaciones#clientes-reales');
      await page.waitForFunction(() => {
        const destination = document.querySelector('.page-navigation-frame.is-ready')?.contentDocument ?? document;
        const heading = destination.querySelector('#clientes-reales h2');
        if (!heading) return false;
        const { top, bottom } = heading.getBoundingClientRect();
        return top < innerHeight && bottom > 0;
      });
    }
    await context.close();
  }
  if (values.report) { fs.mkdirSync(path.dirname(values.report), { recursive: true }); fs.writeFileSync(values.report, JSON.stringify(rows, null, 2)); }
  if (!values.audit) assert.deepEqual(rows.filter(r => r.small.length || r.contrast.length || r.sampledFailures.length), [], 'Commercial text must be >=12px and meet WCAG AA contrast (4.5:1 normal; 3:1 large).');
  for (const [date, expected] of [['2026-11-01','posadas'],['2026-12-20','fin-de-ano'],['2026-09-15','halloween']]) {
    const context = await browser.newContext({ viewport:{width:375,height:812},reducedMotion:'reduce' });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date(`${date}T12:00:00-06:00`));
    await page.goto(base.replace(/\/$/,'')+'/invitaciones#temporadas');
    await page.waitForSelector(`.season-card[data-season-current][data-season="${expected}"]`);
    await context.close();
  }
  const noJs = await browser.newContext({javaScriptEnabled:false});
  const fallback = await noJs.newPage();
  await fallback.goto(base.replace(/\/$/,'')+'/invitaciones');
  assert.equal(await fallback.locator('#temporadas .season-card a').count(),3);
  await noJs.close();
  console.log('Season gallery: three visitor dates and no-JS links passed');
} finally { await browser.close(); await server?.close(); }
