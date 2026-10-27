// Local, disposable QA only. Never imported by a production entry point.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { createServer } from 'vite';
import { privateWeddingHandler } from '../server/private-weddings.js';
const origin='http://127.0.0.1:5175',rows=new Map(),members=new Map(),users=new Map(),tokens=new Map();
const copy=x=>x?structuredClone(x):null;
const store={async read(id){return copy(rows.get(id));},async list(){return [...rows.values()].map(copy);},async create(row){rows.set(row.id,copy(row));return row;},async swap(row,patch){if(rows.get(row.id)?.version!==row.version)return false;rows.set(row.id,{...copy(row),...copy(patch),version:row.version+1});return true;},async allow(){return true;},async memberEvents(user){return [...members.entries()].filter(([,list])=>list.some(x=>x.user_id===user)).map(([event_id])=>({event_id}));},async member(id,user){return members.get(id)?.some(x=>x.user_id===user)||false;},async members(id){return copy(members.get(id))||[];},async addMember(id,user,email){members.set(id,[...(members.get(id)||[]).filter(x=>x.user_id!==user),{user_id:user,email}]);},async removeMember(id,user){members.set(id,(members.get(id)||[]).filter(x=>x.user_id!==user));}};
const accounts={
  async identify(req){const id=(req.headers.cookie||'').match(/fixture_client=([\w-]+)/)?.[1];return [...users.values()].find(x=>x.id===id)||null;},
  async issue(email){let user=users.get(email);if(!user){user={id:randomUUID(),email,password:'Nordra-Prueba-2026'};users.set(email,user);}const token=randomUUID().replaceAll('-','')+randomUUID().replaceAll('-','');tokens.set(token,user);return {userId:user.id,token};},
  async login(email,password,res){const user=users.get(email);if(!user || user.password!==password)return null;res.setHeader('Set-Cookie',`fixture_client=${user.id}; Path=/; HttpOnly; SameSite=Strict`);return user;},
  async activate(token,password,res){const user=tokens.get(token);if(!user)return null;tokens.delete(token);user.password=password;res.setHeader('Set-Cookie',`fixture_client=${user.id}; Path=/; HttpOnly; SameSite=Strict`);return user;},
  async logout(req,res){res.setHeader('Set-Cookie','fixture_client=; Path=/; Max-Age=0');},
};
const handler=privateWeddingHandler({store:()=>store,accounts:()=>accounts,admin:async()=>true,site:()=>origin,bucket:()=> 'fixture',now:()=>Date.now()});
const vite=await createServer({server:{middlewareMode:true},appType:'mpa'});
http.createServer(async(req,res)=>{
  res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
  if(req.url==='/api/admin-session')return res.json({configured:true,signedIn:true});
  if(req.url==='/api/admin-payments')return res.json({requests:[]});
  if(req.url==='/api/weddings') {let body='';for await(const chunk of req){body+=chunk;if(body.length>8192){res.writeHead(413).end();return;}}req.body=body;return handler(req,res);}
  vite.middlewares(req,res,()=>{res.writeHead(404).end();});
}).listen(5175,'127.0.0.1',()=>console.log('Private wedding fixture http://127.0.0.1:5175/?panel=pagos&seccion=bodas'));
