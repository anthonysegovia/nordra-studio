import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { commercialTypeFloor } from '../build/commercial-type.mjs';
import { renderInvitationPage } from '../build/invitation-offers.mjs';

test('the CSS floor preserves sizes, line heights and private/phone styles', async () => {
  const input = '.label{font:500 9px/1.5 Manrope;font-size:clamp(8px,1vw,12px)}';
  const process = from => postcss([commercialTypeFloor()]).process(input, { from });
  const result = await process('/repo/src/site/styles/example.css');
  assert.match(result.css, /font:500 var\(--commercial-min-text, 9px\)\/1.5 Manrope/);
  assert.match(result.css, /font-size:max\(var\(--commercial-min-text, 0px\), clamp\(8px,1vw,12px\)\)/);
  for (const from of ['/repo/src/panel.css', '/repo/src/site/styles/phone-frame.css', '/repo/src/site/styles/landscape.css']) assert.equal((await process(from)).css, input);
});

test('seasonal designs remain discoverable without the duplicate gallery',()=>{
 const html=renderInvitationPage(readFileSync('invitaciones.html','utf8'));
 assert.ok(!html.includes('{{invitations:'));
 assert.ok(!html.includes('id="temporadas"'));
 assert.match(html, /(?:class="grounding"|class="trust fade")[\s\S]*?href="\/temporada"/);
 assert.match(html, /class="inv-temporada"><a href="\/temporada"/);
});

test('home leads to the one place where the visitor chooses a path', () => {
  const source = readFileSync('index.html', 'utf8');
  const actions = source.match(/<div class="horizon-actions">([\s\S]*?)<\/div>/)[1];
  assert.equal((actions.match(/<a /g) || []).length, 1);
  assert.match(actions, /class="horizon-button" href="#elige-tu-camino"/);
  assert.match(source, /class="horizon-path horizon-business"/);
  assert.match(source, /class="horizon-path horizon-invitations"/);
  assert.doesNotMatch(actions, /options-compare/);
});

test('other commercial occasion heroes keep a single existing filled button', () => {
  for (const page of ['negocios', 'invitaciones', 'bodas', 'eventos', 'temporada']) {
    const source = readFileSync(`${page}.html`, 'utf8');
    assert.equal((source.match(/class="(?:horizon-button(?: business-quote)?|cta)"/g) || []).length, 1, page);
  }
  assert.match(readFileSync('negocios.html', 'utf8'), /class="(?:options-compare|link)" href="#opciones-web"/);
});

test('homepage keeps headline C, its approved social title and the descriptive search title', () => {
  const html = readFileSync('index.html', 'utf8');
  const heading = html.match(/<h1 id="entry-title"[\s\S]*?<\/h1>/)[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(heading, 'Tu página y tu invitación hechas contigo');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const og = html.match(/property="og:title" content="([^"]*)"/)[1];
  assert.equal(title, 'Nordra Studio · Diseño web e invitaciones digitales');
  assert.equal(og, 'Tu página y tu invitación, hechas contigo · Nordra Studio');
});
