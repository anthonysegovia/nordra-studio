import assert from 'node:assert/strict';
import test from 'node:test';
import { filterResponses, responsesCsv, summarizeResponses, updateDemoResponse } from '../src/lib/guestResponses.ts';

const initial = [
  { id: 'a', guest_name: 'Ana Torres', attendance: 'yes', updated_at: '2026-10-25T12:00:00.000Z' },
  { id: 'b', guest_name: 'Lucía Reyes', attendance: 'no', updated_at: '2026-10-25T12:10:00.000Z' },
];

test('updating a reply changes attendance totals without adding a second guest', () => {
  const added = updateDemoResponse(initial, { id: 'c', guest_name: ' Invitado   Prueba ', attendance: 'yes', updated_at: '2026-10-25T13:00:00.000Z' });
  assert.deepEqual(summarizeResponses(added), { yes: 2, no: 1, total: 3 });
  const updated = updateDemoResponse(added, { ...added[0], attendance: 'no' });
  assert.deepEqual(summarizeResponses(updated), { yes: 1, no: 2, total: 3 });
  assert.equal(updated[0].guest_name, 'Invitado Prueba');
  assert.equal(initial.length, 2);
});

test('search ignores accents and works together with attendance filters', () => {
  assert.equal(filterResponses(initial, 'LUCIA', 'no')[0].id, 'b');
  assert.equal(filterResponses(initial, 'lucia', 'yes').length, 0);
  assert.equal(filterResponses(initial, '   ', 'all').length, 2);
});

test('duplicate and invalid replies do not modify the sample guest list', () => {
  assert.throws(() => updateDemoResponse(initial, { ...initial[0], id: 'new', guest_name: 'ana  torres' }), /duplicate_name/);
  assert.throws(() => updateDemoResponse(initial, { ...initial[0], guest_name: ' ' }), /invalid_name/);
  assert.throws(() => updateDemoResponse(initial, { ...initial[0], guest_name: '<script>' }), /invalid_name/);
  assert.throws(() => updateDemoResponse(initial, { ...initial[0], attendance: 'pending' }), /invalid_attendance/);
  assert.deepEqual(summarizeResponses(initial), { yes: 1, no: 1, total: 2 });
});

test('CSV includes all replies, quotes names, preserves accents and neutralizes formulas', () => {
  const csv = responsesCsv([...initial, { ...initial[0], id: 'csv', guest_name: '  =HYPERLINK("test")' }]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"Lucía Reyes","No podrá ir"'));
  assert.ok(csv.includes('"\'  =HYPERLINK(""test"")"'));
  assert.equal(csv.split('\r\n').length, 4);
  assert.ok(responsesCsv(initial, true).includes('"Name","Attendance"'));
});
