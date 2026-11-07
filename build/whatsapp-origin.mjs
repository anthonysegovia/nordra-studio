const pages = new Set(['', 'negocios', 'invitaciones', 'bodas', 'cumpleanos', 'eventos', 'temporada', 'estudio']);
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export function commercialRoute(path) {
  const route = path.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '');
  return pages.has(route.replace(/^\/(?:en\/)?/, '').replace(/^en$/, '')) ? route : null;
}

export function whatsappOrigin(href, route, plan = '') {
  const url = new URL(decode(href));
  const prefix = route === '/en' || route.startsWith('/en/') ? 'From' : 'Desde';
  const message = url.searchParams.get('text') || '';
  const origin = `${prefix} nordrastudio.mx${route}${plan ? ' · ' + decode(plan) : ''}`;
  // Keep %20 for spaces, as the original links did; some WhatsApp clients show «+» literally.
  url.searchParams.delete('text');
  const rest = url.searchParams.toString();
  return escape(`${url.origin}${url.pathname}?${rest ? rest + '&' : ''}text=${encodeURIComponent(message + '\n\n' + origin)}`);
}

export function addWhatsAppOrigins(html, path) {
  const route = commercialRoute(path);
  if (route === null) return html;
  const closing = html.match(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]*)"[^>]*data-analytics-whatsapp="closing"/);
  return html.replace(/<a\b[^>]*>/g, tag => {
    const personalized = tag.includes('data-analytics-whatsapp="letrero"');
    if (personalized && closing) tag = tag.replace('href="#"', `href="${closing[1]}"`);
    const href = tag.match(/\bhref="(https:\/\/wa\.me\/[^\"]*)"/);
    if (!href) return tag;
    const attribute = name => tag.match(new RegExp(`\\b${name}="([^\"]*)"`))?.[1];
    const plan = attribute('data-offer-name') || ({ aurora: 'Aurora', boreal: 'Boreal' }[attribute('data-invitation-offer')]) || (attribute('data-analytics-whatsapp') === 'seasonal_design' ? 'Temporada' : '');
    const result = tag.replace(href[0], `href="${whatsappOrigin(href[1], route, plan)}"`);
    if (personalized) {
      const message = new URL(decode(whatsappOrigin(href[1], route))).searchParams.get('text');
      return result.replace(/>$/, ` data-whatsapp-origin="${escape(message.split('\n\n').at(-1))}">`);
    }
    // Business controls reuse this build-time URL for closing/mobile contacts.
    return attribute('data-offer') ? result.replace(/>$/, ` data-whatsapp-page-href="${whatsappOrigin(href[1], route)}">`) : result;
  });
}

export function whatsappOriginPlugin() {
  return { name: 'nordra-whatsapp-origin', transformIndexHtml: { order: 'post', handler: (html, ctx) => addWhatsAppOrigins(html, ctx.path) } };
}
