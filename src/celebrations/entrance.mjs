// The menu and content are unavailable until the opening has actually finished.
export function entranceVisibility(phase) {
  if (!['closed', 'opening', 'open'].includes(phase)) throw new Error('Unknown entrance phase');
  return { entranceHidden: phase === 'open', contentHidden: phase !== 'open', menuHidden: phase !== 'open' };
}

export function initialTheme(storage) {
  try { return storage.getItem('nordra-theme') === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
