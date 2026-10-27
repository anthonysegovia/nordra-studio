import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';

// Resolve this bundler-style TS import when running the same source in Node.
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier === './guestResponses' && context.parentURL?.endsWith('/src/lib/weddingGuests.ts') ? './guestResponses.ts' : specifier, context);
} });
const { weddingSampleResponses: sample, saveWeddingGuest, removeWeddingGuest, encodeWeddingPreview, decodeWeddingPreview } = await import('../src/lib/weddingGuests.ts');
const { summarizeResponses, responsesCsv } = await import('../src/lib/guestResponses.ts');
const newGuest = { id: 'wedding-guest-test', guest_name: '  Ana   Torres  ', attendance: 'yes', updated_at: '2026-10-26T12:00:00Z' };
const now = Date.parse('2026-10-26T12:00:00Z');

test('24 unique sample guests; add, edit in place and remove keep totals and CSV consistent', () => {
  assert.deepEqual(summarizeResponses(sample), { yes: 18, no: 6, total: 24 });
  const added = saveWeddingGuest(sample, newGuest, 'add');
  assert.equal(added[0].guest_name, 'Ana Torres');
  assert.deepEqual(summarizeResponses(added), { yes: 19, no: 6, total: 25 });
  const edited = saveWeddingGuest(added, { ...added[8], guest_name: 'Nombre actualizado', attendance: 'no' }, 'edit');
  assert.equal(edited[8].guest_name, 'Nombre actualizado');
  assert.deepEqual(edited.map(row => row.id), added.map(row => row.id));
  const removed = removeWeddingGuest(edited, newGuest.id);
  assert.equal(removed.length, 24);
  assert.equal(responsesCsv(removed).includes('Ana Torres'), false);
  assert.ok(responsesCsv(removed).includes('Nombre actualizado'));
  assert.equal(sample.length, 24);
  assert.equal(sample[7].guest_name, 'Valeria Castro');
});

test('duplicates and invalid changes are rejected without modifying the list', () => {
  assert.throws(() => saveWeddingGuest(sample, { ...newGuest, guest_name: 'MARIANA  LOPEZ' }, 'add'), /duplicate_name/);
  assert.throws(() => saveWeddingGuest(sample, { ...sample[1], guest_name: sample[0].guest_name }, 'edit'), /duplicate_name/);
  assert.throws(() => saveWeddingGuest(sample, { ...newGuest, guest_name: '  ' }, 'add'), /invalid_name/);
  assert.throws(() => saveWeddingGuest(sample, { ...newGuest, attendance: 'pending' }, 'add'), /invalid_attendance/);
  assert.throws(() => saveWeddingGuest(sample, newGuest, 'edit'), /guest_missing/);
  assert.throws(() => saveWeddingGuest(sample, sample[0], 'add'), /duplicate_id/);
  assert.throws(() => removeWeddingGuest(sample, 'missing'), /guest_missing/);
  assert.deepEqual(summarizeResponses(sample), { yes: 18, no: 6, total: 24 });
});

test('changes and an empty list survive reload; expired, malformed and duplicate storage is ignored', () => {
  const rows = removeWeddingGuest(saveWeddingGuest(sample, newGuest, 'add'), sample[0].id);
  assert.deepEqual(decodeWeddingPreview(encodeWeddingPreview(rows, now), now), rows);
  assert.deepEqual(decodeWeddingPreview(encodeWeddingPreview([], now), now), []);
  assert.equal(decodeWeddingPreview(encodeWeddingPreview(rows, now), now + 7200000), null);
  assert.equal(decodeWeddingPreview('{broken', now), null);
  assert.equal(decodeWeddingPreview(encodeWeddingPreview([sample[0], sample[0]], now), now), null);
  assert.equal(decodeWeddingPreview(encodeWeddingPreview([{ ...newGuest, id: '<bad>' }], now), now), null);
  assert.equal(decodeWeddingPreview(encodeWeddingPreview([{ ...newGuest, updated_at: 'invalid' }], now), now), null);
});

test('legacy trial reply migrates into the expanded list', () => {
  const legacy = JSON.stringify({ version: 1, expires: now + 60000, reply: newGuest });
  const rows = decodeWeddingPreview(legacy, now);
  assert.equal(rows.length, 25);
  assert.equal(rows[0].id, 'wedding-preview-reply');
  assert.equal(rows[0].guest_name, 'Ana Torres');
});

test('deleting the last guest preserves an empty list and later additions still work', () => {
  const empty = removeWeddingGuest([newGuest], newGuest.id);
  assert.deepEqual(summarizeResponses(empty), { yes: 0, no: 0, total: 0 });
  assert.equal(saveWeddingGuest(empty, newGuest, 'add').length, 1);
});
