import { businessOffers, businessHosting, businessMoney, businessDeliveryStart } from '../src/data/businessOffers.ts';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const businessFAQs = [
 { question:'¿Cómo empiezo?', answer:'Cuéntanos qué hace tu negocio y a quién quieres llegar. Puedes llamar al 81 2902 2231 o escribir a hola@nordrastudio.mx. Si tienes textos, logotipo o fotos, compártelos para definir el alcance por escrito.' },
 { question:'¿Qué paquete elijo?', answer:'Una landing reúne tu información en una página. El sitio de negocio ofrece de cuatro a seis apartados. Para reservas, integraciones o ventas, revisa las opciones a medida. Compara los paquetes.', link:{label:'Compara los paquetes.', href:'#opciones-web'} },
 { question:'¿Cuánto tarda mi página?', answer:businessDeliveryStart + ' ' + businessOffers.map(o => o.name + ': ' + o.delivery.toLowerCase() + '.').join(' ') },
 { question:'¿Qué incluye el alojamiento?', answer:'El primer mes de alojamiento y soporte técnico está incluido desde la publicación. Después la continuidad se paga aparte: ' + businessHosting.map(h => h.name + ', ' + (h.startingAt ? 'desde ' : '') + businessMoney(h.terms.find(t => t.months === 1).cents) + ' MXN al mes').join('; ') + '. IVA incluido. El dominio queda a tu nombre. El sitio permanece en el alojamiento de Nordra mientras pagas la continuidad. El dominio y los servicios externos se cotizan por separado.' },
 { question:'¿Cómo pago y facturo?', answer:'Para empezar se requieren la propuesta aceptada, los materiales y un anticipo del 50%. El otro 50% se paga antes de publicar y entregar los accesos finales. Al confirmar la cotización, te enviamos un enlace de Mercado Pago para pagar con tarjeta de crédito o débito. Emitimos factura (CFDI).' },
 { question:'¿Y si necesito cambios?', answer:'Los cambios de contenido después de publicar se cotizan aparte. Acordamos el alcance y el costo antes de hacerlos.' },
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
 return html.replace('{{business:services-schema}}',jsonLD(serviceSchema)).replace('{{business:faq}}', '<section class="home-continuation audience-faq" id="negocios-preguntas" aria-labelledby="negocios-faq-title"><div><h2 id="negocios-faq-title">Preguntas frecuentes</h2></div><div class="faq-list">' + businessFAQs.map(({question,answer,link}) => '<details class="faq-item business-disclosure"><summary><span>' + esc(question) + '</span><span aria-hidden="true">+</span></summary><div class="faq-answer"><p>' + (link ? esc(answer).replace(esc(link.label),'<a href="'+esc(link.href)+'">'+esc(link.label)+'</a>') : esc(answer)) + '</p></div></details>').join('') + '</div></section>' + jsonLD(faqSchema));
}
export function businessContentPlugin(){return {name:'nordra-business-content',transformIndexHtml:{order:'pre',handler:renderBusinessContent}};}
