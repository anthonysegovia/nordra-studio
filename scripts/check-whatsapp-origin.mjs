import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

test('compiled commercial WhatsApp messages end with the page and applicable package', () => {
  const pages = ['index', 'negocios', 'invitaciones', 'bodas', 'cumpleanos', 'eventos', 'temporada', 'estudio'];
  for (const locale of ['', 'en/']) for (const page of pages) {
    const html = readFileSync(`dist/${locale}${page}.html`, 'utf8');
    const route = locale ? '/en' + (page === 'index' ? '' : '/' + page) : page === 'index' ? '' : '/' + page;
    const tags = [...html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/[^>]*>/g)];
    assert.ok(tags.length, route);
    for (const [tag] of tags) {
      const attr = name => tag.match(new RegExp(`\\b${name}="([^\"]*)"`))?.[1];
      const message = new URL(attr('href').replaceAll('&amp;', '&')).searchParams.get('text');
      const plan = attr('data-offer-name') || ({ aurora: 'Aurora', boreal: 'Boreal' }[attr('data-invitation-offer')]) || (attr('data-analytics-whatsapp') === 'seasonal_design' ? 'Temporada' : '');
      const suffix = `${locale ? 'From' : 'Desde'} nordrastudio.mx${route}${plan ? ' · ' + plan : ''}`;
      assert.ok(message.endsWith('\n\n' + suffix), `${route}: ${message}`);
      assert.equal(message.split(/\n\n(?:Desde|From) nordrastudio\.mx/).length, 2);
    }
  }
  // Every HTML outside the explicit commercial entry points stays untagged.
  const commercial = new Set(pages.flatMap(p => [p + '.html', 'en/' + p + '.html']));
  for (const file of readdirSync('dist', { recursive: true }).filter(f => f.endsWith('.html'))) {
    if (commercial.has(file.replaceAll('\\', '/'))) continue;
    const html = readFileSync('dist/' + file, 'utf8');
    for (const [, href] of html.matchAll(/href="(https:\/\/wa\.me\/[^\"]*)"/g)) {
      assert.doesNotMatch(new URL(href.replaceAll('&amp;', '&')).searchParams.get('text') || '', /\n\n(?:Desde|From) nordrastudio\.mx/);
    }
  }
});
