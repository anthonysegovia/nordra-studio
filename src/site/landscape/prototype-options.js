// Temporary comparison switches. Remove this module when an approved selection ships.
export function landscapePrototype(search = '', comparisonMode = '') {
  const selection = new URLSearchParams(search).get('paisaje') || '';
  const names = selection === 'todo' ? ['a', 'b', 'c', 'd', 'e', 'f'] : selection.toLowerCase().split(',');
  const features = [...new Set(names.filter(name => /^[a-f]$/.test(name)))].sort();
  return { features, comparison: comparisonMode === 'entry' || comparisonMode === 'final', entrance: comparisonMode === 'entry' };
}

export function comparisonMode(frame) {
  // Only the unlinked comparison page can ignore the session entrance marker.
  try {
    if (frame?.ownerDocument.location.pathname === '/prototipos/paisaje-v2.html') return frame.dataset.landscapeMode || '';
  } catch { /* Cross-origin embedding is not the comparison page. */ }
  return '';
}
