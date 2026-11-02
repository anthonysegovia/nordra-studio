import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { commercialTypeFloor } from '../build/commercial-type.mjs';
import { showcaseSeasonText } from '../src/seasonal/showcase-copy.mjs';
import { renderInvitationPage } from '../build/invitation-offers.mjs';

test('the CSS floor preserves sizes, line heights and private/phone styles', async () => {
  const input = '.label{font:500 9px/1.5 Manrope;font-size:clamp(8px,1vw,12px)}';
  const process = from => postcss([commercialTypeFloor()]).process(input, { from });
  const result = await process('/repo/src/site/styles/example.css');
  assert.match(result.css, /font:500 var\(--commercial-min-text, 9px\)\/1.5 Manrope/);
  assert.match(result.css, /font-size:max\(var\(--commercial-min-text, 0px\), clamp\(8px,1vw,12px\)\)/);
  for (const from of ['/repo/src/panel.css', '/repo/src/site/styles/phone-frame.css', '/repo/src/site/styles/landscape.css']) assert.equal((await process(from)).css, input);
});

test('seasonal showcase uses the shared calendar, with its original no-JS fallback', () => {
  assert.equal(showcaseSeasonText(new Date(2026, 10, 1)), 'Posadas, Navidad y fin de año.');
  assert.equal(showcaseSeasonText(new Date(2026, 11, 20)), 'Fin de año, Posadas y Navidad.');
  assert.equal(showcaseSeasonText(new Date(2026, 8, 15)), 'Halloween, Posadas, Navidad y fin de año.');
  const source = readFileSync('invitaciones.html', 'utf8');
  assert.match(source, /data-season-copy>Halloween, Navidad y fin de año\./);
  const html = renderInvitationPage(source);
  assert.ok(!html.includes('{{invitations:'));
  assert.ok(html.indexOf('showcaseSeasonCopy') < html.indexOf('</head>'));
  assert.match(readFileSync('src/seasonal/showcase-copy.mjs', 'utf8'), /import.*seasonOrder.*order\.mjs/);
});

test('home keeps two equivalent doors, with filled and outlined buttons in the same action group', () => {
  const source = readFileSync('index.html', 'utf8');
  const actions = source.match(/<div class="horizon-actions">([\s\S]*?)<\/div>/)[1];
  assert.equal((actions.match(/<a /g) || []).length, 2);
  assert.match(actions, /class="horizon-button" href="\/negocios"[^>]*>Quiero una página web/);
  assert.match(actions, /class="horizon-button horizon-button-outline" href="\/invitaciones"[^>]*>Quiero una invitación/);
  assert.doesNotMatch(actions, /options-compare/);
});

test('other commercial occasion heroes keep a single existing filled button', () => {
  for (const page of ['negocios', 'invitaciones', 'bodas', 'cumpleanos', 'eventos', 'temporada']) {
    const source = readFileSync(`${page}.html`, 'utf8');
    assert.equal((source.match(/class="horizon-button(?: business-quote)?"/g) || []).length, 1, page);
  }
  assert.match(readFileSync('negocios.html', 'utf8'), /class="options-compare" href="#opciones-web"/);
});

test('homepage uses approved headline C and consistent title metadata without a trailing point', () => {
  const html = readFileSync('index.html', 'utf8');
  const heading = html.match(/<h1 id="entry-title"[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(heading, 'Tu página y tu invitación hechas contigo en Monterrey');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const og = html.match(/property="og:title" content="([^"]*)"/)[1];
  assert.equal(title, 'Tu página y tu invitación en Monterrey · Nordra Studio');
  assert.equal(og, title);
});
