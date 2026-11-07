import { businessOffers, businessMoney } from '../src/data/businessOffers.ts';
import { invitationOffers, invitationMoney } from '../src/data/invitationPricing.ts';

export function renderCommercialFooter(en = false) {
 const prefix = en ? '/en' : '';
 return `<div class="commercial-footer">
 <div class="footer-layout"><div class="footer-brand"><a href="#inicio" aria-label="${en ? 'Nordra Studio, back to top' : 'Nordra Studio, ir al inicio'}"><img class="logo-light" width="640" height="213" loading="lazy" src="/nordra/v541/assets/logo-original.webp" alt="Nordra Studio"><img class="logo-dark" width="640" height="213" loading="lazy" src="/nordra/v541/assets/logo-original-oscuro.webp" alt="Nordra Studio"></a><p>${en ? 'Your idea deserves a place in the digital world' : 'Tu idea merece un lugar en el mundo digital'}</p></div>
 <nav aria-label="${en ? 'Explore Nordra' : 'Explorar Nordra'}"><a href="${prefix}/estudio" data-go="estudio">${en ? 'Meet Nordra' : 'Conoce Nordra'}</a><a href="${prefix}/negocios" data-go="negocios">${en ? 'Business' : 'Negocios'}</a><a href="${prefix}/invitaciones" target="_blank" rel="noopener">${en ? 'Invitations' : 'Invitaciones'}</a><a href="${prefix}/temporada" data-go="temporada">${en ? 'Seasonal' : 'Temporada'}</a></nav></div>
 <p class="commercial-footer-hours">${en ? 'Monterrey, Nuevo León · Monday to Friday 9 a.m.–6 p.m. · Saturday 10 a.m.–4 p.m. (Mexico City time)' : 'Monterrey, Nuevo León · Lunes a viernes 9 a.m.–6 p.m. · Sábados 10 a.m.–4 p.m.'}</p>
 <div class="footer-legal"><span>© 2026 Nordra Studio</span><a href="${en ? '/en/aviso-de-privacidad' : '/aviso-de-privacidad.html'}" target="_blank" rel="noopener">${en ? 'Privacy notice' : 'Aviso de privacidad'}</a><a href="/terminos-del-servicio.html" target="_blank" rel="noopener">${en ? 'Terms of service' : 'Términos del servicio'}</a><a href="#inicio">${en ? 'Back to top ↑' : 'Volver arriba ↑'}</a></div></div>`;
}

export function commercialFooter() {
 return { name: 'nordra-commercial-footer', transformIndexHtml: { order: 'pre', handler(html, ctx) {
  if (!html.includes('<!-- commercial:footer -->')) return;
  const en = ctx.path.startsWith('/en/');
  const from = en ? 'From' : 'Desde';
  return html.replace('<!-- commercial:footer -->', renderCommercialFooter(en))
   .replace('{{commercial:business_price}}', from + ' ' + businessMoney(Math.min(...businessOffers.map(o => o.cents))) + ' MXN')
   .replace('{{commercial:invitation_price}}', from + ' ' + invitationMoney(Math.min(...invitationOffers.map(o => o.cents))) + ' MXN')
   .replace('</head>', '<link rel="stylesheet" href="/src/site/styles/commercial-layout.css"></head>')
   .replace('</body>', '<script type="module" src="/src/site/whatsapp-dialog.mjs"></script></body>');
 } } };
}
