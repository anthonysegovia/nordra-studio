export const commercialRoutes = Object.freeze({
  index: '/', estudio: '/estudio', negocios: '/negocios',
  invitaciones: '/invitaciones', bodas: '/bodas', cumpleanos: '/cumpleanos',
  eventos: '/eventos', temporada: '/temporada',
});
export const buttonIds = Object.freeze(['hero_quote', 'closing', 'plan_aurora', 'plan_boreal', 'web_option', 'footer', 'seasonal_design']);
export const preferenceKey = 'nordra-analytics-disabled';
const hosts = new Set(['nordrastudio.mx', 'www.nordrastudio.mx', 'localhost', '127.0.0.1']);

export function commercialPage(href) {
  try {
    const url = new URL(href);
    if (!hosts.has(url.hostname) || !['http:', 'https:'].includes(url.protocol)) return null;
    if (url.searchParams.has('panel') || url.searchParams.has('pago')) return null;
    if (url.pathname === '/index.html') return 'index';
    return Object.keys(commercialRoutes).find(page => commercialRoutes[page] === url.pathname || (page !== 'index' && commercialRoutes[page] + '.html' === url.pathname)) ?? null;
  } catch { return null; }
}

export function measurementDisabled(storage) {
  try { return storage.getItem(preferenceKey) === 'true'; } catch { return true; }
}

// The provider can include external document.referrer independently of beforeSend.
// Decline measurement if that referrer could contain a private path or parameters.
export function safeReferrer(referrer, origin) {
  if (!referrer) return true;
  try {
    const url = new URL(referrer);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false;
    return url.origin === origin || (url.pathname === '/' && !url.search && !url.hash);
  } catch { return false; }
}

export function whatsappProperties(page, button) {
  if (!Object.hasOwn(commercialRoutes, page) || !buttonIds.includes(button)) return null;
  return { page, button };
}

export function sanitizeEvent(event, page) {
  if (!Object.hasOwn(commercialRoutes, page)) return null;
  const url = 'https://nordrastudio.mx' + commercialRoutes[page];
  if (event?.type === 'pageview') return { type: 'pageview', url };
  const payload = event?.payload, data = payload?.data;
  if (event?.type !== 'event' || payload?.name !== 'whatsapp_click' || !data ||
      Object.keys(data).length !== 2 || data.page !== page) return null;
  const allowed = whatsappProperties(data.page, data.button);
  return allowed ? { type: 'event', url, payload: { name: 'whatsapp_click', data: allowed } } : null;
}

export function activationProperties(event, page) {
  if (!event.isTrusted || event.defaultPrevented ||
      !((event.type === 'click' && event.button === 0) || (event.type === 'auxclick' && event.button === 1))) return null;
  const link = event.target?.closest?.('a[data-analytics-whatsapp]');
  if (!link) return null;
  try {
    const url = new URL(link.href);
    if (url.protocol !== 'https:' || !['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) return null;
  } catch { return null; }
  // Neither href nor visible text leaves this boundary.
  return whatsappProperties(page, link.dataset.analyticsWhatsapp);
}
