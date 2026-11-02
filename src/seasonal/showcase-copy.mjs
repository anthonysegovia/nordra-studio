import { seasonOrder } from './order.mjs';

export function showcaseSeasonText(date = new Date()) {
  const ordered = seasonOrder(date);
  // Keep the short description focused on the chosen season and its follow-up;
  // Halloween remains discoverable in the collection outside its own window.
  const visible = ordered[0].id === 'halloween' ? ordered : ordered.filter(s => s.id !== 'halloween');
  const labels = visible.flatMap(s => s.name.split(' y '));
  const tail = labels.pop();
  const last = tail === 'Fin de año' ? 'fin de año' : tail;
  return `${labels.join(', ')} y ${last}.`;
}
