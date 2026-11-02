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
    const contrast = result.violations.flatMap(v => v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary, checks: n.any })));
    const uncertain = result.incomplete.flatMap(v => v.nodes.map(n => ({ target: n.target, html: n.html, checks: n.any })));
    const sampled = await sampleContrast(page, uncertain);
    const sampledFailures = sampled.filter(s => s.ratio < s.required);
    rows.push({ route: route || 'index', theme, small, contrast, uncertain, sampled, sampledFailures });
    console.log(`${route || 'index'} ${theme}: ${small.length} small text, ${contrast.length} axe contrast violations, ${sampledFailures.length} sampled contrast violations`);
    await context.close();
  }
  if (values.report) { fs.mkdirSync(path.dirname(values.report), { recursive: true }); fs.writeFileSync(values.report, JSON.stringify(rows, null, 2)); }
  if (!values.audit) assert.deepEqual(rows.filter(r => r.small.length || r.contrast.length || r.sampledFailures.length), [], 'Commercial text must be >=12px and meet WCAG AA contrast (4.5:1 normal; 3:1 large).');
  for (const [date, expected] of [['2026-11-01', 'Posadas, Navidad y fin de año.'], ['2026-12-20', 'Fin de año, Posadas y Navidad.'], ['2026-09-15', 'Halloween, Posadas, Navidad y fin de año.']]) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date(`${date}T12:00:00-06:00`));
    await page.addInitScript(() => {
      window.lateSeasonCopies = [];
      new MutationObserver(changes => {
        if (!performance.getEntriesByName('first-contentful-paint').length) return;
        for (const change of changes) if (change.target.nodeType === 1 && change.target.matches('[data-season-copy]')) window.lateSeasonCopies.push(change.target.textContent);
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto(`${base.replace(/\/$/, '')}/invitaciones`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-season-copy]').textContent(), expected);
    assert.deepEqual(await page.evaluate(() => window.lateSeasonCopies), [], 'Season copy must be ready before first paint');
    await context.close();
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noJs.newPage();
  await fallback.goto(`${base.replace(/\/$/, '')}/invitaciones`);
  assert.equal(await fallback.locator('[data-season-copy]').textContent(), 'Halloween, Navidad y fin de año.');
  await noJs.close();
  console.log('Season copy: three visitor dates before paint, and no-JS fallback passed');
} finally { await browser.close(); await server?.close(); }
