import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import {businessOffers,businessHosting,businessMoney,businessWhatsApp} from '../src/data/businessOffers.ts';import {renderBusinessOffers} from '../build/business-offers.mjs';import {renderBusinessContent} from '../build/business-content.mjs';import {recommendBusiness,borderPoint,orbitPoint} from '../src/site/business/offer-model.js';
// Node's type stripper plus explicit data URLs also resolves the existing TS-only
// extensionless imports, without changing the billing app's module convention.
const dataURL=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const offerModule=dataURL(readFileSync('src/data/businessOffers.ts','utf8')),invitationModule=dataURL(readFileSync('src/data/invitationPricing.ts','utf8'));
const catalogSource=readFileSync('src/data/paymentCatalog.ts','utf8').replace('"./businessOffers"',JSON.stringify(offerModule)).replace('"./invitationPricing"',JSON.stringify(invitationModule));
const {paymentCatalog}=await import(dataURL(catalogSource));
test('published static prices, quote links and billing catalogue share every package and hosting tariff',()=>{
 const html=renderBusinessOffers(renderBusinessContent(readFileSync('negocios.html','utf8')));assert.ok(!html.includes('{{business:'));assert.equal((html.match(/class="offer-card/g)||[]).length,4);
 for(const offer of businessOffers){const entry=paymentCatalog.find(s=>s.id===offer.id);assert.equal(entry.cents,offer.cents);assert.equal(entry.label,offer.name);const a=html.match(new RegExp(`<a[^>]*data-offer="${offer.id}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0];assert.ok(a,offer.id);assert.ok(a.includes(businessMoney(offer.cents)));assert.ok(a.includes(`data-offer-price="${entry.cents}"`));const url=new URL(a.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/528129022231');assert.ok(url.searchParams.get('text').includes(`${offer.name} (desde ${businessMoney(entry.cents)}`));assert.ok(url.searchParams.get('text').includes('Mi negocio es…'));assert.ok(!a.includes(businessMoney(offer.maxCents))||offer.cents===offer.maxCents);}
 for(const host of businessHosting)for(const term of host.terms){const id=`hosting-${host.id}-${term.id}`,entry=paymentCatalog.find(s=>s.id===id);assert.equal(entry.cents,term.cents);const span=html.match(new RegExp(`<span data-hosting="${id}">([\\s\\S]*?)<\\/span>`))?.[1];assert.ok(span?.includes(businessMoney(entry.cents)),id);}
 assert.ok(html.includes('Precios desde, en MXN con IVA incluido. Confirmamos alcance y precio final en tu cotización.'));
 assert.ok(html.includes(`Desde ${businessMoney(businessOffers[0].cents)} MXN.`));
 assert.equal(new Set(paymentCatalog.map(s=>s.id)).size,paymentCatalog.length);
});
test('build generation supplies prices before JavaScript and only touches its explicit markers',()=>{
 const template=readFileSync('negocios.html','utf8'),html=renderBusinessOffers(template);assert.ok(html.includes('data-offer="business-site"'));assert.ok(html.includes('<form class="guide-form" hidden>'));assert.equal(renderBusinessOffers('<p>Other page</p>'),'<p>Other page</p>');for(const offer of businessOffers)assert.ok(html.includes(businessWhatsApp(offer).replaceAll('&','&amp;')));
});
test('three common journeys and intermediate landing/custom needs recommend the smallest suitable scope',()=>{
 for(const [answers,id]of [[[0,0,0],'landing-essential'],[[1,1,0],'business-site'],[[2,2,2],'shop'],[[0,1,0],'landing-professional'],[[0,0,1],'landing-professional'],[[2,0,1],'custom-web'],[[0,2,0],'custom-web']])assert.equal(recommendBusiness(answers).id,id);
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){const r=recommendBusiness([a,b,c]);assert.ok(businessOffers.some(o=>o.id===r.id));assert.ok(r.reason.length>40);if(c===2)assert.equal(r.id,'shop');}
 for(const bad of [[],[0,0],[0,0,3],['0',0,0],null])assert.throws(()=>recommendBusiness(bad),TypeError);
});
test('border lamp measures reach in pixels, follows corners and closes its orbit',()=>{
 assert.deepEqual(borderPoint(300,400,150,-80),{x:150,y:0,distance:80});const corner=borderPoint(300,400,310,-10);assert.ok(corner.x<300&&corner.y>0);assert.ok(Math.abs(Math.hypot(corner.x-278,corner.y-22)-22)<1e-8);assert.deepEqual(orbitPoint(300,400,0),orbitPoint(300,400,1));for(let i=0;i<100;i++){const p=orbitPoint(300,400,i/100);assert.ok(borderPoint(300,400,p.x,p.y).distance<1e-7);}
});
test('hosting summary uses the lowest monthly tariff and keeps both plans closed initially',()=>{
 const html=renderBusinessOffers('{{business:offers}}');
 const monthly=businessHosting.flatMap(h=>h.terms.filter(t=>t.months===1).map(t=>t.cents));
 assert.ok(html.includes('Después, desde <strong>'+businessMoney(Math.min(...monthly))+'</strong> al mes.'));
 assert.ok(html.includes('<details><summary>Ver planes de alojamiento</summary>'));
 assert.doesNotMatch(html,/class="business-delivery"/);
});
