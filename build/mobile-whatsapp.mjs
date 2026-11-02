export function mobileWhatsApp(html) {
  if (!html.includes('{{mobile:whatsapp}}')) return html;
  const contact = html.match(/<a class="primary-action(?: business-halo)?" href="(https:\/\/wa\.me\/[^"]+)"[^>]*(?:data-analytics-whatsapp="closing"|data-business-contact="whatsapp")[^>]*>/);
  if (!contact) throw Error('Missing primary WhatsApp contact for the mobile bar');
  return html.replace('{{mobile:whatsapp}}', () => `<a class="mobile-whatsapp" href="${contact[1]}" target="_blank" rel="noopener" data-analytics-whatsapp="mobile_bar">WhatsApp</a>`);
}
