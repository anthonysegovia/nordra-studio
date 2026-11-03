import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderOccasionPage, plainAnswer } from '../build/occasion-content.mjs';
import { invitationOffers, seasonalOffer, invitationMoney } from '../src/data/invitationPricing.ts';
import { renderInvitationPage } from '../build/invitation-offers.mjs';

for (const page of ['bodas', 'cumpleanos', 'eventos', 'temporada']) {
  test(`${page}: source rendering keeps structured offers and FAQ equal to visible content`, () => {
    const source = readFileSync(`${page}.html`, 'utf8');
    const html = renderOccasionPage(source);
    assert.ok(!html.includes('{{occasion:'));
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.equal(blocks.length, 2);
    const service = blocks.find(b => b['@type'] === 'Service');
    const faq = blocks.find(b => b['@type'] === 'FAQPage');
    assert.ok(service && faq);
    assert.equal(service.url, `https://nordrastudio.mx/${page}`);
    assert.equal(service.provider['@id'], 'https://nordrastudio.mx/#negocio');
    assert.equal(service.areaServed, 'MX');
    const offers = page === 'temporada' ? [seasonalOffer] : invitationOffers;
    assert.equal(service.offers.length, offers.length);
    offers.forEach((offer, i) => {
      const schema = service.offers[i];
      assert.equal(schema.name, offer.name);
      assert.equal(Number(schema.price) * 100, offer.cents);
      assert.equal(schema.priceCurrency, 'MXN');
      assert.equal(schema.priceSpecification.price, schema.price);
      assert.equal(schema.priceSpecification.valueAddedTaxIncluded, true);
      assert.equal(schema.priceSpecification.minPrice, offer.startingAt ? schema.price : undefined);
      assert.ok(html.includes(invitationMoney(offer.cents)));
      assert.ok(!JSON.stringify(schema).includes('priceValidUntil'));
    });
    const visible = [...html.matchAll(/<details class="faq-item"><summary><span>(.*?)<\/span>[\s\S]*?<div class="faq-answer"><p>(.*?)<\/p>/g)];
    assert.equal(visible.length, page === 'temporada' ? 3 : 4);
    assert.deepEqual(faq.mainEntity.map(q => [q.name, q.acceptedAnswer.text]), visible.map(m => [plainAnswer(m[1]), plainAnswer(m[2])]));
    assert.ok(faq.mainEntity.every(q => !/<[^>]+>/.test(q.acceptedAnswer.text)));
    if (page === 'temporada') {
      assert.doesNotMatch(source, /\$\s*599|%24599|599\s*MXN/);
      assert.equal((html.match(/class="seasonal-price"/g) || []).length, 3);
      for (const [, price] of html.matchAll(/class="seasonal-price">([^<]+)</g)) assert.equal(price.trim(), invitationMoney(seasonalOffer.cents));
    }
  });
}

test('occasion metadata stays within the agreed lengths', () => {
  const invitations = renderInvitationPage(readFileSync('invitaciones.html', 'utf8'));
  const description = invitations.match(/name="description" content="([^"]+)"/)[1];
  assert.ok(description.length >= 150 && description.length <= 158);
  for (const text of ['Monterrey', 'Invitaciones digitales', 'panel de invitados']) assert.ok(description.includes(text));
  assert.equal(invitations.match(/property="og:description" content="([^"]+)"/)[1], description);
  const seasonal = readFileSync('temporada.html', 'utf8');
  const title = seasonal.match(/<title>(.*?)<\/title>/)[1];
  assert.ok(title.length <= 60);
  assert.ok(title.endsWith('Nordra Studio'));
  assert.equal(seasonal.match(/property="og:title" content="([^"]+)"/)[1], title);
});
