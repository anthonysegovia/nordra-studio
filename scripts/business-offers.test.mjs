import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import {businessOffers,businessHosting,businessMoney,businessWhatsApp} from '../src/data/businessOffers.ts';import {renderBusinessOffers} from '../build/business-offers.mjs';import {renderBusinessContent} from '../build/business-content.mjs';import {resolveOfferAnchor} from '../src/site/business/offer-selection.js';
// Node's type stripper plus explicit data URLs also resolves the existing TS-only
// extensionless imports, without changing the billing app's module convention.
const dataURL=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const offerModule=dataURL(readFileSync('src/data/businessOffers.ts','utf8')),invitationModule=dataURL(readFileSync('src/data/invitationPricing.ts','utf8'));
const catalogSource=readFileSync('src/data/paymentCatalog.ts','utf8').replace('"./businessOffers"',JSON.stringify(offerModule)).replace('"./invitationPricing"',JSON.stringify(invitationModule));
const {paymentCatalog}=await import(dataURL(catalogSource));
test('published static prices, quote links and billing catalogue share every package and hosting tariff',()=>{
 const html=renderBusinessOffers(renderBusinessContent(readFileSync('negocios.html','utf8')));assert.ok(!html.includes('{{business:'));assert.equal((html.match(/class="offer-panel"/g)||[]).length,new Set(businessOffers.map(o=>o.card)).size);
 for(const offer of businessOffers){const entry=paymentCatalog.find(s=>s.id===offer.id);assert.equal(entry.cents,offer.cents);assert.equal(entry.label,offer.name);const a=html.match(new RegExp(`<a[^>]*data-offer="${offer.id}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0];assert.ok(a,offer.id);assert.ok(html.includes('<p class="offer-price"><small>desde</small> '+businessMoney(offer.cents)+'</p>'));assert.ok(a.includes(`data-offer-price="${entry.cents}"`));const url=new URL(a.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/528129022231');assert.ok(url.searchParams.get('text').includes(`${offer.name} (desde ${businessMoney(entry.cents)}`));assert.ok(url.searchParams.get('text').includes('Mi negocio es…'));assert.ok(!a.includes(businessMoney(offer.maxCents))||offer.cents===offer.maxCents);}
 for(const host of businessHosting)for(const term of host.terms){const id=`hosting-${host.id}-${term.id}`,entry=paymentCatalog.find(s=>s.id===id);assert.equal(entry.cents,term.cents);const span=html.match(new RegExp(`<span data-hosting="${id}">([\\s\\S]*?)<\\/span>`))?.[1];assert.ok(span?.includes(businessMoney(entry.cents)),id);}
 assert.ok(html.includes('Precios desde, en MXN con IVA incluido. Confirmamos alcance y precio final en tu cotización.'));
 assert.ok(html.includes(`Desde ${businessMoney(businessOffers[0].cents)} MXN`));
 assert.equal(new Set(paymentCatalog.map(s=>s.id)).size,paymentCatalog.length);
});
test('generated panels expose one initial price per group and all six quotes with their own details',()=>{
 const html=renderBusinessOffers('{{business:offers}}');
 assert.equal(renderBusinessOffers('<p>Other page</p>'),'<p>Other page</p>');
 const panels=[...html.matchAll(/<article class="offer-panel" data-group="([^"]+)"([^>]*)>([\s\S]*?)<\/article>/g)];
 for(const [,group,attrs,body] of panels){
   assert.equal(attrs.includes(' inert'),group!=='business');
   const offers=businessOffers.filter(o=>o.card===group);
   const levels=[...body.matchAll(/<div class="offer-level" data-level="([^"]+)"( hidden)?>([\s\S]*?)<\/details>/g)];
   assert.deepEqual(levels.map(m=>m[1]),offers.map(o=>o.id));
   assert.equal(levels.filter(m=>!m[2]).length,1);
   for(const [i,offer] of offers.entries()){
     const markup=levels[i][3];
     assert.equal((markup.match(/class="offer-price"/g)||[]).length,1);
     assert.ok(markup.includes(businessMoney(offer.cents)));
     assert.ok(markup.includes(offer.delivery));
     assert.ok(markup.includes('href="'+businessWhatsApp(offer).replaceAll('&','&amp;')+'"'));
     for(const feature of offer.features)assert.ok(markup.includes('<li>'+feature+'</li>'));
     assert.ok(markup.includes(offer.scope));
     if(offers.length>1)assert.ok(body.includes('value="'+offer.id+'"'));
   }
 }
});

test('package and service fragments resolve to the corresponding level',()=>{
 const levels=businessOffers.map(o=>({group:o.card,id:o.id}));
 const html=renderBusinessOffers('{{business:offers}}');
 for(const level of levels){
   for(const [anchor,expected] of [['offer-'+level.group,levels.find(o=>o.group===level.group)],['service-'+level.id,level]]){
     assert.ok(html.includes('id="'+anchor+'"'));
     assert.deepEqual(resolveOfferAnchor(anchor,levels),expected);
   }
 }
 assert.equal(resolveOfferAnchor('guia-web',levels),undefined);
 assert.equal(resolveOfferAnchor('service-unknown',levels),undefined);
 const source=readFileSync('negocios.html','utf8');
 assert.ok(source.includes("id==='guia-web'?'opciones-web'"));
});
test('hosting summary uses the lowest monthly tariff and keeps both plans closed initially',()=>{
 const html=renderBusinessOffers('{{business:offers}}');
 const monthly=businessHosting.flatMap(h=>h.terms.filter(t=>t.months===1).map(t=>t.cents));
 assert.ok(html.includes('Después, desde <strong>'+businessMoney(Math.min(...monthly))+'</strong> al mes.'));
 assert.ok(html.includes('<details><summary>Precios, pagos y alojamiento <span aria-hidden="true">+</span></summary>'));
 assert.doesNotMatch(html,/class="business-delivery"/);
});
