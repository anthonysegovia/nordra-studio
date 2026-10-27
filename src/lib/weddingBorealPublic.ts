export type BorealCapability = { mode: string; eventId: string; id?: string; token?: string; accessToken?: string };
export function readBorealCapability(parameter: 'pase' | 'acceso'): BorealCapability {
  const parts = (new URLSearchParams(location.hash.slice(1)).get(parameter) || '').split('~');
  return parameter === 'pase' ? { mode: parts[0], eventId: parts[1], id: parts[2], token: parts[3] } : { mode: parts[0], eventId: parts[1], accessToken: parts[2] };
}
export async function borealPublicApi<T>(capability: BorealCapability, body: Record<string, unknown>): Promise<T> {
  if (!['real', 'sample'].includes(capability.mode) || !capability.eventId) throw new Error('link_unavailable');
  const response = await fetch(capability.mode === 'sample' ? '/api/wedding-links' : '/api/weddings', { method: 'POST', credentials: 'omit', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...capability, ...body }), signal: AbortSignal.timeout(15000) });
  const data = await response.json(); if (!response.ok) throw new Error(data.code || 'unavailable'); return data;
}
