import { clientCases } from '../src/data/clientCases.ts';
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value));

export function validateClientCases(cases) {
  for (const item of cases) {
    if (!date(item.authorizedOn)) throw Error(`Client authorization missing: ${item.id}`);
    if (item.opinion.text.includes('[Opinión del cliente pendiente]')) throw Error(`Placeholder opinion: ${item.id}`);
    if (item.opinion.text && !date(item.opinion.authorizedOn)) throw Error(`Opinion authorization missing: ${item.id}`);
    if (item.highlight) {
      if (!date(item.opinion.authorizedOn)) throw Error(`Highlight authorization missing: ${item.id}`);
      const sentences = new Intl.Segmenter('es', { granularity: 'sentence' }).segment(item.opinion.text);
      if (![...sentences].some(({ segment }) => segment.trim() === item.highlight)) {
        throw Error(`Highlight must match a complete approved sentence: ${item.id}`);
      }
    }
    if (item.rating && (!date(item.rating.documentedOn) || item.rating.value !== 5)) throw Error(`Rating documentation missing: ${item.id}`);
  }
}

export function clientReviews(cases = clientCases) {
  validateClientCases(cases);
  // Keep the documented rating exclusively in the visible design. Explicit
  // fields prevent a future data change from leaking ratings into JSON-LD.
  return cases.filter(item => item.opinion.text).map(item => ({
    '@type': 'Review',
    author: { '@type': item.authorType, name: item.displayName },
    reviewBody: item.opinion.text,
  }));
}

function renderRating(item, en = false) {
  return item.rating ? `<p class="client-case-rating" role="img" aria-label="${en ? 'Rating: 5 out of 5' : 'Calificación: 5 de 5'}"><span aria-hidden="true">★★★★★ <span>5/5</span></span></p>` : '';
}

export function renderHomeClientHighlights(html, cases = clientCases) {
  if (!html.includes('{{clients:home}}')) return html;
  validateClientCases(cases);
  const en = html.includes('<html lang="en"');
  const occasion = { Posada: 'Christmas gathering', 'Fiesta de Halloween': 'Halloween party' };
  const quotes = cases.filter(item => item.highlight).map(item => `
    <figure class="client-case client-highlight">
      ${renderRating(item, en)}
      <blockquote${en ? ' lang="es-MX"' : ''}><p>${esc(item.highlight)}</p></blockquote>
      <figcaption><strong>${esc(item.displayName)}</strong> · ${esc(en ? occasion[item.occasion] ?? item.occasion : item.occasion)}</figcaption>
    </figure>`);
  const section = `<section class="home-client-highlights" aria-labelledby="client-highlights-title">
    <h2 id="client-highlights-title">${en ? 'In our clients’ words' : 'Lo que dicen nuestros clientes'}</h2>
    <div class="client-case-grid">${quotes.join('')}</div>
    <a class="options-compare" data-anchor="clientes-reales" href="${en ? '/en' : ''}/invitaciones#clientes-reales">${en ? 'See their invitations' : 'Ver sus invitaciones'} <span aria-hidden="true">→</span></a>
  </section>`;
  return html.replace('{{clients:home}}', () => quotes.length ? section : '');
}

export function renderClientCases(cases = clientCases) {
  validateClientCases(cases);
  if (!cases.length) return '';
  return `<section class="home-continuation client-cases" id="clientes-reales" aria-labelledby="client-cases-title"><div class="client-cases-intro"><h2 id="client-cases-title">Clientes reales</h2></div><div class="client-case-grid">${cases.map(item => {
    const first = [...new Intl.Segmenter('es', {granularity:'sentence'}).segment(item.opinion.text)][0]?.segment.trim();
    const opinion = first ? `<div class="client-case-opinion">${renderRating(item)}<blockquote class="client-highlight-quote"><p>${esc(first)}</p></blockquote><details class="client-opinion-full"><summary>Leer opinión completa <span aria-hidden="true">+</span></summary><blockquote><p>${esc(item.opinion.text)}</p><footer>${esc(item.displayName)}</footer></blockquote></details></div>` : '';
    return `<article class="client-case" aria-labelledby="client-${item.id}">${opinion}<p class="client-case-by"><strong id="client-${item.id}">${esc(item.displayName)}</strong> <span aria-hidden="true">·</span> <span>${esc(item.occasion)}</span></p><a class="options-compare" href="${esc(item.invitationUrl)}" target="_blank" rel="noopener">Ver la invitación <span aria-hidden="true">↗</span></a></article>`;
  }).join('')}</div></section>`;
}
