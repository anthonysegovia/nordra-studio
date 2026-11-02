import faq from '../src/data/occasionFaq.json' with { type: 'json' };
import { invitationMoney, invitationOffers, seasonalOffer } from '../src/data/invitationPricing.ts';
import { invitationOfferSchema } from './invitation-schema.mjs';

const names = { bodas: 'bodas', cumpleanos: 'cumpleaños', eventos: 'eventos', temporada: 'temporada' };
// These editorial answers only contain inline links. Decode entities after
// removing tags so structured answers contain the complete visible link text.
export function plainAnswer(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) =>
    ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity]);
}

export function occasionSchema(page) {
  const url = `https://nordrastudio.mx/${page}`;
  return [
    {
      '@context': 'https://schema.org', '@type': 'Service',
      name: `Invitaciones digitales de ${names[page]}`,
      serviceType: `Invitaciones digitales para ${names[page]}`,
      areaServed: 'MX', provider: { '@id': 'https://nordrastudio.mx/#negocio' }, url,
      offers: (page === 'temporada' ? [seasonalOffer] : invitationOffers).map(offer =>
        invitationOfferSchema(offer, page === 'temporada' ? url : `${url}#${page}-plan-${offer.id}`)),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq[page].map(item => ({
        '@type': 'Question', name: plainAnswer(item.question),
        acceptedAnswer: { '@type': 'Answer', text: plainAnswer(item.answerHtml) },
      })),
    },
  ];
}

export function renderOccasionPrices(html) {
  return html.replace(/\{\{offer:(aurora|boreal):(opening|regular)\}\}/g, (_, id, kind) => {
    const offer = invitationOffers.find(item => item.id === id);
    return (offer.startingAt ? 'Desde ' : '') + invitationMoney(kind === 'regular' ? offer.regularCents : offer.cents);
  }).replaceAll('{{occasion:seasonal-price}}', invitationMoney(seasonalOffer.cents))
    .replaceAll('{{occasion:seasonal-price-encoded}}', encodeURIComponent(invitationMoney(seasonalOffer.cents)));
}

export function renderOccasionPage(html) {
  return renderOccasionPrices(html).replace(/\{\{occasion:(bodas|cumpleanos|eventos|temporada):(faq|schema)\}\}/g, (_, page, kind) =>
    kind === 'faq'
      ? faq[page].map(item => `<details class="faq-item"><summary><span>${item.question}</span><span aria-hidden="true">+</span></summary><div class="faq-answer"><p>${item.answerHtml}</p></div></details>`).join('')
      : occasionSchema(page).map(data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`).join(''));
}

export function occasionContentPlugin() {
  return { name: 'nordra-occasion-content', transformIndexHtml: { order: 'pre', handler: renderOccasionPage } };
}
