import { invitationOfferSchema } from './invitation-schema.mjs';
import { clientReviews, renderClientCases } from './client-cases.mjs';
import { invitationOffers, invitationPlanFeatures, invitationMoney, invitationFacts, seasonalOffer, seasons, upcomingSeason } from '../src/data/invitationPricing.ts';
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const whatsapp = text => 'https://wa.me/528129022231?text=' + encodeURIComponent(text);
const asset = (name, w) => `/nordra/v545/assets/${name}-${w}.webp`;

function price(offer) {
  const from = offer.startingAt ? 'desde ' : '';
  const regular = offer.regularCents ? `<s class="invite-regular" aria-label="Precio regular ${from}${invitationMoney(offer.regularCents)}">${from}${invitationMoney(offer.regularCents)}</s>` : '';
  return `<p class="invite-price" data-invitation-price="${offer.id}">${regular}<span class="invite-opening">${offer.regularCents ? '<small>Precio de apertura</small>' : ''}<span>${from}<strong>${invitationMoney(offer.cents)}</strong> MXN</span></span></p>`;
}

function card(offer, featured) {
  const message = `Hola, me interesa el plan ${offer.name} para mi celebración (${offer.startingAt ? 'desde ' : ''}${invitationMoney(offer.cents)} MXN). Mi celebración es…`;
  const points = featured ? offer.points.slice(1) : offer.points.slice(0, 3);
  return `<article class="invite-card${featured ? ' invite-featured' : ''}" id="plan-${offer.id}" aria-labelledby="plan-title-${offer.id}"><div class="invite-light" aria-hidden="true"></div>
    <div class="invite-card-head"><h3 id="plan-title-${offer.id}">${esc(offer.name)}</h3>${featured ? '<span class="invite-badge">La más completa</span>' : ''}</div>
    <p class="invite-audience">${esc(offer.audience)}</p>${price(offer)}<p class="invite-delivery">Lista en ${esc(offer.delivery)}</p>
    ${featured ? '<p class="invite-inherits">Todo lo de Aurora, más:</p>' : ''}<ul class="invite-points">${points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
    <a class="invite-cta" href="${esc(whatsapp(message))}" target="_blank" rel="noopener" data-invitation-offer="${offer.id}" data-analytics-whatsapp="plan_${offer.id}">Quiero ${esc(offer.name)} <span aria-hidden="true">↗</span></a>
    <details class="invite-details"><summary>Ver todo lo que incluye <span aria-hidden="true">+</span></summary><ul>${invitationPlanFeatures[offer.id].map(text => `<li>${esc(text)}</li>`).join('')}</ul></details></article>`;
}

export function renderInvitationOffers() {
  return `<section class="home-continuation invite-offers" id="planes-invitaciones" aria-labelledby="invite-offers-title"><span class="inv-anchor" id="planes-eventos"></span>
    <div class="invite-offers-intro"><h2 id="invite-offers-title">Aurora y Boreal</h2><p>Precios de apertura y regulares en MXN, con IVA incluido. Pago único.</p></div>
    <div class="invite-grid">${invitationOffers.map(o => card(o, o.id === 'boreal')).join('')}</div>
    <a class="season-bridge" href="#temporadas">¿Una posada o una fiesta de fin de año? Diseños de temporada a ${invitationMoney(seasonalOffer.cents)} <span aria-hidden="true">→</span></a></section>`;
}

export function renderSeasons(date = new Date()) {
  const next = upcomingSeason(date);
  const message = `Hola, me interesa una invitación de temporada (${invitationMoney(seasonalOffer.cents)} MXN). Mi celebración es…`;
  return `<section class="home-continuation invite-seasons" id="temporadas" aria-labelledby="seasons-title" data-season-next="${next.id}"><span class="inv-anchor" id="temporada"></span><span class="inv-anchor" id="plan-temporada"></span><div class="invite-seasons-intro"><h2 id="seasons-title">Diseños de temporada</h2><p>Diseños listos para personalizar con tu fecha y tus datos, a ${invitationMoney(seasonalOffer.cents)} MXN.</p></div>`
    + `<ul class="season-fan">${seasons.map(s => `<li class="season-card" data-season="${s.id}" data-season-from="${s.order.from.join('-')}" data-season-to="${s.order.to.join('-')}"${s.id === next.id ? ' data-season-current' : ''}><a href="${s.demo}" aria-label="Ver la invitación de ${esc(s.name)}"><span class="season-shot"><img src="${asset(s.image, 390)}" srcset="${asset(s.image, 390)} 390w, ${asset(s.image, 780)} 780w" sizes="(max-width:700px) 60vw, 240px" width="390" height="844" alt="Invitación de ${esc(s.name)} de Nordra" loading="lazy" decoding="async"></span><span class="season-caption"><strong>${esc(s.name)}</strong><span class="season-open">Ver la invitación <span aria-hidden="true">↗</span></span></span></a></li>`).join('')}</ul><a class="season-consult" href="${esc(whatsapp(message))}" target="_blank" rel="noopener" data-invitation-offer="temporada" data-analytics-whatsapp="seasonal_design">Consultar por WhatsApp <span aria-hidden="true">↗</span></a></section>`;
}

export const closingMessage = 'Hola, Nordra. Quiero una invitación digital. Celebro: … Fecha: … Invitados aproximados: …';
const minPrice = invitationMoney(Math.min(...invitationOffers.map(o => o.cents)));
export const invitationFaq = [
  { q: '¿Por dónde empiezo?', a: 'Elige el tipo de celebración para explorar su temática y sus muestras: Bodas, Cumpleaños, Eventos o Temporada.', link: ['#tipos-invitacion', 'Encuentra tu celebración.'] },
  { q: '¿Cómo se reúnen las confirmaciones?', a: 'En Aurora y Boreal, los enlaces personales reúnen las respuestas en un panel privado. Puedes probar aquí una simulación con dos personas ficticias; no guarda ni envía respuestas.', link: ['/bodas#bodas-respuesta', 'Prueba el recorrido del invitado.', 'bodas', 'bodas-respuesta'] },
  { q: '¿Todas las invitaciones tienen el mismo alcance?', a: 'Bodas, Cumpleaños y Eventos presentan los planes Aurora y Boreal. Temporada tiene su propia oferta: confirma funciones, cambios y vigencia en su cotización.' },
  { q: '¿Cuánto tarda en estar lista?', a: `Aurora, ${invitationOffers[0].delivery}; Boreal, ${invitationOffers[1].delivery}; Temporada, ${seasonalOffer.delivery}. El plazo cuenta desde que recibimos tus datos y el anticipo.` },
  { q: '¿Cuántos invitados caben?', a: invitationFacts.guests },
  { q: '¿Cómo la envío a mis invitados?', a: 'Te entregamos un enlace para compartir por WhatsApp, redes o correo. Con Aurora y Boreal, cada invitado puede recibir su enlace personal.' },
  { q: '¿Hasta cuándo sigue activa?', a: invitationFacts.afterEvent },
  { q: '¿Puedo cambiar datos después de publicarla?', a: 'Sí. Los cambios de contenido después de la entrega se cotizan aparte, según lo que necesites.' },
  { q: '¿Emiten factura?', a: 'Sí, emitimos factura (CFDI). Avísanos al pedir tu cotización.' },
];

export function renderFaq() {
  return `<div class="faq-list">${invitationFaq.map(item => `<details class="faq-item"><summary><span>${esc(item.q)}</span><span aria-hidden="true">+</span></summary><div class="faq-answer"><p>${esc(item.a)}${item.link ? ` <a href="${item.link[0]}"${item.link[2] ? ` data-go="${item.link[2]}" data-anchor="${item.link[3]}"` : ''}>${esc(item.link[1])}</a>` : ''}</p></div></details>`).join('')}</div>`;
}

export function invitationSchema() {
  const offers = [...invitationOffers, seasonalOffer].map(o => invitationOfferSchema(o, `https://nordrastudio.mx/invitaciones#plan-${o.id}`));
  return [
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Invitaciones digitales', serviceType: 'Invitaciones digitales con confirmación de asistencia', areaServed: 'MX', provider: { '@id': 'https://nordrastudio.mx/#negocio' }, offers, review: clientReviews() },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: invitationFaq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
  ];
}

export function renderInvitationPage(html, date = new Date()) {
  if (!html.includes('{{invitations:')) return html;
  return html
    .replaceAll('{{invitations:minimum}}', minPrice)
    .replace('{{invitations:guests}}', esc(invitationFacts.guests))
    .replace('{{invitations:closing}}', encodeURIComponent(closingMessage))
    .replace('{{invitations:offers}}', renderInvitationOffers())
    .replace('{{invitations:clients}}', renderClientCases())
    .replace('{{invitations:seasons}}', renderSeasons(date))
    .replace('{{invitations:faq}}', renderFaq())
    .replace('{{invitations:schema}}', invitationSchema().map(data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`).join(''));
}

export function invitationOffersPlugin() { return { name: 'nordra-invitation-offers', transformIndexHtml: { order: 'pre', handler: html => renderInvitationPage(html) } }; }
