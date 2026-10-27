import type { WeddingInvitationKind } from './weddingInvitations';

export type ImportRow = { id: string; row: number; name: string; companion: string; kind: string; included: boolean };
export const importNameKey = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase();
export function readGuestCsv(text: string): string[][] {
  if (text.length > 2_000_000) throw new Error('file_too_large');
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0];
  const separator = [';', '\t', ','].sort((a,b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = []; let row: string[] = [], value = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i+1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && char === separator) { row.push(value); value = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) { if (char === '\r' && text[i+1] === '\n') i++; row.push(value); if (row.some(v=>v.trim())) rows.push(row); row=[]; value=''; }
    else value += char;
    if (rows.length > 301 || row.length > 50 || value.length > 10000) throw new Error('import_too_many');
  }
  if (quoted) throw new Error('invalid_csv');
  row.push(value); if (row.some(v=>v.trim())) rows.push(row);
  return rows;
}
export function normalizedKind(value: string, companion: string): WeddingInvitationKind | null {
  const key = importNameKey(value).replace(/\s/g, '');
  if (['+1','1','plusone','con+1','acompanante'].includes(key)) return 'plusOne';
  if (['pareja','couple'].includes(key)) return 'couple';
  if (['individual','solo','single'].includes(key)) return 'individual';
  return key ? null : companion.trim() ? 'couple' : 'individual';
}
export function reviewImport(rows: ImportRow[], existingNames: string[], existingPeople: number) {
  const names = new Set(existingNames.filter(Boolean).map(importNameKey));
  const errors: Record<string, string> = {}; let people = 0;
  for (const row of rows.filter(row=>row.included)) {
    const kind = normalizedKind(row.kind, row.companion);
    if (!kind) { errors[row.id] = 'invalid_kind'; continue; }
    people += kind === 'individual' ? 1 : 2;
    if (kind === 'individual' && row.companion.trim()) errors[row.id] = 'individual_companion';
    for (const [index, value] of [row.name, ...(kind === 'individual' ? [] : [row.companion])].entries()) {
      const name = value.trim().replace(/\s+/g,' ');
      if (!name && kind === 'plusOne' && index === 1) continue;
      if (name.length < 2 || name.length > 100 || /[\p{Cc}\p{Cf}<>]/u.test(name)) { errors[row.id] = 'invalid_name'; continue; }
      const key = importNameKey(name);
      if (names.has(key)) errors[row.id] = 'duplicate_name';
      names.add(key);
    }
  }
  return { errors, people, overLimit: existingPeople + people > 300, selected: rows.filter(row=>row.included).length };
}
