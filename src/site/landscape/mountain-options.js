// Temporary daylight material study; an absent/unknown choice keeps the release.
export function mountainChoice(search = '') {
  const value = new URLSearchParams(search).get('montana');
  return /^[123]$/.test(value || '') ? Number(value) : 0;
}
