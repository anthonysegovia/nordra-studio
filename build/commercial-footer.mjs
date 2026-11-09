import { businessOffers, businessMoney } from '../src/data/businessOffers.ts';
import { invitationOffers, invitationMoney } from '../src/data/invitationPricing.ts';

export function renderCommercialFooter(en = false) {
 const prefix = en ? '/en' : '';
 return `<p class="closing-hours">${en ? 'Mon–Fri 9–6 · Sat 10–4 (CDMX)' : 'Lun a vie 9–6 · Sáb 10–4'}</p><div class="commercial-footer">
 <div class="footer-layout"><div class="footer-brand"><a href="#inicio" aria-label="${en ? 'Nordra Studio, back to top' : 'Nordra Studio, ir al inicio'}"><img class="logo-light" width="640" height="213" loading="lazy" src="/nordra/v551/assets/logo-original-360.webp" alt="Nordra Studio"><img class="logo-dark" width="640" height="213" loading="lazy" src="/nordra/v551/assets/logo-original-oscuro-360.webp" alt="Nordra Studio"></a><p>${en ? 'Your idea deserves a place in the digital world' : 'Tu idea merece un lugar en el mundo digital'}</p></div>
 <nav aria-label="${en ? 'Explore Nordra' : 'Explorar Nordra'}"><a href="${prefix}/estudio" data-go="estudio">${en ? 'Meet Nordra' : 'Conoce Nordra'}</a><a href="${prefix}/negocios" data-go="negocios">${en ? 'Business' : 'Negocios'}</a><a href="${prefix}/invitaciones" target="_blank" rel="noopener">${en ? 'Invitations' : 'Invitaciones'}</a><a href="${prefix}/temporada" data-go="temporada">${en ? 'Seasonal' : 'Temporada'}</a></nav></div>
 <p class="commercial-footer-hours">Monterrey, Nuevo León</p>
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
