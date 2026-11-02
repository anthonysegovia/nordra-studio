import {seasons, upcomingSeason} from '../data/invitationPricing.ts';

export const chapterId = id => `temporada-${id === 'posadas' ? 'navidad' : id}`;
export const cover = (season, width) => `/nordra/v545/assets/${season.image}-${width}.webp`;
export function seasonOrder(date = new Date()) {
  const first = seasons.indexOf(upcomingSeason(date));
  const ordered = [...seasons.slice(first), ...seasons.slice(0, first)];
  // Approved exception: keep Halloween last unless it is the chosen season.
  return ordered[0].id === 'halloween' ? ordered : [...ordered.filter(s => s.id !== 'halloween'), ...ordered.filter(s => s.id === 'halloween')];
}
export function inOrderingWindow(season, date) {
  const day = (date.getMonth() + 1) * 100 + date.getDate();
  const {from, to} = season.order;
  return day >= from[0] * 100 + from[1] && day <= to[0] * 100 + to[1];
}
export function returnMessage(season, language = 'es-MX') {
  const month = new Intl.DateTimeFormat(language, {month:'long'}).format(new Date(2000, season.order.from[0] - 1, 1));
  return language==='en'?`Back in ${month}`:`Vuelve en ${month}`;
}
