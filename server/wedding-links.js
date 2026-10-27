import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { databaseClient, jsonBody } from './admin-access.js';
import { WeddingError } from './wedding-errors.js';
import { changeManagement, logGuestChange, managementActions, managementView, weddingBody } from './wedding-management.js';
import { authorizeReception, borealActions, borealView, changeBoreal, passInvitation, passLink, passView, publicBorealActions, receptionView, reconcileBoreal, sampleBoreal } from './wedding-boreal.js';
export { WeddingError } from './wedding-errors.js';

const LIFE = 24 * 60 * 60 * 1000;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const idPattern = /^wedding-[\w-]{1,120}$/;
const tokenPattern = /^[a-f0-9]{64}$/;
const cookieName = '__Host-nordra_wedding';
const statuses = ['yes','no','pending'];
const kinds = ['individual','couple','plusOne'];
const fail = (code,status) => { throw new WeddingError(code,status); };
export const hash = value => createHash('sha256').update(value).digest('hex');
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
function name(value,optional=false) {
  if (typeof value !== 'string') return fail('invalid_name');
  const clean=value.normalize('NFC').trim().replace(/\s+/gu,' ');
  if (optional && !clean) return '';
  if (clean.length<2 || clean.length>100 || /[\p{Cc}\p{Cf}<>]/u.test(clean)) return fail('invalid_name');
  return clean;
}
export function normalizeInvitation(input) {
  if (!input || typeof input.id!=='string' || !idPattern.test(input.id) || !kinds.includes(input.kind) || !Array.isArray(input.people) || input.people.length!==(input.kind==='individual'?1:2)) return fail('invalid_invitation');
  const ids=new Set([input.id]);
  return { id:input.id,kind:input.kind,updated_at:input.updated_at,people:input.people.map((p,i)=> {
    if (!p || typeof p.id!=='string' || !idPattern.test(p.id) || ids.has(p.id) || !statuses.includes(p.attendance)) return fail('invalid_person');
    ids.add(p.id);
    const value=name(p.name,input.kind==='plusOne' && i===1);
    if (!value && p.attendance==='yes') return fail('companion_name_required');
    return {id:p.id,name:value,attendance:p.attendance};
  }) };
}
export function validateList(list) {
  if (!Array.isArray(list) || list.length>300 || list.reduce((n,x)=>n+x.people.length,0)>300) return fail('guest_limit');
  const ids=new Set(),names=new Set();
  for (const item of list) {
    for (const id of [item.id,...item.people.map(p=>p.id)]) { if(ids.has(id)) return fail('duplicate_id'); ids.add(id); }
    for (const p of item.people) { if (!p.name) continue; const key=p.name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase(); if(names.has(key)) return fail('duplicate_name'); names.add(key); }
  }
  return list;
}
export function sampleInvitations() {
  const entries=[['individual','Mariana López','yes'],['couple','Daniel Moreno','yes','Isabel García','pending'],['plusOne','Lucía Herrera','yes','','pending'],['couple','Alejandro Ruiz','yes','Sofía Martínez','yes'],['individual','Diego Navarro','no'],['plusOne','Valeria Castro','yes','Fernando Ortiz','no'],['individual','Renata Flores','pending'],['couple','Gabriel Santos','yes','Paula Méndez','no'],['plusOne','Emiliano Vega','pending','','pending'],['individual','Regina Salazar','yes'],['couple','Mateo Aguilar','yes','Elena Ríos','yes'],['plusOne','Nicolás Cabrera','yes','Julia Mendoza','yes'],['individual','Sebastián Luna','no'],['individual','Natalia Fuentes','yes'],['individual','Rodrigo Medina','pending'],['individual','Clara Ponce','yes']];
  return entries.map(([kind,first,a,second,b])=>({id:`wedding-invitation-${randomUUID()}`,kind,updated_at:new Date().toISOString(),people:[{id:`wedding-person-${randomUUID()}`,name:first,attendance:a},...(kind==='individual'?[]:[{id:`wedding-person-${randomUUID()}`,name:second,attendance:b}])]}));
}
export function guestToken(secret,eventId,invitationId) { return createHmac('sha256',secret).update(`wedding-guest:${eventId}:${invitationId}`).digest('hex'); }
export function invitationLink(site,eventId,invitationId,secret) {
  const url=new URL('/invitaciones/valentina-y-sebastian/',site);
  url.hash=`invitacion=${eventId}~${invitationId}~${guestToken(secret,eventId,invitationId)}`;
  return url.href;
}
export function applyOwnerChange(list,body,now=new Date().toISOString()) {
  if(body.action==='reset') return sampleInvitations();
  const old=list.find(x=>x.id===(body.invitation?.id ?? body.id));
  if(old) now=new Date(Math.max(Date.parse(now),Date.parse(old.updated_at)+1)).toISOString();
  if(body.action==='delete') { if(!old) return fail('guest_missing',404); return list.filter(x=>x.id!==old.id); }
  if(body.action==='attendance') {
    if(!old || !old.people.some(p=>p.id===body.personId)) return fail('guest_missing',404);
    return validateList(list.map(x=>x.id===old.id ? normalizeInvitation({...old,updated_at:now,people:old.people.map(p=>p.id===body.personId?{...p,attendance:body.attendance}:p)}) : x));
  }
  if(body.action==='trial') {
    const trial=list.find(x=>x.id==='wedding-preview-reply');
    const item=normalizeInvitation({id:'wedding-preview-reply',kind:'individual',updated_at:now,people:[{id:'wedding-preview-reply-person',name:body.name,attendance:body.attendance}]});
    return validateList(trial?list.map(x=>x.id===trial.id?item:x):[item,...list]);
  }
  if(body.action!=='save' || !['add','edit'].includes(body.mode)) return fail('invalid_action');
  const item=normalizeInvitation(body.invitation);
  if(body.mode==='edit' && !old) return fail('guest_missing',404);
  if(body.mode==='add' && old) return fail('duplicate_id',409);
  if(old && item.updated_at!==old.updated_at) return fail('response_changed',409);
  item.updated_at=now;
  return validateList(old?list.map(x=>x.id===old.id?item:x):[item,...list]);
}
export function applyGuestReply(invitation,body,now=new Date().toISOString()) {
  if(body.updatedAt!==invitation.updated_at) return fail('response_changed',409);
  if(!Array.isArray(body.people) || body.people.length!==invitation.people.length || new Set(body.people.map(p=>p.id)).size!==invitation.people.length) return fail('invalid_people');
  const people=invitation.people.map((person,index)=> {
    const reply=body.people.find(p=>p.id===person.id);
    if(!reply || !statuses.includes(reply.attendance)) return fail('invalid_person');
    // Guests may name their +1, never rename named recipients or add places.
    const companion=invitation.kind==='plusOne' && index===1;
    if(!companion && reply.name!==person.name) return fail('invalid_person');
    return {...person,name:companion?reply.name:person.name,attendance:reply.attendance};
  });
  if(people.every(p=>p.attendance==='pending')) return fail('reply_required');
  return normalizeInvitation({...invitation,people,updated_at:new Date(Math.max(Date.parse(now),Date.parse(invitation.updated_at)+1)).toISOString()});
}
export function supabaseStore(db=databaseClient()) {
  return {
    async read(id) { const {data,error}=await db.from('nordra_wedding_workspaces').select('*').eq('id',id).gt('expires_at',new Date().toISOString()).maybeSingle(); if(error) throw error; return data; },
    async create(row) { const {error}=await db.from('nordra_wedding_workspaces').insert(row); if(error) throw error; return row; },
    async swap(row,list,boreal,management) { const {data,error}=await db.from('nordra_wedding_workspaces').update({invitations:list,...(boreal?{boreal}:{}),...(management?{management}:{}),version:row.version+1}).eq('id',row.id).eq('version',row.version).gt('expires_at',new Date().toISOString()).select('id'); if(error) throw error; return !!data?.length; },
    async allow(bucket,limit) { const {data,error}=await db.rpc('nordra_wedding_allow',{p_bucket:bucket,p_limit:limit}); if(error) throw error; return data===true; },
  };
}
function ownerCapability(req) {
  const value=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  if(!value) return null;
  const [id,token]=value.split('.');
  return uuid.test(id) && tokenPattern.test(token) ? {id,token} : null;
}
function requestBucket(req,secret,scope) {
  const raw=process.env.VERCEL?req.headers['x-forwarded-for']:req.socket?.remoteAddress;
  const ip=typeof raw==='string'?raw.split(',')[0].trim():'';
  if(!isIP(ip)) return fail('unavailable',503);
  return createHmac('sha256',secret).update(`wedding:${scope}:${Math.floor(Date.now()/3600000)}:${ip}`).digest('hex');
}
const defaults={store:supabaseStore,secret:()=>process.env.SUPABASE_SECRET_KEY,site:()=>process.env.NORDRA_SITE_URL,bucket:requestBucket};
export function weddingHandler(deps=defaults) {
  return async(req,res)=> {
    res.setHeader('Cache-Control','private, no-store'); res.setHeader('X-Robots-Tag','noindex, nofollow');
    if(req.method!=='POST') { res.setHeader('Allow','POST'); return res.status(405).json({code:'invalid_method'}); }
    try {
      const secret=deps.secret(),site=deps.site();
      if(!secret || !site) return fail('unavailable',503);
      const origin=req.headers.origin;
      // Use configured canonical origin or this exact deployment's origin, never arbitrary subdomains.
      const deployment=process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:null;
      if(origin!==new URL(site).origin && origin!==deployment) return fail('invalid_origin',403);
      let body; try { body=weddingBody(req); } catch { return fail('invalid_request'); }
      const store=deps.store();
      if(!['load','save','delete','attendance','reset','trial','guest-load','guest-reply',...borealActions,...publicBorealActions,...managementActions].includes(body.action)) return fail('invalid_action');
      const guest=body.action.startsWith('guest-');
      if(!await store.allow(deps.bucket(req,secret,guest?'guest':'owner'),guest?240:1200)) return fail('limited',429);
      const mode='sample';
      if(publicBorealActions.includes(body.action)) {
        if(!uuid.test(body.eventId || ''))return fail('invalid_pass',404);
        for(let retry=0;retry<4;retry++) {
          const row=await store.read(body.eventId);if(!row)return fail('link_unavailable',410);
          if(body.action==='public-pass')return res.status(200).json(passView(row,passInvitation(row,body,site,secret,mode),site,secret,mode));
          authorizeReception(row,body.accessToken,Date.now());
          if(body.action==='reception-load')return res.status(200).json(receptionView(row,mode));
          if(body.action==='reception-scan')return res.status(200).json({...receptionView(row,mode),scanned:passInvitation(row,body,site,secret,mode).id});
          const change=changeBoreal(row,body,{site,mode,actor:'reception'});
          if(change.unchanged || await store.swap(row,row.invitations,change.state))return res.status(200).json({...receptionView({...row,boreal:change.state,version:row.version+(change.unchanged?0:1)},mode),result:change.result});
        }
        return fail('response_changed',409);
      }
      if(guest) {
        if(!uuid.test(body.eventId||'') || !idPattern.test(body.id||'') || !tokenPattern.test(body.token||'') || !equal(body.token,guestToken(secret,body.eventId,body.id))) return fail('link_unavailable',404);
        for(let retry=0;retry<4;retry++) {
          const row=await store.read(body.eventId),invitation=row?.invitations.find(x=>x.id===body.id);
          if(!invitation) return fail('link_unavailable',404);
          if(body.action==='guest-load') return res.status(200).json({invitation:{...invitation,passLink:passLink(row,invitation,site,secret,mode)},expiresAt:row.expires_at});
          const next=applyGuestReply(invitation,body);
          const list=validateList(row.invitations.map(x=>x.id===invitation.id?next:x));
          if(await store.swap(row,list,reconcileBoreal(row,list),logGuestChange(row,next))) return res.status(200).json({invitation:{...next,passLink:passLink(row,next,site,secret,mode)},expiresAt:row.expires_at,saved:true});
        }
        return fail('response_changed',409);
      }
      let capability=ownerCapability(req),row=capability?await store.read(capability.id):null;
      if(row && !equal(row.owner_hash,hash(capability.token))) return fail('session_unavailable',401);
      if(!row) {
        if(body.action!=='load') return fail('session_unavailable',401);
        if(!await store.allow(deps.bucket(req,secret,'create'),12)) return fail('limited',429);
        capability={id:randomUUID(),token:randomBytes(32).toString('hex')};
        const invitations=sampleInvitations();
        row=await store.create({id:capability.id,owner_hash:hash(capability.token),invitations,boreal:sampleBoreal(invitations),version:1,expires_at:new Date(Date.now()+LIFE).toISOString()});
        res.setHeader('Set-Cookie',`${cookieName}=${capability.id}.${capability.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${LIFE/1000}`);
      }
      const payload=value=>({workspaceId:value.id,management:managementView(value),invitations:value.invitations.map(x=>({...x,link:invitationLink(site,value.id,x.id,secret),passLink:passLink(value,x,site,secret,mode)})),boreal:borealView(value),expiresAt:value.expires_at,version:value.version});
      if(body.action==='load') return res.status(200).json(payload(row));
      for(let retry=0;retry<4;retry++) {
        if(borealActions.includes(body.action)) {
          if(body.action==='pass-scan')return res.status(200).json({...payload(row),scanned:passInvitation(row,body,site,secret,mode).id});
          const change=changeBoreal(row,body,{site,mode,actor:'sample-owner'});
          if(change.unchanged || await store.swap(row,row.invitations,change.state))return res.status(200).json({...payload({...row,boreal:change.state,version:row.version+(change.unchanged?0:1)}),result:change.result,receptionLink:change.receptionLink});
          row=await store.read(capability.id);
          if(!row || !equal(row.owner_hash,hash(capability.token)))return fail('session_unavailable',401);
          continue;
        }
        const change=changeManagement(row,body,'sample-owner');
        const {list,management}=change;
        if(change.unchanged)return res.status(200).json(payload(row));
        const boreal=body.action==='reset'?sampleBoreal(list):reconcileBoreal(row,list);
        if(await store.swap(row,list,boreal,management)) return res.status(200).json(payload({...row,invitations:list,boreal,management,version:row.version+1}));
        row=await store.read(capability.id);
        if(!row || !equal(row.owner_hash,hash(capability.token))) return fail('session_unavailable',401);
      }
      return fail('response_changed',409);
    } catch(error) { return res.status(error instanceof WeddingError?error.status:503).json({code:error instanceof WeddingError?error.message:'unavailable'}); }
  };
}
