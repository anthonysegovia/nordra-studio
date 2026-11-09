import { invitationOfferSchema } from './invitation-schema.mjs';
import { clientReviews, renderClientCases } from './client-cases.mjs';
import { invitationOffers, invitationPlanFeatures, invitationMoney, invitationFacts, seasonalOffer } from '../src/data/invitationPricing.ts';
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const whatsapp = text => 'https://wa.me/528129022231?text=' + encodeURIComponent(text);

function price(offer, wedding) {
  const from = offer.startingAt ? 'desde ' : '';
  const regular = offer.regularCents ? `<s class="invite-regular" aria-label="Precio regular ${from}${invitationMoney(offer.regularCents)}">${from}${invitationMoney(offer.regularCents)}</s>` : '';
  const opening = `<span class="invite-opening">${offer.regularCents ? '<small>Precio de apertura</small>' : ''}<span>${from}<strong>${invitationMoney(offer.cents)}</strong> MXN</span></span>`;
  const delivery = `Lista en ${esc(offer.delivery)}`;
  if (wedding) return `<p class="invite-price" data-invitation-price="${offer.id}">${opening}<span class="paper-terms">${regular} · <span>${delivery}</span></span></p>`;
  return `<p class="invite-price" data-invitation-price="${offer.id}">${regular}${opening}</p>`;
}

export function invitationCard(offer, idPrefix = '', celebration = 'mi celebración') {
  const wedding = idPrefix === 'bodas-';
  const featured = offer.id === 'boreal';
  const occasion = { 'cumpleanos-': 'Cumpleaños', 'eventos-': 'Evento' }[idPrefix];
  const message = `Hola, me interesa el plan ${offer.name} para ${celebration} (${offer.startingAt ? 'desde ' : ''}${invitationMoney(offer.cents)} MXN). ${celebration[0].toUpperCase() + celebration.slice(1)} es…` + (occasion ? `\n\nTipo de celebración: ${occasion}.` : '');
  const points = featured ? offer.points.slice(1, 4) : offer.points.slice(0, 3);
  const badge = wedding ? '<span class="wedding-seal"><span>La más</span> <span>completa</span></span>' : '<span class="invite-badge">La más completa</span>';
  const lily = '<img alt="" src="/artwork/wedding-lilies/lily-stem-v1-320.webp" srcset="/artwork/wedding-lilies/lily-stem-v1-320.webp 320w, /artwork/wedding-lilies/lily-stem-v1-640.webp 640w" sizes="(max-width:700px) 78px, 120px" width="320" height="480" loading="lazy">';
  return `<article class="invite-card${featured ? ' invite-featured' : ''}" id="${idPrefix}plan-${offer.id}" aria-labelledby="${idPrefix}plan-title-${offer.id}"><div class="invite-light" aria-hidden="true"></div>${wedding ? `<div class="paper-lilies" aria-hidden="true">${lily}${featured ? lily : ''}</div><div class="paper-copy">` : ''}
    <div class="invite-card-head"><h3 id="${idPrefix}plan-title-${offer.id}">${esc(offer.name)}</h3>${featured ? badge : ''}</div>
    ${wedding ? `<p class="invite-audience">${esc(offer.audience)}</p>` : ''}${price(offer, wedding)}
    ${featured ? '<p class="invite-inherits">Todo lo de Aurora, más:</p>' : ''}<ul class="invite-points">${points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>${wedding ? '</div>' : ''}
    <a class="invite-cta" href="${esc(whatsapp(message))}" target="_blank" rel="noopener" data-invitation-offer="${offer.id}" data-analytics-whatsapp="plan_${offer.id}">Quiero ${esc(offer.name)} <span aria-hidden="true">↗</span></a>
    <details class="invite-details"><summary>${wedding ? '<span class="plan-details-desktop">Ver todo lo que incluye</span><span class="plan-details-mobile">Ver todo lo incluido</span>' : 'Ver todo lo que incluye'} <span aria-hidden="true">+</span></summary><ul>${wedding ? '' : `<li>Lista en ${esc(offer.delivery)}</li>`}${invitationPlanFeatures[offer.id].map(text => `<li${featured && !text.startsWith('Todo Aurora') ? ' class="only-boreal"' : ''}>${esc(text)}</li>`).join('')}</ul></details></article>`;
}

export function renderInvitationOffers() {
  return `<section class="home-continuation invite-offers" id="planes-invitaciones" aria-labelledby="invite-offers-title"><span class="inv-anchor" id="planes-eventos"></span>
    <div class="invite-offers-intro"><h2 id="invite-offers-title">Aurora y Boreal</h2><p>MXN con IVA incluido. Pago único, en dos partes: 50 % para iniciar y 50 % al aprobar.</p><p class="plan-assurance">Incluye 3 rondas de cambios. Tarjeta con Mercado Pago y factura (CFDI).</p></div>
    <div class="invite-grid">${invitationOffers.map(o => invitationCard(o)).join('')}</div>
    <a class="season-bridge" href="/temporada">¿Una posada o una fiesta de fin de año? Diseños de temporada a ${invitationMoney(seasonalOffer.cents)} <span aria-hidden="true">→</span></a></section>`;
}

export const closingMessage = 'Hola, Nordra. Quiero una invitación digital. Celebro: … Fecha: … Invitados aproximados: …';
const minPrice = invitationMoney(Math.min(...invitationOffers.map(o => o.cents)));
export const invitationFaq = [
  { q: '¿Qué incluye el panel?', a: 'Aurora y Boreal incluyen un panel privado con enlaces personales, confirmados y pendientes. Boreal suma mesas, pases QR y registro de llegadas. La simulación no guarda ni envía respuestas.', link: ['/bodas#bodas-respuesta', 'Prueba el recorrido del invitado.', 'bodas', 'bodas-respuesta'] },
  { q: '¿Cuántos invitados caben?', a: invitationFacts.guests },
  { q: '¿Cómo la comparto?', a: 'Envía el enlace por WhatsApp, redes o correo. En Aurora y Boreal cada invitado puede recibir su enlace personal.' },
  { q: '¿Cuánto tarda?', a: `Aurora, ${invitationOffers[0].delivery}; Boreal, ${invitationOffers[1].delivery}; Temporada, ${seasonalOffer.delivery}. El plazo cuenta desde que recibimos tus datos y el anticipo.` },
  { q: '¿Hasta cuándo sigue activa?', a: invitationFacts.afterEvent + ' Los cambios de contenido después de la entrega se cotizan aparte. En Temporada, confirma funciones, cambios y vigencia en tu cotización.' },
  { q: '¿Cómo pago y facturo?', a: 'Para iniciar necesitamos la propuesta aceptada, los materiales y un anticipo del 50%. El otro 50% se paga después de tu aprobación y antes de publicar o entregar los accesos finales. Al confirmar la cotización, te enviamos un enlace de Mercado Pago para pagar con tarjeta de crédito o débito. Emitimos factura (CFDI); solicítala al pedir tu cotización.' },

];

export function renderFaq() {
  return `<div class="faq-list">${invitationFaq.map(item => `<details class="faq-item"><summary><span>${esc(item.q)}</span><span aria-hidden="true">+</span></summary><div class="faq-answer"><p>${esc(item.a)}${item.link ? ` <a href="${item.link[0]}"${item.link[2] ? ` data-go="${item.link[2]}" data-anchor="${item.link[3]}"` : ''}>${esc(item.link[1])}</a>` : ''}</p></div></details>`).join('')}</div>`;
}

export function invitationSchema() {
  const offers = [...invitationOffers, seasonalOffer].map(o => invitationOfferSchema(o, o.id === 'temporada' ? 'https://nordrastudio.mx/temporada' : `https://nordrastudio.mx/invitaciones#plan-${o.id}`));
  return [
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Invitaciones digitales', serviceType: 'Invitaciones digitales con confirmación de asistencia', areaServed: 'MX', provider: { '@id': 'https://nordrastudio.mx/#negocio' }, offers, review: clientReviews() },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: invitationFaq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
  ];
}

export function renderInvitationPage(html) {
  if (!html.includes('{{invitations:')) return html;
  return html
    .replaceAll('{{invitations:minimum}}', minPrice)
    .replace('{{invitations:guests}}', esc(invitationFacts.guests))
    .replace('{{invitations:closing}}', encodeURIComponent(closingMessage))
    .replace('{{invitations:offers}}', renderInvitationOffers())
    .replace('{{invitations:clients}}', renderClientCases())
    .replace('{{invitations:faq}}', renderFaq())
    .replace('{{invitations:schema}}', invitationSchema().map(data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`).join(''));
}

export function invitationOffersPlugin() { return { name: 'nordra-invitation-offers', transformIndexHtml: { order: 'pre', handler: html => renderInvitationPage(html) } }; }
