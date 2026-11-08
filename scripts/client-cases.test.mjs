import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { clientCases } from '../src/data/clientCases.ts';
import { clientReviews, renderClientCases, renderHomeClientHighlights, validateClientCases } from '../build/client-cases.mjs';
import { renderInvitationPage } from '../build/invitation-offers.mjs';

const source = fs.readFileSync(new URL('../invitaciones.html', import.meta.url), 'utf8');
const page = () => renderInvitationPage(source);
const approvedOpinions = [
  'La verdad nos encantó cómo quedó la invitación, el diseño estuvo muy bonito y fue muy fácil compartirla con todos. La parte de confirmar asistencia también nos ayudó bastante para organizarnos mejor y llevar el control de los invitados. Te recomendaríamos, quedamos muy contentos con el resultado y la atención que nos diste.',
  'Me encantó cómo quedó la invitación, sobre todo las animaciones y todos los detalles de Halloween. Quedó mucho mejor de lo que me imaginaba. A mis invitados también les gustó muchísimo; varios me preguntaron dónde la había hecho porque nunca habían visto una invitación así. Quedé súper contento con el resultado.',
];

test('approved opinions and names are exact in visible content and Review JSON-LD', () => {
  const html = page();
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const reviews = schemas.find(s => s['@type'] === 'Service').review;
  assert.deepEqual(clientCases.map(c => c.opinion.text), approvedOpinions);
  assert.deepEqual(reviews.map(r => r.reviewBody), approvedOpinions);
  assert.deepEqual(reviews.map(r => r.author.name), ['La Covadonga', 'Sonia Alarcón']);
  for (const opinion of approvedOpinions) assert.ok(html.includes(`<blockquote><p>${opinion}</p>`));
  assert.equal((html.match(/aria-label="Calificación: 5 de 5"/g) || []).length, 2);
  assert.equal((html.match(/★★★★★ <span>5\/5<\/span>/g) || []).length, 2);
  assert.doesNotMatch(JSON.stringify(schemas), /reviewRating|aggregateRating/);
  assert.doesNotMatch(html, /\[Opinión del cliente pendiente\]/);
  assert.ok(html.indexOf('id="tipos-invitacion"') < html.indexOf('id="clientes-reales"'));
  assert.ok(html.indexOf('id="asi-lo-viven"') < html.indexOf('id="clientes-reales"'));
});

test('missing authorization and placeholder opinions fail closed; empty opinions have no Review or rating', () => {
  const changed = () => structuredClone(clientCases);
  for (const render of [renderClientCases, clientReviews]) {
    const missing = changed(); missing[0].opinion.authorizedOn = '';
    assert.throws(() => render(missing), /Opinion authorization missing/);
    const placeholder = changed(); placeholder[0].opinion.text = '[Opinión del cliente pendiente]';
    assert.throws(() => render(placeholder), /Placeholder opinion/);
    const rating = changed(); rating[0].rating.documentedOn = '';
    assert.throws(() => render(rating), /Rating documentation missing/);
  }
  const empty = changed(); empty.forEach(c => { c.opinion.text = ''; c.opinion.authorizedOn = ''; c.highlight = ''; });
  assert.deepEqual(clientReviews(empty), []);
  assert.doesNotMatch(renderClientCases(empty), /blockquote|Calificación|★★★★★|pendiente/);
});

test('home highlights are complete literal sentences covered by the opinion authorization', () => {
  const expected = [
    'La verdad nos encantó cómo quedó la invitación, el diseño estuvo muy bonito y fue muy fácil compartirla con todos.',
    'A mis invitados también les gustó muchísimo; varios me preguntaron dónde la había hecho porque nunca habían visto una invitación así.',
  ];
  assert.deepEqual(clientCases.map(item => item.highlight), expected);
  for (const item of clientCases) assert.ok(item.opinion.text.includes(item.highlight));
  const changed = structuredClone(clientCases);
  changed[0].highlight = 'Nos encantó la invitación.';
  assert.throws(() => validateClientCases(changed), /complete approved sentence/);
  changed[0].highlight = 'La verdad nos encantó cómo quedó la invitación';
  assert.throws(() => validateClientCases(changed), /complete approved sentence/);
  changed[0].highlight = expected[0];
  changed[0].opinion.authorizedOn = '';
  assert.throws(() => validateClientCases(changed), /authorization missing/);
});

test('home renders two attributed highlights between projects and studio, with a real destination and no Review schema', () => {
  const source = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const html = renderHomeClientHighlights(source);
  const strip = html.match(/<section class="home-client-highlights"[\s\S]*?<\/section>/)[0];
  for (const item of clientCases) {
    assert.ok(!source.includes(item.highlight));
    assert.ok(strip.includes(`<blockquote><p>${item.highlight}</p></blockquote>`));
    assert.ok(strip.includes(`<strong>${item.displayName}</strong> · ${item.occasion}`));
  }
  assert.match(html, /<\/section>\s*<section class="home-client-highlights"/);
  assert.ok(html.indexOf('id="trabajos"') < html.indexOf(strip));
  assert.ok(html.indexOf(strip) < html.indexOf('id="nosotros"'));
  assert.equal((strip.match(/aria-label="Calificación: 5 de 5"/g) || []).length, 2);
  assert.equal((strip.match(/★★★★★ <span>5\/5<\/span>/g) || []).length, 2);
  assert.doesNotMatch(strip, /<img|<iframe|<script/);
  assert.match(strip, /href="\/invitaciones#clientes-reales">Ver sus invitaciones/);
  assert.match(page(), /<section[^>]*id="clientes-reales"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.ok(schemas.some(schema => schema['@type'] === 'LocalBusiness'));
  assert.doesNotMatch(JSON.stringify(schemas), /"Review"/);
});

test('client images stay exactly the inspected guest-free covers, not RSVP lists or personalized passes', () => {
  // Byte locks intentionally require a fresh visual privacy review if replaced.
  // They detect any image change, not personal data through unreliable OCR.
  const approved = new Map([
    ['/artwork/client-cases/covadonga-cover.jpg', '2aa33cb2d128dd85936f02d9f47efbfb35bb3af0affabc1e2a8b30df7841658b'],
    ['/artwork/client-cases/halloween-cover.png', '1045f5a1d863929a95c8864035fc290a8bc787e6155fda2588c612127c4ca75e'],
  ]);
  assert.equal(clientCases.length, approved.size);
  for (const item of clientCases) {
    assert.ok(approved.has(item.capture.src), 'Unreviewed client capture');
    const bytes = fs.readFileSync(new URL(`../public${item.capture.src}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), approved.get(item.capture.src), 'Capture changed: review for guest data before updating this lock');
    if (item.capture.src.endsWith('.png')) {
      assert.equal(bytes.readUInt32BE(16), item.capture.width);
      assert.equal(bytes.readUInt32BE(20), item.capture.height);
    } else {
      assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
    }
  }
  assert.doesNotMatch(renderClientCases(), /<img /);
});

test('client cards quote the first authorized sentence and disclose the complete original opinion', () => {
  const html = renderClientCases();
  for (const [i,item] of clientCases.entries()) {
    const first=approvedOpinions[i].split('. ')[0]+'.';
    assert.ok(html.includes(`<blockquote class="client-highlight-quote"><p>${first}</p></blockquote>`));
    assert.ok(html.includes(`<details class="client-opinion-full"><summary>Leer opinión completa <span aria-hidden="true">+</span></summary><blockquote><p>${item.opinion.text}</p>`));
  }
  assert.equal((html.match(/<details class="client-opinion-full">/g) || []).length, clientCases.length);
});
