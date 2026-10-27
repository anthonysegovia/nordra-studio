import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { applyGuestReply, applyOwnerChange, guestToken, hash, invitationLink, normalizeInvitation, sampleInvitations, weddingHandler } from './wedding-links.js';

const secret='wedding-test-server-only-secret';
const site='https://nordrastudio.mx';
function fixture() {
  const rows=new Map(); let forceConflict=false;
  const store={
    async read(id) { const value=rows.get(id); return value && Date.parse(value.expires_at)>Date.now()?structuredClone(value):null; },
    async create(row) { rows.set(row.id,structuredClone(row)); return row; },
    async swap(row,list) {
      if(forceConflict) { forceConflict=false; const current=rows.get(row.id); current.version++; current.invitations[0].people[0].attendance='no'; return false; }
      if(rows.get(row.id)?.version!==row.version) return false;
      rows.set(row.id,{...row,invitations:structuredClone(list),version:row.version+1}); return true;
    },
    async allow() { return true; },
  };
  const handler=weddingHandler({store:()=>store,secret:()=>secret,site:()=>site,bucket:()=> 'test-bucket'});
  async function call(body,cookie,origin=site,method='POST') {
    const headers={}; let status;
    const res={setHeader:(k,v)=>headers[k]=v,status(code){status=code;return this;},json(data){return {status,data,headers};}};
    return handler({method,headers:{origin,cookie,'content-type':'application/json'},body},res);
  }
  return {call,rows,store,conflict:()=>forceConflict=true};
}
async function owner(f) { const response=await f.call({action:'load'}); assert.equal(response.status,200); return {response,cookie:response.headers['Set-Cookie'].split(';')[0]}; }
function guestBody(snapshot,invitation,action='guest-load') { return {action,eventId:snapshot.workspaceId,id:invitation.id,token:guestToken(secret,snapshot.workspaceId,invitation.id)}; }

test('each browser gets a private workspace and stable personal links',async()=>{
  const f=fixture(),a=await owner(f),b=await owner(f);
  assert.notEqual(a.response.data.workspaceId,b.response.data.workspaceId);
  assert.equal(a.response.data.invitations.length,16);
  assert.equal(a.response.data.invitations.flatMap(x=>x.people).length,24);
  assert.match(a.response.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
  const reload=await f.call({action:'load'},a.cookie);
  assert.equal(reload.data.invitations[0].link,a.response.data.invitations[0].link);
  assert.equal(new URL(reload.data.invitations[0].link).pathname,'/invitaciones/valentina-y-sebastian/');
  assert.equal(new URL(reload.data.invitations[0].link).search,'');
  assert.ok(!JSON.stringify(reload.data).includes('owner_hash'));
});
test('guest response works without an owner cookie and exposes one group only',async()=>{
  const f=fixture(),{response,cookie}=await owner(f),group=response.data.invitations[1];
  const access=guestBody(response.data,group);
  const read=await f.call(access); assert.equal(read.status,200); assert.ok(!read.data.invitations); assert.ok(!read.headers['Set-Cookie']);
  const people=structuredClone(group.people); people[1].attendance='no';
  const saved=await f.call({...access,action:'guest-reply',people,updatedAt:group.updated_at}); assert.equal(saved.status,200);
  const panel=await f.call({action:'load'},cookie);
  assert.deepEqual(panel.data.invitations[1].people.map(x=>x.attendance),['yes','no']);
  assert.equal(panel.data.invitations.flatMap(x=>x.people).length,24);
});
test('individual, couple and +1 preserve allocated places; named guests cannot be replaced',()=>{
  const rows=sampleInvitations();
  for(const group of rows.slice(0,3)) {
    const people=structuredClone(group.people); people[0].attendance='no';
    assert.equal(applyGuestReply(group,{people,updatedAt:group.updated_at}).people.length,group.people.length);
    assert.throws(()=>applyGuestReply(group,{people:[...people,{...people[0],id:'wedding-extra'}],updatedAt:group.updated_at}),/invalid_people/);
    people[0].name='Another Person'; assert.throws(()=>applyGuestReply(group,{people,updatedAt:group.updated_at}),/invalid_person/);
  }
});
test('unknown +1 can be named and confirmed, with no duplicate place',()=>{
  const group=sampleInvitations()[2],people=structuredClone(group.people); people[1].attendance='yes';
  assert.throws(()=>applyGuestReply(group,{people,updatedAt:group.updated_at}),/companion_name_required/);
  people[1].name='Andrea Salinas';
  const next=applyGuestReply(group,{people,updatedAt:group.updated_at}); assert.equal(next.people[1].id,group.people[1].id); assert.equal(next.people.length,2);
});
test('forged tokens and links for another invitation cannot read or update it',async()=>{
  const f=fixture(),{response}=await owner(f),[a,b]=response.data.invitations;
  const access=guestBody(response.data,a);
  assert.equal((await f.call({...access,token:'a'.repeat(64)})).status,404);
  assert.equal((await f.call({...access,id:b.id})).status,404);
  assert.equal((await f.call({action:'delete',id:a.id})).status,401);
  assert.equal((await f.call({action:'load'},`__Host-nordra_wedding=${response.data.workspaceId}.${access.token}`)).status,401);
});
test('concurrent groups merge, while stale replies cannot overwrite newer changes',async()=>{
  const f=fixture(),{response,cookie}=await owner(f),group=response.data.invitations[1];
  f.conflict(); const people=structuredClone(group.people); people[1].attendance='yes';
  const body={...guestBody(response.data,group,'guest-reply'),people,updatedAt:group.updated_at};
  assert.equal((await f.call(body)).status,200);
  const panel=await f.call({action:'load'},cookie); assert.equal(panel.data.invitations[0].people[0].attendance,'no');
  assert.equal((await f.call({...body,people:group.people})).status,409);
});
test('deleting or resetting invalidates previous personal links',async()=>{
  const f=fixture(),{response,cookie}=await owner(f),group=response.data.invitations[0],access=guestBody(response.data,group);
  assert.equal((await f.call({action:'delete',id:group.id},cookie)).status,200);
  assert.equal((await f.call(access)).status,404);
  const other=guestBody(response.data,response.data.invitations[1]);
  const reset=await f.call({action:'reset'},cookie); assert.equal(reset.data.invitations.length,16);
  assert.equal((await f.call(other)).status,404);
});
test('expired links fail closed and stale owner writes cannot create replacement data',async()=>{
  const f=fixture(),{response,cookie}=await owner(f); f.rows.get(response.data.workspaceId).expires_at='2020-01-01T00:00:00Z';
  assert.equal((await f.call(guestBody(response.data,response.data.invitations[0]))).status,404);
  assert.equal((await f.call({action:'reset'},cookie)).status,401);
  const renewed=await f.call({action:'load'},cookie); assert.notEqual(renewed.data.workspaceId,response.data.workspaceId);
});
test('origin, method, body size and rate limits are checked',async()=>{
  const f=fixture();
  assert.equal((await f.call({action:'load'},null,'https://unrelated.example')).status,403);
  assert.equal((await f.call({action:'load'},null,site,'GET')).status,405);
  assert.notEqual((await f.call({action:'load',padding:'x'.repeat(9000)})).status,200);
  f.store.allow=async()=>false; assert.equal((await f.call({action:'load'})).status,429);
});
test('owner editing rejects invalid sizes and stale snapshots',()=>{
  const list=sampleInvitations();
  assert.throws(()=>normalizeInvitation({...list[0],people:[]}),/invalid_invitation/);
  assert.throws(()=>applyOwnerChange(list,{action:'save',mode:'edit',invitation:{...list[0],updated_at:'old'}}),/response_changed/);
  const next=applyOwnerChange(list,{action:'save',mode:'edit',invitation:{...list[1],kind:'individual',people:list[1].people.slice(0,1)}});
  assert.equal(next.flatMap(x=>x.people).length,23);
});
test('links keep capability in the fragment, with no names or owner tokens',()=>{
  const id=randomUUID(),link=new URL(invitationLink(site,id,'wedding-example',secret));
  assert.equal(link.search,''); assert.match(link.hash,/#invitacion=/); assert.equal(link.origin,site);
  assert.notEqual(hash(secret),guestToken(secret,id,'wedding-example'));
});
