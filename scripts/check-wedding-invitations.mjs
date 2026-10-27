import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(['./guestResponses', './weddingGuests'].includes(specifier) && /\/src\/lib\/wedding(Invitations|Guests)\.ts$/.test(context.parentURL ?? '') ? `${specifier}.ts` : specifier, context);
} });
const { weddingInvitationSamples: samples, summarizeInvitations: totals, saveWeddingInvitation: save, removeWeddingInvitation: remove, setWeddingAttendance: attend, filterInvitations: filter, encodeInvitations: encode, decodeInvitations: decode, invitationsCsv: csv } = await import('../src/lib/weddingInvitations.ts');
const { weddingSampleResponses: legacy, encodeWeddingPreview } = await import('../src/lib/weddingGuests.ts');
const now = Date.parse('2026-10-26T12:00:00Z');
const fresh = () => structuredClone(samples);

test('samples cover all kinds and count people, including reserved unnamed companions', () => {
  assert.deepEqual(totals(samples), { invitations:16, total:24, yes:14, no:4, pending:6 });
  assert.equal(new Set(samples.map(x => x.kind)).size, 3);
  assert.equal(samples.filter(x => x.kind === 'plusOne' && !x.people[1].name).length, 2);
});
test('a person can confirm or decline without changing their partner or assigned places', () => {
  const changed = attend(samples, samples[1].id, samples[1].people[1].id, 'no');
  assert.deepEqual(changed[1].people.map(x => x.attendance), ['yes','no']);
  assert.deepEqual(totals(changed), { invitations:16, total:24, yes:14, no:5, pending:5 });
  assert.equal(samples[1].people[1].attendance, 'pending');
});
test('unknown +1 requires a name to confirm and keeps the same reserved place', () => {
  assert.throws(() => attend(samples,samples[2].id,samples[2].people[1].id,'yes'), /companion_name_required/);
  const next = fresh(); next[2].people[1].name = 'Ana Torres'; next[2].people[1].attendance = 'yes';
  const changed = save(samples,next[2],'edit');
  assert.equal(changed[2].people[1].id,samples[2].people[1].id);
  assert.equal(totals(changed).yes,15); assert.equal(totals(changed).total,24);
});
test('add, edit type, and remove operate on whole invitations', () => {
  for (const kind of ['individual','couple','plusOne']) {
    const input = {id:'wedding-test',kind,updated_at:new Date(now).toISOString(),people:[{id:'wedding-test-a',name:'Ana Torres',attendance:'pending'},...(kind==='individual'?[]:[{id:'wedding-test-b',name:kind==='plusOne'?'':'Jorge Ramos',attendance:'pending'}])]};
    const added=save(samples,input,'add'); assert.equal(totals(added).total,24+input.people.length);
    assert.deepEqual(remove(added,input.id),samples);
    const single=save(added,{...input,kind:'individual',people:input.people.slice(0,1)},'edit');
    assert.equal(totals(single).total,25);
  }
  assert.equal(totals(remove(samples,samples[1].id)).total,22);
});
test('invalid cardinality, duplicates, invalid names and missing records are rejected', () => {
  assert.throws(() => save(samples,{...samples[0],people:[]},'edit'),/invalid_invitation/);
  assert.throws(() => save(samples,{...samples[1],kind:'individual'},'edit'),/invalid_invitation/);
  const next=fresh(); next[1].people[1].name='MARIANA LOPEZ';
  assert.throws(() => save(samples,next[1],'edit'),/duplicate_name/);
  next[1].people[1].name=''; assert.throws(() => save(samples,next[1],'edit'),/invalid_name/);
  assert.throws(() => attend(samples,samples[0].id,'wedding-missing','yes'),/guest_missing/);
});
test('search finds a companion and attendance filtering keeps the group together', () => {
  assert.equal(filter(samples,'isabel garcia','pending')[0].people.length,2);
  assert.equal(filter(samples,'fernando','no')[0].people[0].name,'Valeria Castro');
  assert.equal(filter(samples,'not a guest','all').length,0);
});
test('CSV has one row per person with invitation grouping, pending replies and safe cells', () => {
  const value=csv(samples); assert.equal(value.split('\r\n').length,25);
  assert.ok(value.includes('"Acompañante por definir","Pendiente"'));
  assert.ok(value.includes('Daniel Moreno & Isabel García'));
  const next=fresh(); next[0].people[0].name='=FORMULA';
  assert.ok(csv(next).includes('"\'=FORMULA"'));
});
test('v3 preserves edits and empty lists, rejects expiry and malformed payloads', () => {
  assert.deepEqual(decode(encode(samples,now),now),samples);
  assert.deepEqual(decode(encode([],now),now),[]);
  assert.equal(decode(encode(samples,now),now+7200000),null);
  assert.equal(decode(encode(samples,now),now-1),null);
  const bad=fresh(); bad[1].people[1].id=bad[0].people[0].id;
  assert.equal(decode(encode(bad,now),now),null);
  assert.equal(decode('{broken',now),null);
});
test('legacy untouched samples upgrade; user edits and empty lists are preserved', () => {
  assert.deepEqual(decode(encodeWeddingPreview(legacy,now),now),samples);
  const changed=structuredClone(legacy); changed[0].guest_name='Nombre conservado';
  const migrated=decode(encodeWeddingPreview(changed,now),now);
  assert.equal(migrated.length,24); assert.equal(migrated[0].people[0].name,'Nombre conservado');
  assert.ok(migrated.every(x=>x.kind==='individual'));
  assert.deepEqual(decode(encodeWeddingPreview([],now),now),[]);
});
