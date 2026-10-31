import { businessOffers, businessHosting, businessMoney, businessDeliveryStart } from '../src/data/businessOffers.ts';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const businessFAQs = [
 ...[
  {
    "question": "¿Qué necesito para empezar?",
    "answer": "Puedes empezar contándonos qué hace tu negocio, a quién quieres llegar y qué debería poder hacer una persona en tu web. Si tienes textos, logotipo o fotografías, compártelos al definir el contenido. El alcance se acuerda en la cotización."
  },
  {
    "question": "¿Cómo elijo entre una landing y un sitio?",
    "answer": "Compara la estructura y las funciones que necesitas: una página personalizada, una landing de hasta tres secciones, un sitio de cuatro a seis apartados, una web a medida o una tienda. Revisa las cinco opciones y su alcance.",
    "link": {
      "label": "Revisa las cinco opciones y su alcance.",
      "href": "#opciones-web"
    }
  },
  {
    "question": "¿El dominio y el alojamiento están incluidos?",
    "answer": "Los paquetes de negocio incluyen el primer mes de alojamiento y soporte técnico desde la publicación. La continuidad se paga por separado del desarrollo. Dominio, alojamiento y servicios externos se especifican en la cotización."
  }
],
 { question: '¿Cuánto tarda mi página?', answer: businessDeliveryStart + ' ' + businessOffers.map(o => o.name + ': ' + o.delivery.toLowerCase() + '.').join(' ') },
 { question: '¿El dominio y la página son míos?', answer: 'El dominio queda a tu nombre. El sitio vive en el alojamiento de Nordra mientras se paga la continuidad.' },
 { question: '¿Cuánto cuesta mantenerla al mes?', answer: 'El primer mes de alojamiento y soporte está incluido. Después: ' + businessHosting.map(h => h.name + ', ' + (h.startingAt ? 'desde ' : '') + businessMoney(h.terms.find(t => t.months === 1).cents) + ' MXN al mes').join('; ') + '. IVA incluido. El alojamiento se paga por separado del desarrollo.' },
 { question: '¿Qué pasa si quiero cambios después de publicar?', answer: 'Los cambios de contenido después de publicar se cotizan aparte. Cuéntanos qué quieres actualizar y acordamos el alcance y el costo antes de hacerlo.' },
 { question: '¿Emiten factura?', answer: 'Sí, emitimos factura (CFDI).' },
];
export const faqSchema = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity:businessFAQs.map(({question,answer}) => ({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}})) };
export const jsonLD = value => '<script type="application/ld+json">' + JSON.stringify(value).replaceAll('<','\\u003c') + '</script>';
export const serviceSchema = { '@context':'https://schema.org', '@graph':businessOffers.map(offer => ({
 '@type':'Service', '@id':'https://nordrastudio.mx/negocios#service-'+offer.id, name:offer.name, serviceType:'Diseño de páginas web',
 provider:{'@id':'https://nordrastudio.mx/#negocio'}, areaServed:['Monterrey','México'],
 offers:{'@type':'Offer',name:offer.name,url:'https://nordrastudio.mx/negocios#offer-'+offer.card,priceCurrency:'MXN',description:'Precio desde; alcance y precio final en la cotización.',
 priceSpecification:{'@type':'PriceSpecification',minPrice:offer.cents/100,priceCurrency:'MXN',valueAddedTaxIncluded:true}}
})) };
export function renderBusinessContent(html) {
 return html.replace('{{business:services-schema}}',jsonLD(serviceSchema)).replace('{{business:faq}}', '<section class="home-continuation audience-faq" id="negocios-preguntas" aria-labelledby="negocios-faq-title"><div><p class="eyebrow">ANTES DE EMPEZAR</p><h2 id="negocios-faq-title">Tu web, con las cosas claras</h2><p class="faq-intro">Los detalles que ayudan a elegir con calma.</p></div><div class="faq-list">' + businessFAQs.map(({question,answer,link}) => '<details class="faq-item business-disclosure"><summary><span>' + esc(question) + '</span><span aria-hidden="true">+</span></summary><div class="faq-answer"><p>' + (link ? esc(answer).replace(esc(link.label),'<a href="'+esc(link.href)+'">'+esc(link.label)+'</a>') : esc(answer)) + '</p></div></details>').join('') + '</div></section>' + jsonLD(faqSchema));
}
export function businessContentPlugin(){return {name:'nordra-business-content',transformIndexHtml:{order:'pre',handler:renderBusinessContent}};}
