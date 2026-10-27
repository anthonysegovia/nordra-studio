import assert from 'node:assert/strict';
import test from 'node:test';
import { invitationProgress, selectDashboardInvitations, receptionSummary, selectReceptionInvitations } from '../src/lib/weddingDashboard.ts';
const person = (id, name, attendance) => ({ id, name, attendance });
const group = (id, people, kind = 'couple', updated_at = '2026-10-26T12:00:00Z') => ({ id, people, kind, updated_at });
const mixed = group('mixed', [person('a','Ana Torres','yes'), person('b','Luis Pérez','no')]);
const partial = group('partial', [person('c','Clara Ponce','yes'), person('d','José López','pending')]);
const unnamed = group('unnamed', [person('e','Lucía Herrera','yes'), person('f','','pending')], 'plusOne');
const declined = group('declined', [person('g','Diego Navarro','no')], 'individual');
const pending = group('pending', [person('h','Renata Flores','pending')], 'individual', '2026-10-26T13:00:00Z');
const rows = [mixed, partial, unnamed, declined, pending];
const state = { tables:[{id:'table',name:'Olivo',capacity:8}],seats:{a:'table',c:'deleted-table'},arrivals:{a:{at:'2026-10-26T18:00:00Z'},orphan:{at:'2026-10-26T18:00:00Z'}},receptionExpiresAt:null };

test('all replies received is distinct from all guests attending', () => {
  assert.deepEqual(invitationProgress(mixed),{yes:1,no:1,pending:0,complete:true,partial:false,unnamed:false});
  assert.equal(invitationProgress(declined).complete,true);
  assert.equal(invitationProgress(partial).partial,true);
  assert.equal(invitationProgress(pending).partial,false);
});
test('search matches companions and accents while retaining the complete group', () => {
  assert.deepEqual(selectDashboardInvitations(rows,'jose','pending','name').map(x=>x.id),['partial']);
  assert.equal(selectDashboardInvitations(rows,'jose','pending','name')[0].people.length,2);
});
test('follow-up filters distinguish partial replies, unnamed +1s and confirmed people without a valid table', () => {
  assert.deepEqual(selectDashboardInvitations(rows,'','partial','name').map(x=>x.id),['partial','unnamed']);
  assert.deepEqual(selectDashboardInvitations(rows,'','unnamed','name').map(x=>x.id),['unnamed']);
  assert.deepEqual(selectDashboardInvitations(rows,'','unseated','name',state).map(x=>x.id),['partial','unnamed']);
  assert.deepEqual(selectDashboardInvitations(rows,'','unseated','name'),[]);
  const noPlusOne = structuredClone(unnamed); noPlusOne.people[1].attendance='no';
  assert.equal(invitationProgress(noPlusOne).unnamed,false);
});
test('sorting uses last update without mutating incoming data', () => {
  assert.equal(selectDashboardInvitations(rows,'','all','recent')[0].id,'pending');
  assert.deepEqual(rows.map(x=>x.id),['mixed','partial','unnamed','declined','pending']);
});
test('reception waiting includes only confirmed people who have not arrived', () => {
  assert.deepEqual(receptionSummary(rows,state),{confirmed:3,arrived:1,waiting:2});
  assert.deepEqual(selectReceptionInvitations(rows,'','waiting',state).map(x=>x.id),['partial','unnamed']);
  assert.deepEqual(selectReceptionInvitations(rows,'diego','waiting',state),[]);
  assert.deepEqual(selectReceptionInvitations(rows,'diego','all',state).map(x=>x.id),['declined']);
});
test('arrival totals do not turn a declined guest into someone expected to arrive', () => {
  const changed=structuredClone(rows); changed[0].people[0].attendance='no';
  assert.deepEqual(receptionSummary(changed,state),{confirmed:2,arrived:1,waiting:2});
  assert.deepEqual(selectReceptionInvitations(changed,'','arrived',state).map(x=>x.id),['mixed']);
});
