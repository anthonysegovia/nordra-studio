import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import {invitationOffers,seasonalOffer,seasons,upcomingSeason,invitationMoney,invitationFacts,invitationPlanFeatures} from '../src/data/invitationPricing.ts';import {renderInvitationPage,invitationFaq,invitationSchema,closingMessage} from '../build/invitation-offers.mjs';
const dataURL=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const catalogSource=readFileSync('src/data/paymentCatalog.ts','utf8').replace('"./businessOffers"',JSON.stringify(dataURL(readFileSync('src/data/businessOffers.ts','utf8')))).replace('"./invitationPricing"',JSON.stringify(dataURL(readFileSync('src/data/invitationPricing.ts','utf8'))));
const {paymentCatalog}=await import(dataURL(catalogSource));
const page=renderInvitationPage(readFileSync('invitaciones.html','utf8'));
test('plan cards, WhatsApp messages and the billing catalogue share every invitation price',()=>{
 assert.ok(!page.includes('{{invitations:'));assert.equal((page.match(/<article class="invite-card/g)||[]).length,invitationOffers.length);
 for(const offer of invitationOffers){
  const card=page.match(new RegExp(`<article[^>]*id="plan-${offer.id}"[\\s\\S]*?<\\/article>`))?.[0];assert.ok(card,offer.id);
  assert.ok(card.includes(invitationMoney(offer.cents)));assert.ok(card.includes(`Lista en ${offer.delivery}`));
  if(offer.regularCents)assert.match(card,new RegExp(`<s[^>]*>[^<]*${invitationMoney(offer.regularCents).replace('$','\\$')}</s>`));
  for(const feature of invitationPlanFeatures[offer.id])assert.ok(card.includes(feature));
  assert.ok(card.includes('Ver todo lo que incluye'));
  const text=new URL(card.match(/class="invite-cta" href="([^"]+)"/)[1].replaceAll('&amp;','&')).searchParams.get('text');assert.ok(text.includes(invitationMoney(offer.cents)),text);
 }
 for(const offer of invitationOffers)for(const event of ['wedding','celebration','gathering'])assert.equal(paymentCatalog.find(s=>s.id===`${event}-${offer.id}`)?.cents,offer.cents,`${event}-${offer.id}`);
 const comparison=page.match(/<section[^>]*id="planes-invitaciones"[\s\S]*?<\/section>/)[0];
 assert.ok(!comparison.includes('id="plan-temporada"'));
 assert.ok(comparison.includes('href="/temporada">¿Una posada o una fiesta de fin de año? Diseños de temporada a '+invitationMoney(seasonalOffer.cents)));
 assert.ok(!page.includes('id="temporadas"'));
 for(const season of seasons)assert.equal(paymentCatalog.find(s=>s.id===season.catalogId)?.cents,seasonalOffer.cents,season.id);
 assert.ok(page.includes(`Desde ${invitationMoney(invitationOffers[0].cents)} MXN`));
 assert.ok(page.includes(encodeURIComponent(closingMessage)));
 assert.ok(!/negocio|llevar tu idea a la web/i.test(page.slice(page.indexOf('id="proceso-invitaciones"'),page.indexOf('<!-- commercial:footer -->'))));
});
test('the next season follows the calendar without dates shown to visitors',()=>{
 assert.equal(upcomingSeason(new Date(2026,9,10)).id,'halloween');assert.equal(upcomingSeason(new Date(2026,9,31)).id,'posadas');assert.equal(upcomingSeason(new Date(2026,11,20)).id,'fin-de-ano');assert.equal(upcomingSeason(new Date(2027,1,3)).id,'halloween');
 assert.equal((page.match(/data-season-current/g)||[]).length,0);
});
test('visible FAQ, FAQPage and Service offers come from one source',()=>{
 const blocks=[...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const faq=blocks.find(b=>b['@type']==='FAQPage'),service=blocks.find(b=>b['@type']==='Service');assert.ok(faq&&service);
 assert.deepEqual(faq.mainEntity.map(q=>q.name),invitationFaq.map(q=>q.q));
 for(const item of invitationFaq)assert.ok(page.includes(item.q.replaceAll('&','&amp;')),item.q);
 assert.ok(invitationFaq.some(item=>item.a===invitationFacts.guests));
 for(const value of ['50%','Mercado Pago','crédito o débito','CFDI','antes de publicar'])assert.ok(invitationFaq.some(item=>item.a.includes(value)));
 assert.deepEqual(faq.mainEntity.map(item=>item.acceptedAnswer.text),invitationFaq.map(item=>item.a));
 assert.deepEqual(service.offers.map(o=>[o.name,o.price,o.priceCurrency]),[...invitationOffers,seasonalOffer].map(o=>[o.name,(o.cents/100).toFixed(2),'MXN']));
 assert.equal(service.provider['@id'],'https://nordrastudio.mx/#negocio');assert.deepEqual(invitationSchema()[1].mainEntity.length,invitationFaq.length);
 assert.equal(renderInvitationPage('<p>Other page</p>'),'<p>Other page</p>');
});
