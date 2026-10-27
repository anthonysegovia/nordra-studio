import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { privateWeddingHandler, expiryFor, normalizeEvent, realGuestToken } from './private-weddings.js';
import { clientCookies } from './wedding-accounts.js';

const first=randomUUID(),second=randomUUID(),clientA=randomUUID(),clientB=randomUUID();
const event={couple:'Ana & Luis',eventDate:'2027-06-19',city:'Monterrey',plan:'Aurora',invitationPath:'',coverPath:'',replyUntil:''};
const invite=(kind='individual')=>({id:`wedding-invitation-${randomUUID()}`,kind,updated_at:new Date().toISOString(),people:[{id:`wedding-person-${randomUUID()}`,name:'Mariana López',attendance:'pending'},...(kind==='individual'?[]:[{id:`wedding-person-${randomUUID()}`,name:kind==='couple'?'Daniel Moreno':'',attendance:'pending'}])]});
export function fixture() {
  const rows=new Map(),members=new Map();let now=Date.parse('2026-10-25T12:00:00Z'),allowed=true;
  const clone=x=>x?structuredClone(x):null;
  const store={
    async read(id){return clone(rows.get(id));},async list(){return [...rows.values()].map(clone);},async create(row){rows.set(row.id,clone(row));return row;},
    async swap(row,patch){if(rows.get(row.id)?.version!==row.version)return false;rows.set(row.id,{...clone(row),...clone(patch),version:row.version+1});return true;},
    async allow(){return allowed;},async memberEvents(user){return [...members.entries()].filter(([,list])=>list.some(x=>x.user_id===user)).map(([event_id])=>({event_id}));},
    async member(id,user){return members.get(id)?.some(x=>x.user_id===user) || false;},async members(id){return clone(members.get(id)) || [];},
    async addMember(id,user,email){members.set(id,[...(members.get(id)||[]).filter(x=>x.user_id!==user),{user_id:user,email}]);},
    async removeMember(id,user){members.set(id,(members.get(id)||[]).filter(x=>x.user_id!==user));},
  };
  const accounts={async identify(req){return req.headers.client?{id:req.headers.client,email:'client@example.test'}:null;},async issue(email){return {userId:email==='a@example.test'?clientA:clientB,token:'a'.repeat(64)};},async login(){return null;},async activate(){return null;},async logout(){}};
  const handler=privateWeddingHandler({store:()=>store,accounts:()=>accounts,admin:async req=>req.headers.admin==='yes',site:()=> 'https://nordrastudio.mx',bucket:()=> 'test',now:()=>now});
  async function call(body,auth={},headers={}){let status=200,data;const res={setHeader(){},status(code){status=code;return this;},json(value){data=value;return this;}};await handler({method:'POST',headers:{origin:'https://nordrastudio.mx','content-type':'application/json',...auth,...headers},body},res);return {status,data};}
  async function seed(id=first,user=clientA,changes={}){rows.set(id,{id,...normalizeEvent({...event,...changes}),guest_secret:'b'.repeat(64),invitations:[],version:1});await store.addMember(id,user,'client@example.test');}
  return {call,rows,members,store,accounts,seed,setNow:value=>{now=Date.parse(value);},limit:()=>{allowed=false;}};
}
test('new-account signup tokens and existing-account magic links preserve provider verification type',async()=>{
  const f=fixture();await f.seed();
  f.accounts.issue=async()=>({userId:clientA,token:'c'.repeat(64),type:'signup'});
  const issued=await f.call({action:'admin-access',eventId:first,email:'a@example.test'},{admin:'yes'});
  assert.equal(new URLSearchParams(new URL(issued.data.link).hash.slice(1)).get('tipo'),'signup');
  const types=[];f.accounts.activate=async(token,password,res,type)=>{types.push(type);return {id:clientA,email:'a@example.test'};};
  for(const type of ['signup','magiclink'])assert.equal((await f.call({action:'activate',token:'c'.repeat(64),password:'Twelve-chars-test',type})).status,200);
  assert.deepEqual(types,['signup','magiclink']);assert.equal((await f.call({action:'activate',token:'c'.repeat(64),password:'Twelve-chars-test',type:'recovery'})).status,401);
});
test('client access and refresh cookies stay separate from Nordra admin and are cleared on logout',()=>{
  let value;const res={setHeader(name,cookies){assert.equal(name,'Set-Cookie');value=cookies;}};
  clientCookies(res,{access_token:'access',refresh_token:'refresh',expires_in:3600});
  assert.equal(value.length,2);for(const cookie of value){assert.match(cookie,/^__Host-nordra_client/);assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);assert.doesNotMatch(cookie,/nordra_admin/);}
  clientCookies(res,null);for(const cookie of value)assert.match(cookie,/Max-Age=0$/);
});
test('retention includes full 90th day and handles leap/year boundaries',()=>{
  assert.equal(expiryFor('2027-06-19'),'2027-09-18T06:00:00.000Z');
  assert.equal(expiryFor('2028-02-29'),'2028-05-30T06:00:00.000Z');
  assert.throws(()=>normalizeEvent({...event,eventDate:'2027-02-29'}));
  assert.throws(()=>normalizeEvent({...event,replyUntil:'2027-06-20'}));
  for(const invitationPath of ['https://evil.example','//evil.example','/../api/weddings','/api/weddings'])assert.throws(()=>normalizeEvent({...event,invitationPath}));
});
test('admin operations require Nordra authorization and create empty real events',async()=>{
  const f=fixture();assert.equal((await f.call({action:'admin-create',id:first,event})).status,401);
  const created=await f.call({action:'admin-create',id:first,event},{admin:'yes'});assert.equal(created.status,200);assert.equal(f.rows.get(first).invitations.length,0);
  assert.equal((await f.call({action:'admin-list'},{client:clientA})).status,401);
  assert.equal(JSON.stringify(created).includes('guest_secret'),false);
  assert.equal((await f.call({action:'admin-create',id:first,event},{admin:'yes'})).data.event.id,first);
});
test('clients are isolated and guest capabilities cannot open a panel',async()=>{
  const f=fixture();await f.seed();await f.seed(second,clientB);
  assert.equal((await f.call({action:'load',eventId:first},{client:clientA})).status,200);
  assert.equal((await f.call({action:'load',eventId:first},{client:clientB})).status,404);
  assert.equal((await f.call({action:'load',eventId:first,admin:true},{client:clientB})).status,404);
  assert.equal((await f.call({action:'load',eventId:first})).status,401);
  const list=await f.call({action:'client-list'},{client:clientB});assert.deepEqual(list.data.events.map(x=>x.id),[second]);
  assert.equal((await f.call({action:'admin-list'},{admin:'yes'})).data.events.length,2);
});
test('individual, couple and plus-one responses reach only the assigned event',async()=>{
  for(const kind of ['individual','couple','plusOne']) {
    const f=fixture();await f.seed();await f.seed(second,clientB);const invitation=invite(kind);
    const saved=await f.call({action:'save',eventId:first,mode:'add',invitation},{client:clientA});assert.equal(saved.status,200);
    const row=f.rows.get(first),current=row.invitations[0],cap={eventId:first,id:current.id,token:realGuestToken(row,current.id)};
    assert.equal((await f.call({action:'guest-load',...cap})).status,200);
    assert.equal((await f.call({action:'guest-load',...cap,eventId:second})).status,404);
    const people=current.people.map((p,i)=>({...p,name:p.name || 'Andrea Salinas',attendance:i?'no':'yes'}));
    assert.equal((await f.call({action:'guest-reply',...cap,updatedAt:current.updated_at,people})).status,200);
    assert.equal((await f.call({action:'load',eventId:first},{client:clientA})).data.invitations[0].people[0].attendance,'yes');
    assert.equal(f.rows.get(second).invitations.length,0);
    assert.equal((await f.call({action:'load',...cap})).status,401);
    assert.equal((await f.call({action:'guest-load',...cap,token:'0'.repeat(64)})).status,404);
  }
});
test('fixed places, companion naming and stale edits are enforced',async()=>{
  const f=fixture();await f.seed();const invitation=invite('plusOne');await f.call({action:'save',eventId:first,mode:'add',invitation},{client:clientA});
  const row=f.rows.get(first),item=row.invitations[0],body={action:'guest-reply',eventId:first,id:item.id,token:realGuestToken(row,item.id),updatedAt:item.updated_at,people:item.people.map(p=>({...p,attendance:'yes'}))};
  assert.equal((await f.call(body)).data.code,'companion_name_required');body.people[1].name='Andrea Salinas';
  assert.equal((await f.call({...body,people:[...body.people,{id:'wedding-person-extra',name:'Extra Person',attendance:'yes'}]})).status,400);
  assert.equal((await f.call(body)).status,200);
  assert.equal((await f.call(body)).status,409);
  assert.equal((await f.call({action:'save',eventId:first,mode:'edit',invitation:item},{client:clientA})).status,409);
});
test('moving wedding date preserves personal links and extends retention',async()=>{
  const f=fixture();await f.seed();const invitation=invite();await f.call({action:'save',eventId:first,mode:'add',invitation},{client:clientA});
  const before=(await f.call({action:'load',eventId:first},{client:clientA})).data;
  const update=await f.call({action:'admin-update',eventId:first,version:before.version,event:{...event,eventDate:'2028-01-10'}},{admin:'yes'});assert.equal(update.status,200);
  const after=(await f.call({action:'load',eventId:first},{client:clientA})).data;assert.equal(after.invitations[0].link,before.invitations[0].link);assert.equal(after.expiresAt,expiryFor('2028-01-10'));
});
test('confirmation deadline closes replies without deleting invitation or replies',async()=>{
  const f=fixture();await f.seed(first,clientA,{replyUntil:'2027-06-01'});const invitation=invite();await f.call({action:'save',eventId:first,mode:'add',invitation},{client:clientA});
  const row=f.rows.get(first),item=row.invitations[0],body={eventId:first,id:item.id,token:realGuestToken(row,item.id)};f.setNow('2027-06-02T06:00:00Z');
  const read=await f.call({action:'guest-load',...body});assert.equal(read.status,200);assert.equal(read.data.repliesClosed,true);
  assert.equal((await f.call({action:'guest-reply',...body,people:item.people,updatedAt:item.updated_at})).data.code,'replies_closed');
  assert.equal(f.rows.get(first).invitations.length,1);
});
test('expiry is enforced on every action and Nordra can export archived records',async()=>{
  const f=fixture();await f.seed();const invitation=invite();await f.call({action:'save',eventId:first,mode:'add',invitation},{client:clientA});const row=f.rows.get(first),item=row.invitations[0];
  f.setNow('2027-09-18T05:59:59Z');assert.equal((await f.call({action:'load',eventId:first},{client:clientA})).status,200);
  f.setNow('2027-09-18T06:00:00Z');assert.equal((await f.call({action:'load',eventId:first},{client:clientA})).status,410);
  assert.equal((await f.call({action:'guest-load',eventId:first,id:item.id,token:realGuestToken(row,item.id)})).status,410);
  assert.equal((await f.call({action:'save',eventId:first,mode:'add',invitation:invite(),admin:true},{admin:'yes'})).status,410);
  const archived=await f.call({action:'load',eventId:first,admin:true},{admin:'yes'});assert.equal(archived.status,200);assert.equal(archived.data.invitations.length,1);assert.equal(archived.data.event.archived,true);
});
test('membership revoke immediately blocks previously signed-in client',async()=>{
  const f=fixture();await f.seed();assert.equal((await f.call({action:'admin-access',eventId:first,email:'b@example.test'},{admin:'yes'})).status,200);
  assert.equal((await f.call({action:'load',eventId:first},{client:clientB})).status,200);
  assert.equal((await f.call({action:'admin-revoke',eventId:first,userId:clientB},{admin:'yes'})).status,200);
  assert.equal((await f.call({action:'load',eventId:first},{client:clientB})).status,404);
});
test('real event rejects reset and trial actions, foreign origin and rate excess',async()=>{
  const f=fixture();await f.seed();for(const action of ['reset','trial'])assert.equal((await f.call({action,eventId:first},{client:clientA})).status,400);
  assert.equal((await f.call({action:'load',eventId:first},{client:clientA},{origin:'https://evil.example'})).status,403);
  f.limit();assert.equal((await f.call({action:'load',eventId:first},{client:clientA})).status,429);
});
