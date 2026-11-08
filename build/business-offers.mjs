import { businessOffers, businessHosting, businessMoney, businessPriceNote, businessWhatsApp } from '../src/data/businessOffers.ts';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const groups = [
 { id:'landing', name:'Landing', goal:'Que me encuentren', points:['Diseño adaptable','WhatsApp y mapa','Redes sociales'] },
 { id:'business', name:'Sitio de Negocio', goal:'Mostrar mis servicios', points:['4 a 6 apartados','Galería y formulario','SEO básico'] },
 { id:'custom', name:'Proyectos a medida', goal:'Vender o agendar', points:['Catálogo','Integraciones','Formularios'] },
 { id:'immersive', name:'Experiencia inmersiva', goal:'Lanzar algo memorable', points:['Escena propia','Recorrido por capítulos','Versión para celular'] },
];
const work = {
 business: [['nitida','Nítida','v547/assets/nitida-inicio-1100.webp','Portada de Nítida con el retrato junto al titular']],
 immersive: [
  ['sobremesa','Sobremesa','v546/assets/sobremesa-flor-1100.webp','Una botella de café sobre la flor del cafeto'],
  ['cantera','Cantera','v549/assets/cantera-ciudad-1100.webp','Ciudad de puntos en la portada de Cantera'],
 ],
};
const deliverables={
 'landing-essential':'Una página de presentación','landing-professional':'Página con formulario',
 'custom-web':'Catálogo a medida','shop':'Tienda en línea',
};
const levels = group => businessOffers.filter(offer => offer.card === group.id);
const minimum = group => businessMoney(Math.min(...levels(group).map(offer => offer.cents)));
const badge = '<span class="offer-badge">Recomendado</span>';
function goal(group){
 const recommended=group.id==='business';
 return `<label class="goal-choice"><input type="radio" name="web-goal" value="${group.id}"${recommended?' checked':''}><strong>${group.goal}</strong><span>desde ${minimum(group)}</span>${recommended?badge:''}</label>`;
}
function visual(group,offers){
 if(work[group.id])return `<div class="offer-art offer-work">${work[group.id].map(([slug,name,src,alt])=>`<a href="/demos/${slug}/" target="_blank" rel="noopener"><img src="/nordra/${src}" width="1100" height="619" loading="lazy" decoding="async" alt="${alt}"><span>${name} <i aria-hidden="true">↗</i></span></a>`).join('')}</div>`;
 return `<div class="offer-art offer-print" aria-hidden="true">${offers.map((o,i)=>`<div data-level="${o.id}"${i?' hidden':''}><small>Lo que recibes</small><strong>${deliverables[o.id]}</strong><span>${o.delivery}</span></div>`).join('')}</div>`;
}
function level(o,i){
 return `<div class="offer-level" data-level="${o.id}"${i?' hidden':''}>
 <p class="offer-price"><small>desde</small> ${businessMoney(o.cents)}</p>
 <p class="offer-delivery" data-delivery="${o.id}">${o.delivery}</p>
 <a class="offer-quote" href="${esc(businessWhatsApp(o))}" target="_blank" rel="noopener" data-offer="${o.id}" data-offer-name="${o.name}" data-offer-price="${o.cents}" data-analytics-whatsapp="web_option">Cotizar por WhatsApp <span aria-hidden="true">↗</span></a>
 <details class="offer-details"><summary>Ver todo lo que incluye <span aria-hidden="true">+</span></summary><ul>${o.features.map(f=>`<li>${f}</li>`).join('')}</ul><p>${o.scope}</p></details></div>`;
}
function card(group){
 const offers=levels(group),recommended=group.id==='business';
 const selector=offers.length>1?`<fieldset class="offer-switch"><legend>Nivel</legend>${offers.map((o,i)=>`<label><input type="radio" name="level-${group.id}" value="${o.id}"${i?'':' checked'}> ${o.name}</label>`).join('')}</fieldset>`:'';
 return `<article class="offer-panel" data-group="${group.id}" aria-labelledby="title-${group.id}"${recommended?'':' inert'}>
 <div class="offer-copy">${recommended?badge:''}<h3 id="title-${group.id}" tabindex="-1">${group.name}</h3><ul class="offer-points">${group.points.map(p=>`<li>${p}</li>`).join('')}</ul>
 ${selector}<div class="offer-levels">${offers.map(level).join('')}</div></div>${visual(group,offers)}</article>`;
}

function hosting() {
 const minimum = Math.min(...businessHosting.flatMap(plan => plan.terms.filter(term => term.months === 1).map(term => term.cents)));
 return `<div class="offer-hosting"><details><summary>Ver planes de alojamiento <span aria-hidden="true">+</span></summary><p>Primer mes de alojamiento incluido. Después, desde <strong>${businessMoney(minimum)}</strong> al mes.</p><div class="hosting-plans">${businessHosting.map(h=>`<div><h4>${h.name}</h4><p>${h.terms.map(t=>`<span data-hosting="hosting-${h.id}-${t.id}">${h.startingAt?'desde ':''}<strong>${businessMoney(t.cents)}</strong>${t.months===1?'/mes':` por ${t.months} meses`}</span>`).join(' · ')}</p></div>`).join('')}</div></details></div>`;
}
export function renderBusinessOffers(html) {
 const helpOffer={name:'una página para mi negocio',cents:Math.min(...businessOffers.map(o=>o.cents))};
 const section=`<section class="home-continuation business-offers" id="opciones-web" aria-labelledby="web-options-title">
 <div class="offer-anchors" aria-hidden="true"><span id="guia-web"></span>${groups.map(group=>`<span id="offer-${group.id}"></span>`).join('')}${businessOffers.map(o=>`<span id="service-${o.id}"></span>`).join('')}</div>
 <h2 id="web-options-title">Elige cómo empezar</h2>
 <p class="goal-question" id="goal-question">¿Qué quieres lograr con tu página?</p>
 <fieldset class="offer-goals" aria-labelledby="goal-question" hidden>${groups.map(goal).join('')}</fieldset>
 <div class="offer-stage">${groups.map(card).join('')}</div>
 <small class="offer-note">${businessPriceNote}</small>
 ${hosting()}</section>`;
 return html.replace('{{business:minimum}}',businessMoney(helpOffer.cents)).replace('{{business:offers}}',section);
}
export function businessOffersPlugin(){return {name:'nordra-business-offers',transformIndexHtml:{order:'pre',handler:renderBusinessOffers}};}
