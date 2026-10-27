import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { privateWeddingHandler, normalizeEvent, realGuestToken } from './private-weddings.js';
import { weddingHandler, guestToken } from './wedding-links.js';
import { changeManagement } from './wedding-management.js';

const site='https://nordrastudio.mx';
const item=(name='Ana Prueba',kind='individual')=>({id:`wedding-${randomUUID()}`,kind,people:[{id:`wedding-${randomUUID()}`,name,attendance:'yes'},...(kind==='individual'?[]:[{id:`wedding-${randomUUID()}`,name:kind==='couple'?'Luis Prueba':'',attendance:'pending'}])]});
function fixture(sample=false) {
  const rows=new Map(),id=randomUUID(),user=randomUUID(),secret='s'.repeat(64);let conflict=false;
  rows.set(id,{id,...normalizeEvent({couple:'Prueba privada',eventDate:'2027-06-19',plan:'Aurora'}),guest_secret:secret,invitations:[],version:1});
  const store={async read(key){return structuredClone(rows.get(key));},async allow(){return true;},async create(row){rows.set(row.id,structuredClone(row));return row;},async member(event,actor){return event===id&&actor===user;},async swap(row,patch,boreal,management){if(conflict){conflict=false;rows.get(row.id).version++;return false;}if(rows.get(row.id).version!==row.version)return false;rows.set(row.id,{...rows.get(row.id),...(Array.isArray(patch)?{invitations:patch,boreal,management}:patch),version:row.version+1});return true;}};
  const handler=sample?weddingHandler({store:()=>store,secret:()=>secret,site:()=>site,bucket:()=>''}):privateWeddingHandler({store:()=>store,accounts:()=>({async identify(req){return req.headers.client?{id:req.headers.client}:null;}}),admin:async req=>req.headers.admin==='yes',site:()=>site,bucket:()=>'',now:()=>Date.now()});
  async function call(body,auth=sample?{}:{client:user}){let status=200,data,headers={};await handler({method:'POST',headers:{origin:site,'content-type':'application/json',...auth},body:sample?body:{eventId:id,...body}},{setHeader(k,v){headers[k]=v;},status(value){status=value;return this;},json(value){data=value;}});return{status,data,headers};}
  return {rows,id,user,secret,call,conflict:()=>{conflict=true;}};
}
test('batch import is atomic, idempotent and initializes RSVP pending',async()=>{
  const f=fixture(),invitations=[item(),item('Marta Prueba','plusOne')],body={action:'import',requestId:randomUUID(),invitations};
  f.conflict();let result=await f.call(body);assert.equal(result.status,200);assert.equal(result.data.invitations.length,2);assert.ok(result.data.invitations.flatMap(i=>i.people).every(p=>p.attendance==='pending'));
  const version=result.data.version;result=await f.call(body);assert.equal(result.data.version,version);assert.equal(result.data.management.history.length,1);
  const failed=await f.call({action:'import',requestId:randomUUID(),invitations:[item('Nueva Persona'),item('Ana Prueba')]});assert.equal(failed.data.code,'duplicate_name');assert.equal(f.rows.get(f.id).invitations.length,2);
});
test('imports enforce total places, structural validation and owner authorization',async()=>{
  const f=fixture(),batch=Array.from({length:300},(_,i)=>item(`Persona ${i}`));
  assert.equal((await f.call({action:'import',requestId:randomUUID(),invitations:batch},{})).status,401);
  assert.equal((await f.call({action:'import',requestId:randomUUID(),invitations:batch},{client:randomUUID()})).status,404);
  assert.equal((await f.call({action:'import',requestId:randomUUID(),invitations:batch})).status,200);
  assert.equal((await f.call({action:'import',requestId:randomUUID(),invitations:[item('Exceso Persona')]})).data.code,'guest_limit');
});
test('delivery requires explicit action and cannot overwrite another organizer’s update',async()=>{
  const f=fixture();const imported=await f.call({action:'import',requestId:randomUUID(),invitations:[item()]});const id=imported.data.invitations[0].id;
  assert.deepEqual(imported.data.management.delivery,{});
  const sent=await f.call({action:'delivery',id,kind:'sent',previous:null});assert.equal(sent.status,200);assert.ok(sent.data.management.delivery[id].sentAt);
  assert.equal((await f.call({action:'delivery',id,kind:'unsent',previous:null})).data.code,'response_changed');
  const reminder=await f.call({action:'delivery',id,kind:'reminder',previous:sent.data.management.delivery[id].updatedAt});assert.equal(reminder.status,200);assert.ok(reminder.data.management.delivery[id].reminderAt);
});
test('history identifies guest versus owner and private data never reaches guest payloads',async()=>{
  const f=fixture(),loaded=await f.call({action:'import',requestId:randomUUID(),invitations:[item('Ana Prueba','couple')]}),inv=loaded.data.invitations[0];
  const body={action:'guest-reply',id:inv.id,token:realGuestToken(f.rows.get(f.id),inv.id),updatedAt:inv.updated_at,people:inv.people.map(p=>({...p,attendance:'yes'})),actor:'nordra',management:{history:['forged']}};
  const reply=await f.call(body,{});assert.equal(reply.status,200);assert.equal(reply.data.management,undefined);assert.equal(reply.data.invitation.history,undefined);
  let panel=await f.call({action:'load'});assert.equal(panel.data.management.history[0].actor,'guest');assert.equal(panel.data.management.history[0].changes.length,2);
  const changed=structuredClone(panel.data.invitations[0]);changed.people[0].attendance='no';await f.call({action:'save',mode:'edit',invitation:changed,actor:'guest'});
  panel=await f.call({action:'load'});assert.equal(panel.data.management.history[0].actor,'client');assert.equal(panel.data.management.history[0].changes[0].after,'no');
});
test('deletion disables a link, recovery preserves original recipients, replies and link',async()=>{
  const f=fixture(),loaded=await f.call({action:'import',requestId:randomUUID(),invitations:[item()]}),inv=loaded.data.invitations[0],access={action:'guest-load',id:inv.id,token:realGuestToken(f.rows.get(f.id),inv.id)};
  await f.call({action:'delete',id:inv.id,updatedAt:inv.updated_at});assert.equal((await f.call(access,{})).status,404);
  const restored=await f.call({action:'restore',id:inv.id});assert.equal(restored.status,200);assert.equal(restored.data.invitations[0].link,inv.link);assert.deepEqual(restored.data.invitations[0].people,inv.people);assert.equal(restored.data.management.trash.length,0);assert.equal((await f.call(access,{})).status,200);
});
test('recovery revalidates capacity and duplicate names, and expired weddings reject it',async()=>{
  const f=fixture(),loaded=await f.call({action:'import',requestId:randomUUID(),invitations:[item()]}),inv=loaded.data.invitations[0];
  await f.call({action:'delete',id:inv.id});await f.call({action:'import',requestId:randomUUID(),invitations:[item()]});
  assert.equal((await f.call({action:'restore',id:inv.id})).data.code,'duplicate_name');assert.equal(f.rows.get(f.id).management.trash.length,1);
  f.rows.get(f.id).expires_at='2020-01-01T00:00:00Z';assert.equal((await f.call({action:'restore',id:inv.id})).status,410);
});
test('sample import, delivery, delete and restore persist through the same store contract',async()=>{
  const f=fixture(true),opened=await f.call({action:'load'}),cookie=opened.headers['Set-Cookie'].split(';')[0],auth={cookie};
  const imported=await f.call({action:'import',requestId:randomUUID(),invitations:[item('Prueba Muestra')]},auth),inv=imported.data.invitations.at(-1);assert.equal(imported.status,200);
  const sent=await f.call({action:'delivery',id:inv.id,kind:'sent',previous:null},auth);assert.ok(sent.data.management.delivery[inv.id].sentAt);
  await f.call({action:'delete',id:inv.id},auth);assert.equal((await f.call({action:'load'},auth)).data.management.trash.length,1);
  const restored=await f.call({action:'restore',id:inv.id},auth);assert.equal(restored.data.management.trash.length,0);assert.ok(restored.data.management.delivery[inv.id].sentAt);
  const guest=await f.call({action:'guest-load',eventId:opened.data.workspaceId,id:inv.id,token:guestToken(f.secret,opened.data.workspaceId,inv.id)});assert.equal(guest.data.management,undefined);
});
test('old weddings start with empty operational data; history retains the latest 1000 events',()=>{
  const row={invitations:[],management:{history:Array.from({length:1000},(_,i)=>({id:String(i)}))}};
  const next=changeManagement(row,{action:'import',requestId:randomUUID(),invitations:[item()]},'client');assert.equal(next.management.history.length,1000);assert.equal(next.management.history[0].action,'import');
});
