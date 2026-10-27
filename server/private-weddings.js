import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { authorizeAdmin, databaseClient, jsonBody } from './admin-access.js';
import { accountService } from './wedding-accounts.js';
import { applyGuestReply, applyOwnerChange, validateList, WeddingError } from './wedding-links.js';
import { assertBoreal, authorizeReception, borealActions, borealView, changeBoreal, passInvitation, passLink, passView, publicBorealActions, receptionView, reconcileBoreal } from './wedding-boreal.js';

import { changeManagement, logGuestChange, managementActions, managementView, weddingBody } from './wedding-management.js';

const fail = (code,status=400) => { throw new WeddingError(code,status); };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const equal = (a,b) => typeof a==='string' && typeof b==='string' && Buffer.byteLength(a)===Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function validDate(value) {
  if (typeof value!=='string' || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false;
  const date=new Date(value+'T00:00:00Z'); return Number.isFinite(+date) && date.toISOString().slice(0,10)===value;
}
export function expiryFor(date) { return new Date(Date.parse(date+'T06:00:00Z')+91*86400000).toISOString(); }
function clean(value,max,required=false) {
  if (typeof value!=='string') return fail('invalid_event');
  const text=value.trim().normalize('NFC');
  if(text.length>max || (required && text.length<3) || /[\p{Cc}\p{Cf}<>]/u.test(text)) return fail('invalid_event');
  return text;
}
function path(value) {
  const p=clean(value ?? '',250);
  if(p && (!/^\/[a-zA-Z0-9/_\-.]+$/.test(p) || p.includes('..') || p.startsWith('//') || p.startsWith('/api/'))) return fail('invalid_path');
  return p;
}
export function normalizeEvent(input) {
  if(!input || !validDate(input.eventDate) || !['Bruma','Aurora','Boreal'].includes(input.plan)) return fail('invalid_event');
  if(input.replyUntil && (!validDate(input.replyUntil) || input.replyUntil>input.eventDate)) return fail('invalid_deadline');
  return {couple:clean(input.couple,160,true),event_date:input.eventDate,city:clean(input.city ?? '',120),plan:input.plan,invitation_path:path(input.invitationPath),cover_path:path(input.coverPath),reply_until:input.replyUntil || null,expires_at:expiryFor(input.eventDate)};
}
export function eventView(row,now=Date.now()) {
  return {id:row.id,couple:row.couple,eventDate:row.event_date,city:row.city,plan:row.plan,invitationPath:row.invitation_path,coverPath:row.cover_path,replyUntil:row.reply_until,expiresAt:row.expires_at,archived:Date.parse(row.expires_at)<=now,version:row.version};
}
export function realGuestToken(row,id) { return createHmac('sha256',row.guest_secret).update(`real-wedding:${row.id}:${id}`).digest('hex'); }
export function realGuestLink(row,id,site) {
  const url=new URL('/invitacion-boda.html',site); url.hash=`boda=${row.id}~${id}~${realGuestToken(row,id)}`; return url.href;
}
export function privateWeddingStore(db=databaseClient()) {
  const check=({data,error})=>{if(error)throw error;return data;};
  return {
    async read(id){return check(await db.from('nordra_weddings').select('*').eq('id',id).maybeSingle());},
    async list(){return check(await db.from('nordra_weddings').select('*').order('event_date',{ascending:false}).limit(500));},
    async memberEvents(userId){return check(await db.from('nordra_wedding_members').select('event_id').eq('user_id',userId));},
    async members(id){return check(await db.from('nordra_wedding_members').select('user_id,email').eq('event_id',id));},
    async member(id,userId){return !!check(await db.from('nordra_wedding_members').select('user_id').eq('event_id',id).eq('user_id',userId).maybeSingle());},
    async addMember(id,userId,email){check(await db.from('nordra_wedding_members').upsert({event_id:id,user_id:userId,email},{onConflict:'event_id,user_id'}));},
    async removeMember(id,userId){check(await db.from('nordra_wedding_members').delete().eq('event_id',id).eq('user_id',userId));},
    async create(row){check(await db.from('nordra_weddings').insert(row));return row;},
    async swap(row,patch){const data=check(await db.from('nordra_weddings').update({...patch,version:row.version+1}).eq('id',row.id).eq('version',row.version).select('id'));return !!data?.length;},
    async allow(bucket,limit){return check(await db.rpc('nordra_wedding_allow',{p_bucket:bucket,p_limit:limit}))===true;},
  };
}
function requestBucket(req,scope) {
  const ip=(process.env.VERCEL?req.headers['x-forwarded-for']:req.socket?.remoteAddress)?.split(',')[0].trim();
  if(!isIP(ip || ''))return fail('unavailable',503);
  return createHmac('sha256',process.env.SUPABASE_SECRET_KEY).update(`private-wedding:${scope}:${Math.floor(Date.now()/3600000)}:${ip}`).digest('hex');
}
const defaults={store:privateWeddingStore,accounts:accountService,admin:authorizeAdmin,site:()=>process.env.NORDRA_SITE_URL,bucket:requestBucket,now:()=>Date.now()};
export function privateWeddingHandler(deps=defaults) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Referrer-Policy','no-referrer');
    if(req.method!=='POST')return res.status(405).json({code:'invalid_method'});
    try {
      const site=deps.site();
      if(!site)return fail('unavailable',503);
      const origin=req.headers.origin, preview=process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:null;
      if(origin!==new URL(site).origin && origin!==preview)return fail('invalid_origin',403);
      let body;try{body=weddingBody(req);}catch{return fail('invalid_request');}
      const store=deps.store(), accounts=deps.accounts(), action=body.action;
      const scope=['login','activate'].includes(action)?'login':typeof action==='string' && (action.startsWith('guest-') || action==='public-pass')?'guest':'panel';
      if(!await store.allow(deps.bucket(req,scope),scope==='login'?30:scope==='guest'?240:1600))return fail('limited',429);
      if(action==='logout'){await accounts.logout(req,res);return res.status(200).json({signedIn:false});}
      if(action==='login' || action==='activate') {
        if(typeof body.password!=='string' || body.password.length>200 || body.password.length<(action==='activate'?12:1))return fail('invalid_password');
        let user;
        if(action==='activate') {
          if(typeof body.token!=='string' || !/^[a-zA-Z0-9_-]{20,256}$/.test(body.token))return fail('invalid_access',401);
          const type=body.type || 'magiclink';
          if(!['magiclink','signup'].includes(type))return fail('invalid_access',401);
          user=await accounts.activate(body.token,body.password,res,type);
        } else {
          if(typeof body.email!=='string' || body.email.length>254)return fail('invalid_access',401);
          user=await accounts.login(body.email.trim().toLowerCase(),body.password,res);
        }
        if(!user)return fail('invalid_access',401);
        return res.status(200).json({signedIn:true,email:user.email});
      }
      if(action==='session' || action==='client-list') {
        const user=await accounts.identify(req,res);
        if(!user){if(action==='session')return res.status(200).json({signedIn:false});return fail('signed_out',401);}
        const memberships=await store.memberEvents(user.id);
        const rows=await Promise.all(memberships.map(member=>store.read(member.event_id)));
        const events=rows.filter(row=>row && Date.parse(row.expires_at)>deps.now()).map(row=>eventView(row,deps.now()));
        return res.status(200).json({signedIn:true,email:user.email,events});
      }
      if(typeof action==='string' && action.startsWith('admin-')) {
        if(!await deps.admin(req))return fail('signed_out',401);
        if(action==='admin-list') {
          const rows=await store.list();
          return res.status(200).json({events:rows.map(row=>({...eventView(row,deps.now()),invitationsCount:row.invitations.length,peopleCount:row.invitations.reduce((n,x)=>n+x.people.length,0)}))});
        }
        if(action==='admin-create') {
          if(!uuid.test(body.id || ''))return fail('invalid_event');
          const old=await store.read(body.id);if(old)return res.status(200).json({event:eventView(old,deps.now())});
          const row={id:body.id,...normalizeEvent(body.event),guest_secret:randomBytes(32).toString('hex'),invitations:[],version:1};
          await store.create(row);return res.status(200).json({event:eventView(row,deps.now())});
        }
        if(!uuid.test(body.eventId || ''))return fail('event_missing',404);
        const row=await store.read(body.eventId);if(!row)return fail('event_missing',404);
        if(action==='admin-members')return res.status(200).json({members:await store.members(row.id)});
        if(action==='admin-access') {
          if(Date.parse(row.expires_at)<=deps.now())return fail('event_archived',410);
          const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
          if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail('invalid_email');
          let access;try{access=await accounts.issue(email);}catch(error){return fail(error.message==='admin_email'?'admin_email':'account_unavailable',400);}
          await store.addMember(row.id,access.userId,email);
          const url=new URL('/mi-boda.html',site);url.hash=new URLSearchParams({acceso:access.token,tipo:access.type || 'magiclink'}).toString();
          return res.status(200).json({link:url.href,members:await store.members(row.id)});
        }
        if(action==='admin-revoke') {
          if(!uuid.test(body.userId || ''))return fail('invalid_access');
          await store.removeMember(row.id,body.userId);return res.status(200).json({members:await store.members(row.id)});
        }
        if(action==='admin-update') {
          if(body.version!==row.version)return fail('response_changed',409);
          const patch=normalizeEvent(body.event);
          if(!await store.swap(row,patch))return fail('response_changed',409);
          return res.status(200).json({event:eventView({...row,...patch,version:row.version+1},deps.now())});
        }
        return fail('invalid_action');
      }
      if(!uuid.test(body.eventId || ''))return fail('event_missing',404);
      const guest=['guest-load','guest-reply'].includes(action), publicBoreal=publicBorealActions.includes(action);
      const admin=guest || publicBoreal?false:body.admin===true && await deps.admin(req);
      const user=guest || publicBoreal || admin?null:await accounts.identify(req,res);
      if(!guest && !publicBoreal && !admin && !user)return fail('signed_out',401);
      if(!guest && !publicBoreal && !admin && !await store.member(body.eventId,user.id))return fail('event_missing',404);
      for(let retry=0;retry<4;retry++) {
        const row=await store.read(body.eventId);if(!row)return fail('event_missing',404);
        const archived=Date.parse(row.expires_at)<=deps.now();
        if(archived && !(admin && action==='load'))return fail(guest?'link_unavailable':'event_archived',410);
        const mode='real', secret=row.guest_secret, now=deps.now();
        if(publicBoreal) {
          assertBoreal(row,mode);
          if(action==='public-pass')return res.status(200).json(passView(row,passInvitation(row,body,site,secret,mode),site,secret,mode));
          authorizeReception(row,body.accessToken,now);
          if(action==='reception-load')return res.status(200).json(receptionView(row,mode));
          if(action==='reception-scan')return res.status(200).json({...receptionView(row,mode),scanned:passInvitation(row,body,site,secret,mode).id});
          const change=changeBoreal(row,body,{site,mode,now,actor:'reception'});
          if(change.unchanged || await store.swap(row,{boreal:change.state}))return res.status(200).json({...receptionView({...row,boreal:change.state,version:row.version+(change.unchanged?0:1)},mode),result:change.result});
          continue;
        }
        if(guest) {
          if(!equal(body.token,realGuestToken(row,body.id || '')))return fail('link_unavailable',404);
          const invitation=row.invitations.find(x=>x.id===body.id);if(!invitation)return fail('link_unavailable',404);
          const closed=!!row.reply_until && deps.now()>=Date.parse(row.reply_until+'T06:00:00Z')+86400000;
          const guestInvitation=item=>({...item,...(row.plan==='Boreal'?{passLink:passLink(row,item,site,secret,mode)}:{})});
          const payload={event:eventView(row,deps.now()),invitation:guestInvitation(invitation),repliesClosed:closed};
          if(action==='guest-load')return res.status(200).json(payload);
          if(closed)return fail('replies_closed',409);
          const next=applyGuestReply(invitation,body),list=validateList(row.invitations.map(x=>x.id===invitation.id?next:x));
          if(await store.swap(row,{invitations:list,boreal:reconcileBoreal(row,list),management:logGuestChange(row,next)}))return res.status(200).json({...payload,invitation:guestInvitation(next)});
        } else {
          const payload=value=>({workspaceId:value.id,management:managementView(value),event:eventView(value,deps.now()),version:value.version,expiresAt:value.expires_at,boreal:value.plan==='Boreal'?borealView(value):undefined,invitations:value.invitations.map(x=>({...x,link:realGuestLink(value,x.id,site),...(value.plan==='Boreal'?{passLink:passLink(value,x,site,secret,mode)}:{})}))});
          if(action==='load')return res.status(200).json(payload(row));
          if(borealActions.includes(action)) {
            assertBoreal(row,mode);
            if(action==='pass-scan')return res.status(200).json({...payload(row),scanned:passInvitation(row,body,site,secret,mode).id});
            const change=changeBoreal(row,body,{site,mode,now,actor:admin?'nordra':user.id});
            if(change.unchanged || await store.swap(row,{boreal:change.state}))return res.status(200).json({...payload({...row,boreal:change.state,version:row.version+(change.unchanged?0:1)}),result:change.result,receptionLink:change.receptionLink});
            continue;
          }
          if(!['save','delete','attendance',...managementActions].includes(action))return fail('invalid_action');
          const change=changeManagement(row,body,admin?'nordra':'client',new Date(now).toISOString());
          const {list,management}=change;
          if(change.unchanged)return res.status(200).json(payload(row));
          const boreal=reconcileBoreal(row,list);
          if(await store.swap(row,{invitations:list,boreal,management}))return res.status(200).json(payload({...row,invitations:list,boreal,management,version:row.version+1}));
        }
      }
      return fail('response_changed',409);
    } catch(error) {return res.status(error instanceof WeddingError?error.status:503).json({code:error instanceof WeddingError?error.message:'unavailable'});}
  };
}
