import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { privateWeddingHandler, normalizeEvent, realGuestToken } from './private-weddings.js';
import { passToken } from './wedding-boreal.js';
import { weddingHandler, hash, guestToken } from './wedding-links.js';

const site='https://nordrastudio.mx';
function fixture() {
  const id=randomUUID(), other=randomUUID(), rows=new Map(), user=randomUUID(); let now=Date.parse('2026-10-25T12:00:00Z');
  const invitations=[
    {id:'wedding-individual',kind:'individual',updated_at:new Date(now).toISOString(),people:[{id:'wedding-ana',name:'Ana López',attendance:'yes'}]},
    {id:'wedding-couple',kind:'couple',updated_at:new Date(now).toISOString(),people:[{id:'wedding-luis',name:'Luis Moreno',attendance:'yes'},{id:'wedding-lucia',name:'Lucía Ruiz',attendance:'yes'}]},
    {id:'wedding-plus',kind:'plusOne',updated_at:new Date(now).toISOString(),people:[{id:'wedding-maria',name:'María Pérez',attendance:'yes'},{id:'wedding-plus-person',name:'',attendance:'pending'}]},
  ];
  const seed=eventId=>({id:eventId,...normalizeEvent({couple:'Boda de prueba',eventDate:'2027-06-19',city:'Cancún',plan:'Boreal'}),guest_secret:'b'.repeat(64),invitations:structuredClone(invitations),version:1,boreal:{}});
  rows.set(id,seed(id));rows.set(other,seed(other));
  const clone=value=>structuredClone(value);
  const store={async read(eventId){return rows.has(eventId)?clone(rows.get(eventId)):null;},async allow(){return true;},async member(eventId,member){return eventId===id && member===user;},async swap(row,patch){if(rows.get(row.id).version!==row.version)return false;rows.set(row.id,{...clone(rows.get(row.id)),...clone(patch),version:row.version+1});return true;}};
  const handler=privateWeddingHandler({store:()=>store,accounts:()=>({async identify(req){return req.headers.client?{id:req.headers.client}:null;}}),admin:async req=>req.headers.admin==='yes',site:()=>site,bucket:()=> 'test',now:()=>now});
  async function call(body,auth={client:user}) {let status=200,data;await handler({method:'POST',headers:{origin:site,'content-type':'application/json',...auth},body:{eventId:id,...body}},{setHeader(){},status(value){status=value;return this;},json(value){data=value;}});return {status,data};}
  const edit=body=>call({version:rows.get(id).version,...body});
  const table=(name='Jazmín',capacity=2,tableId='table-jazmin')=>edit({action:'table-save',table:{id:tableId,name,capacity}});
  const cap=()=>({id:invitations[1].id,token:realGuestToken(rows.get(id),invitations[1].id)});
  return {id,other,user,rows,invitations,call,edit,table,cap,setNow:value=>{now=Date.parse(value);}};
}

test('Boreal capabilities are enforced server-side and stay isolated from Aurora and other weddings',async()=>{
  const f=fixture();f.rows.get(f.id).plan='Aurora';
  for(const action of ['table-save','seat-assign','check-in','reception-issue','pass-scan'])assert.equal((await f.call({action,plan:'Boreal'})).status,403);
  assert.equal((await f.call({action:'public-pass',id:'wedding-individual',token:passToken(f.rows.get(f.id),'wedding-individual','b'.repeat(64),'real')},{})).status,403);
  assert.equal((await f.call({action:'load'})).data.boreal,undefined);
  f.rows.get(f.id).plan='Boreal';assert.equal((await f.call({action:'table-save'},{})).status,401);
  assert.equal((await f.call({action:'load',eventId:f.other})).status,404);
});
test('tables enforce capacity, unique names, fixed people, group seating and optimistic concurrency',async()=>{
  const f=fixture();assert.equal((await f.table()).status,200);
  assert.equal((await f.table('jazmin',3,'table-other')).data.code,'duplicate_table');
  assert.equal((await f.table('Bad',31)).data.code,'invalid_table');
  assert.equal((await f.edit({action:'seat-assign',personIds:['wedding-luis','wedding-lucia'],tableId:'table-jazmin'})).status,200);
  assert.equal((await f.edit({action:'seat-assign',personIds:['wedding-ana'],tableId:'table-jazmin'})).data.code,'table_full');
  assert.equal((await f.edit({action:'table-save',edit:true,previous:{name:'Jazmín',capacity:2},table:{id:'table-jazmin',name:'Jazmín',capacity:1}})).data.code,'table_full');
  assert.equal((await f.edit({action:'table-save',edit:true,previous:{name:'Old name',capacity:2},table:{id:'table-jazmin',name:'New name',capacity:8}})).data.code,'response_changed');
  assert.equal((await f.edit({action:'seat-assign',personIds:['wedding-fake'],tableId:null})).data.code,'invalid_people');
  assert.equal((await f.call({action:'seat-assign',version:1,personIds:['wedding-luis'],tableId:null})).status,409);
  assert.equal((await f.edit({action:'seat-assign',personIds:['wedding-luis'],tableId:null})).status,200);
  assert.equal((await f.edit({action:'seat-assign',personIds:['wedding-plus-person'],tableId:'table-jazmin'})).status,200);
  assert.equal((await f.edit({action:'table-delete',id:'table-jazmin'})).status,200);
  assert.deepEqual(f.rows.get(f.id).boreal.seats,{});assert.equal(f.rows.get(f.id).invitations.length,3);
});
test('simultaneous arrivals from two phones register each person exactly once and support split couples',async()=>{
  const f=fixture();
  const requests=await Promise.all([f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-luis']}),f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-luis']})]);
  assert.ok(requests.every(result=>result.status===200));assert.equal(requests.reduce((sum,result)=>sum+result.data.result.added.length,0),1);
  assert.equal(f.rows.get(f.id).boreal.arrivalLog.length,1);assert.deepEqual(Object.keys(f.rows.get(f.id).boreal.arrivals),['wedding-luis']);
  assert.equal((await f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-lucia']})).data.result.added.length,1);
  assert.equal((await f.call({action:'check-in',id:'wedding-plus',personIds:['wedding-plus-person']})).data.code,'not_confirmed');
  assert.equal((await f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-ana']})).data.code,'not_confirmed');
});
test('QR scope is separate from RSVP: no panel rights, no other invitations, no altered or cross-event passes',async()=>{
  const f=fixture();const snapshot=(await f.call({action:'load'})).data;
  const link=snapshot.invitations[1].passLink, token=new URLSearchParams(new URL(link).hash.slice(1)).get('pase').split('~')[3];
  const pass=await f.call({action:'public-pass',id:'wedding-couple',token},{});assert.equal(pass.status,200);assert.equal(pass.data.invitation.people.length,2);
  assert.equal(pass.data.invitations,undefined);assert.equal(pass.data.boreal,undefined);assert.equal(pass.data.invitation.link,undefined);assert.equal(JSON.stringify(pass).includes('guest_secret'),false);
  assert.equal((await f.call({action:'guest-load',id:'wedding-couple',token},{})).status,404);
  assert.equal((await f.call({action:'public-pass',...f.cap()},{})).status,404);
  assert.equal((await f.call({action:'load',token},{})).status,401);
  assert.equal((await f.call({action:'pass-scan',pass:link})).data.scanned,'wedding-couple');
  assert.equal((await f.call({action:'pass-scan',pass:link.replace(f.id,f.other)})).data.code,'wrong_wedding');
  assert.equal((await f.call({action:'pass-scan',pass:link.replace('real~','sample~')})).data.code,'wrong_wedding');
  assert.equal((await f.call({action:'pass-scan',pass:link.replace(site,'https://example.org')})).data.code,'invalid_pass');
  assert.equal((await f.call({action:'public-pass',id:'wedding-couple',token:'a'.repeat(64)},{})).status,404);
  await f.call({action:'delete',id:'wedding-couple'});assert.equal((await f.call({action:'pass-scan',pass:link})).status,404);
});
test('reception link only allows scoped reads and arrival actions; rotation, revocation and expiration close it',async()=>{
  const f=fixture();const issued=await f.call({action:'reception-issue'});
  const accessToken=new URLSearchParams(new URL(issued.data.receptionLink).hash.slice(1)).get('acceso').split('~')[2];
  assert.equal(JSON.stringify(f.rows.get(f.id)).includes(accessToken),false);
  const load=await f.call({action:'reception-load',accessToken},{});assert.equal(load.status,200);assert.equal(load.data.invitations[0].link,undefined);assert.equal(load.data.invitations[0].passLink,undefined);assert.equal(JSON.stringify(load).includes('hash'),false);
  for(const action of ['load','table-save','undo-entry','reception-issue'])assert.equal((await f.call({action,accessToken},{})).status,401);
  assert.equal((await f.call({action:'reception-load',accessToken,eventId:f.other},{})).status,401);
  assert.equal((await f.call({action:'reception-check-in',accessToken,id:'wedding-individual',personIds:['wedding-ana']},{})).status,200);
  await f.call({action:'reception-issue'});assert.equal((await f.call({action:'reception-load',accessToken},{})).status,401);
  const renewed=await f.call({action:'reception-issue'}),newToken=new URLSearchParams(new URL(renewed.data.receptionLink).hash.slice(1)).get('acceso').split('~')[2];
  f.setNow('2026-10-27T12:00:00Z');assert.equal((await f.call({action:'reception-load',accessToken:newToken},{})).status,401);
  f.setNow('2026-10-25T12:00:00Z');await f.call({action:'reception-revoke'});assert.equal((await f.call({action:'reception-load',accessToken:newToken},{})).status,401);
});
test('guest changes release declined seats, cannot forge entries, and recorded arrivals require explicit owner correction',async()=>{
  const f=fixture();await f.table();await f.edit({action:'seat-assign',personIds:['wedding-luis'],tableId:'table-jazmin'});
  let invitation=f.rows.get(f.id).invitations[1];
  const declined=await f.call({action:'guest-reply',...f.cap(),updatedAt:invitation.updated_at,people:invitation.people.map(person=>({...person,attendance:'no',table:'hacked'})),boreal:{arrivals:{forged:{at:'now'}}}},{});
  assert.equal(declined.status,200);assert.deepEqual(f.rows.get(f.id).boreal.seats,{});assert.deepEqual(f.rows.get(f.id).boreal.arrivals,{});
  await f.call({action:'attendance',id:'wedding-couple',personId:'wedding-luis',attendance:'yes'});
  await f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-luis']});
  assert.equal((await f.call({action:'attendance',id:'wedding-couple',personId:'wedding-luis',attendance:'no'})).data.code,'arrival_locked');
  assert.equal((await f.call({action:'delete',id:'wedding-couple'})).data.code,'arrival_locked');
  invitation=f.rows.get(f.id).invitations[1];assert.equal((await f.call({action:'guest-reply',...f.cap(),updatedAt:invitation.updated_at,people:invitation.people.map(person=>({...person,attendance:'no'}))},{})).data.code,'arrival_locked');
  assert.equal((await f.call({action:'undo-entry',personId:'wedding-luis',enteredAt:'wrong'})).status,409);
  const at=f.rows.get(f.id).boreal.arrivals['wedding-luis'].at;
  assert.equal((await f.call({action:'undo-entry',personId:'wedding-luis',enteredAt:at})).status,200);
  assert.equal((await f.call({action:'attendance',id:'wedding-couple',personId:'wedding-luis',attendance:'no'})).status,200);
  assert.deepEqual(f.rows.get(f.id).boreal.arrivalLog.map(entry=>entry.action),['entry','undo']);
});
test('expired events deny passes and mutations but retain seats and arrivals for Nordra archive',async()=>{
  const f=fixture();await f.table();await f.edit({action:'seat-assign',personIds:['wedding-ana'],tableId:'table-jazmin'});await f.call({action:'check-in',id:'wedding-individual',personIds:['wedding-ana']});
  const token=passToken(f.rows.get(f.id),'wedding-individual','b'.repeat(64),'real');f.setNow('2027-09-18T06:00:00Z');
  assert.equal((await f.call({action:'public-pass',id:'wedding-individual',token},{})).status,410);
  assert.equal((await f.call({action:'check-in',id:'wedding-couple',personIds:['wedding-luis']})).status,410);
  const archived=await f.call({action:'load',admin:true},{admin:'yes'});assert.equal(archived.status,200);assert.equal(archived.data.boreal.seats['wedding-ana'],'table-jazmin');assert.ok(archived.data.boreal.arrivals['wedding-ana']);
});
test('sample passes use their own workspace and persist seating, arrivals, replies and resets through the same API',async()=>{
  const id=randomUUID(),secret='s'.repeat(64),owner='a'.repeat(64), rows=new Map();
  const base=fixture();rows.set(id,{id,owner_hash:hash(owner),invitations:base.invitations,expires_at:new Date(Date.now()+86400000).toISOString(),version:1,boreal:{}});
  const store={async allow(){return true;},async read(key){return rows.has(key)?structuredClone(rows.get(key)):null;},async swap(row,list,boreal){if(rows.get(row.id).version!==row.version)return false;rows.set(row.id,{...structuredClone(row),invitations:structuredClone(list),...(boreal?{boreal:structuredClone(boreal)}:{}),version:row.version+1});return true;}};
  const handler=weddingHandler({store:()=>store,secret:()=>secret,site:()=>site,bucket:()=> 'test'});
  async function call(body,authenticated=true){let status=200,data;await handler({method:'POST',headers:{origin:site,'content-type':'application/json',...(authenticated?{cookie:`__Host-nordra_wedding=${id}.${owner}`}:{})},body},{setHeader(){},status(value){status=value;return this;},json(value){data=value;}});return {status,data};}
  const loaded=await call({action:'load'});assert.ok(loaded.data.invitations[0].passLink.includes('sample~'));
  assert.equal((await call({action:'check-in',id:'wedding-individual',personIds:['wedding-ana']})).status,200);assert.ok(rows.get(id).boreal.arrivals['wedding-ana']);
  const guest=await call({action:'guest-load',eventId:id,id:'wedding-individual',token:guestToken(secret,id,'wedding-individual')},false);assert.ok(guest.data.invitation.passLink);
  const oldPass=loaded.data.invitations[0].passLink;await call({action:'reset'});assert.deepEqual(rows.get(id).boreal.arrivals,{});assert.equal(rows.get(id).boreal.tables.length,3);
  assert.equal((await call({action:'pass-scan',pass:oldPass})).status,404);
});
