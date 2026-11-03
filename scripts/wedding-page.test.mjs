import { mobileWhatsApp } from '../build/mobile-whatsapp.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { renderInvitationOffers } from '../build/invitation-offers.mjs';
import { readFileSync } from 'node:fs';
import { renderOccasionPage } from '../build/occasion-content.mjs';
import { invitationMoney, invitationOffers, invitationPlanFeatures } from '../src/data/invitationPricing.ts';

const page = name => renderOccasionPage(readFileSync(name + '.html', 'utf8'));
const wedding = page('bodas');

test('Bodas pairs two accessible steps with a permanent phone and a localized dashboard', async () => {
  const { translatedPageOutput } = await import('../build/translated-pages.mjs');
  const english = translatedPageOutput().transformIndexHtml.handler(mobileWhatsApp(wedding), { path:'/en/bodas.html' });
  for (const [html, lang] of [[wedding,'es'],[english,'en']]) {
    const sample = html.split('id="bodas-respuesta"')[1].split('</section>')[0];
    for (const id of ['bodas-event-experience','event-experience','panel-boda']) {
      assert.equal(sample.split('id="' + id + '"').length, 2);
    }
    assert.match(sample, /role="tablist"/);
    assert.equal(sample.match(/role="tab"/g).length, 2);
    assert.match(sample, /id="tab-cover" aria-controls="panel-boda" aria-selected="true"/);
    assert.match(sample, /id="tab-panel" aria-controls="panel-boda" aria-selected="false" tabindex="-1"/);
    assert.match(sample, /role="tabpanel" aria-labelledby="tab-cover"/);
    assert.match(sample, /inv-guest-cover-390.webp/);
    assert.ok(sample.includes('dashboard-v4-' + lang + '-760.webp'));
    assert.match(sample, /class="wedding-dashboard" href="\/panel-boda.html"/);
    assert.doesNotMatch(sample, /<form|demo-response|Confirma asistencia|tab-reply/);
  }
});

test('the dashboard hover lift composes with the stage transform instead of replacing it', () => {
  const css = readFileSync('src/site/styles/occasion-stage.css', 'utf8');
  const hover = [...css.matchAll(/([^{}]*\.wedding-dashboard:is\(:hover[^{]*)\{([^}]*)\}/g)];
  assert.ok(hover.length > 0);
  for (const [, , body] of hover) {
    assert.doesNotMatch(body, /(^|;|\s)transform\s*:/);
    assert.match(body, /translate\s*:/);
  }
  const stage = readFileSync('src/site/scripts/wedding-stage.js', 'utf8');
  assert.match(stage, /\.wedding-dashboard'\)\.addEventListener\('click'/);
  assert.match(stage, /event\.detail === 0/);
  assert.match(stage, /\.wedding-phone'\)\.addEventListener\('click'[^]*select\(tabs\[0\]\)/);
  assert.match(css, /\[data-step=panel\] \.wedding-phone \{[^}]*pointer-events:auto/);
});

test('Bodas shows both catalogue prices before each disclosure and keeps the complete plan inside', () => {
  assert.doesNotMatch(wedding, /plan-comparison|Qué incluyen los paquetes/);
  for (const offer of invitationOffers) {
    const article = wedding.split('id="bodas-plan-' + offer.id + '"')[1].split('</article>')[0];
    const [visible, detail] = article.split('<details');
    assert.ok(visible.includes('<strong>' + invitationMoney(offer.cents) + '</strong>'));
    assert.ok(visible.match(/<s [^>]*>([^<]+)<\/s>/)[1].includes(invitationMoney(offer.regularCents)));
    assert.ok(visible.includes(offer.delivery));
    assert.equal(visible.match(/<li>/g).length, 3);
    assert.ok(invitationPlanFeatures[offer.id].every(feature => detail.includes(feature)));
  }
  assert.match(wedding, /¿Cómo se paga\?<\/span>[\s\S]*?<div class="faq-answer"><p>[^<]*50% de anticipo; el resto, al aprobar y antes de publicar/);
  assert.match(wedding, /<summary>Servicios adicionales/);
});

test('wedding stationery uses the approved lilies and reserves the readable seal for Boreal', async () => {
  const { translatedPageOutput } = await import('../build/translated-pages.mjs');
  const english = translatedPageOutput().transformIndexHtml.handler(mobileWhatsApp(wedding), { path:'/en/bodas.html' });
  for (const [html, text] of [[wedding,'La más completa'],[english,'Most complete']]) {
    for (const [id, stems] of [['aurora',1],['boreal',2]]) {
      const article = html.split('id="bodas-plan-' + id + '"')[1].split('</article>')[0];
      const lilies = article.match(/<img alt="" src="\/artwork\/wedding-lilies\/lily-stem-v1-320.webp" srcset="[^"]*lily-stem-v1-640.webp 640w"/g);
      assert.equal(lilies?.length, stems);
      const seal = article.match(/class="wedding-seal"><span>([^<]+)<\/span> <span>([^<]+)<\/span>/);
      assert.equal(seal ? seal.slice(1).join(' ') : null, id === 'boreal' ? text : null);
    }
  }
});

test('general invitation cards retain the approved HTML from c78307f', () => {
  const offers = renderInvitationOffers();
  assert.doesNotMatch(offers, /paper-lilies|wedding-lilies|wedding-seal|paper-terms/);
  const cards = offers.match(/<article [\s\S]*?<\/article>/g);
  assert.equal(cards.length, 2);
  assert.equal(createHash('sha256').update(cards.join('')).digest('hex'),
    '282f73dba10b43235868f4a3b94d416c0bf0a7fc5415f7cc511ad1c17b2b9a47');
});

test('Boreal spreads its second real lily away from the first', () => {
  const css = readFileSync('src/site/styles/wedding-page.css','utf8');
  assert.match(css, /\.invite-featured \.paper-lilies\s*\{[^}]*width:/);
  assert.match(css, /\.paper-lilies img\+img\s*\{[^}]*rotate:-29deg/);
});

for (const [name,slug] of [['cumpleanos','camila-30'],['eventos','conexion-27']]) {
  test(name + ' shows the real details screen, localized dashboard and two catalogue plans', async () => {
    const source = page(name);
    const { translatedPageOutput } = await import('../build/translated-pages.mjs');
    const english = translatedPageOutput().transformIndexHtml.handler(mobileWhatsApp(source), {path:'/en/'+name+'.html'});
    for (const html of [source,english]) {
      assert.doesNotMatch(html,/data-rsvp-demo|class="demo-response"|plan-comparison|wedding-lilies/);
      const sample = html.split('id="'+name+'-respuesta"')[1].split('</section>')[0];
      assert.equal(sample.match(/role="tab"/g).length,2);
      assert.equal(sample.split('aria-controls="'+name+'-panel-muestra"').length,3);
      assert.match(sample,/role="tablist"/);
      assert.match(sample,/aria-selected="true"/);
      assert.match(sample,/aria-selected="false" tabindex="-1"/);
      assert.doesNotMatch(sample,/panel-counts|host-preview/);
      const kind=name==='eventos'?'event':'birthday', panel=name==='eventos'?'evento':'cumple';
      assert.ok(sample.includes('href="/panel-'+panel+'.html'+(html===source?'':'?lang=en')+'"'));
      for(const w of [760,1280]){
        const image='/artwork/'+kind+'-dashboard-preview/dashboard-'+(html===source?'es':'en')+'-'+w+'.webp';
        assert.ok(sample.includes(image));assert.equal(readFileSync('public'+image).subarray(8,12).toString(),'WEBP');
      }
      for(const size of [390,780]){
        const prefix=name==='cumpleanos'?'/artwork/birthday-noche/camila':'/artwork/invitation-covers/'+slug;
        const asset=prefix+'-detalles-'+size+'.webp';
        assert.ok(sample.includes(asset));
        assert.equal(readFileSync('public'+asset).subarray(8,12).toString(),'WEBP');
      }
      for(const id of ['event-experience',name+'-event-experience',name+'-panel-muestra',name+'-respuesta',name+'-planes-eventos']){
        assert.equal(html.split('id="'+id+'"').length,2);
      }
      for(const offer of invitationOffers){
        const [visible,details]=html.split('id="'+name+'-plan-'+offer.id+'"')[1].split('</article>')[0].split('<details');
        assert.ok(visible.includes('<strong>'+invitationMoney(offer.cents)+'</strong>'));
        assert.ok(visible.match(/<s [^>]*>([^<]+)<\/s>/)[1].includes(invitationMoney(offer.regularCents)));
        assert.ok(details.includes('<summary>'));
      }
    }
    assert.doesNotMatch(source,/BIRTHDAY INVITES|NORDRA STUDIO \/ EVENTS/);
    assert.match(english,/NORDRA STUDIO (?:· BIRTHDAYS|\/ EVENTS)/);
    assert.match(source,/¿Cómo se paga\?<\/span>[\s\S]*?50% de anticipo/);
    assert.match(english,/How do payments work\?/);
  });
}
