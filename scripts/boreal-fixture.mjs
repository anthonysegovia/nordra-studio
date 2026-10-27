// Disposable loopback QA, with fictional guests only. Never deployed.
import http from 'node:http';
import { createServer } from 'vite';
import { privateWeddingHandler, normalizeEvent } from '../server/private-weddings.js';
import { weddingHandler, sampleInvitations } from '../server/wedding-links.js';
import { sampleBoreal } from '../server/wedding-boreal.js';
const origin='http://127.0.0.1:5176', rows=new Map(), previews=new Map(), user='77777777-7777-4777-8777-777777777777';
const copy=value=>value?structuredClone(value):null;
for(const [id,plan] of [['11111111-1111-4111-8111-111111111111','Boreal'],['22222222-2222-4222-8222-222222222222','Aurora']]) {
  const invitations=sampleInvitations();
  rows.set(id,{id,...normalizeEvent({couple:'Valentina & Sebastián',eventDate:'2027-06-19',city:'Cancún',plan,coverPath:'/demos/boda-jardin/photos/recuerdo-1-800.jpg',invitationPath:'/demos/boda-jardin/index.html'}),guest_secret:'b'.repeat(64),invitations,version:1,boreal:plan==='Boreal'?sampleBoreal(invitations):{}});
}
const store={async read(id){return copy(rows.get(id));},async list(){return [...rows.values()].map(copy);},async allow(){return true;},async member(){return true;},async memberEvents(){return [...rows.keys()].map(event_id=>({event_id}));},async swap(row,patch){if(rows.get(row.id)?.version!==row.version)return false;rows.set(row.id,{...copy(rows.get(row.id)),...copy(patch),version:row.version+1});return true;}};
const sampleStore={async read(id){return copy(previews.get(id));},async allow(){return true;},async create(row){previews.set(row.id,copy(row));return row;},async swap(row,invitations,boreal,management){if(previews.get(row.id)?.version!==row.version)return false;previews.set(row.id,{...copy(row),invitations:copy(invitations),...(boreal?{boreal:copy(boreal)}:{}),...(management?{management:copy(management)}:{}),version:row.version+1});return true;}};
const real=privateWeddingHandler({store:()=>store,accounts:()=>({async identify(){return {id:user,email:'fictional@example.test'};}}),admin:async()=>true,site:()=>origin,bucket:()=> 'fixture',now:()=>Date.now()});
const sample=weddingHandler({store:()=>sampleStore,secret:()=> 'isolated-local-fixture',site:()=>origin,bucket:()=> 'fixture'});
const vite=await createServer({server:{middlewareMode:true},appType:'mpa'});
http.createServer(async(req,res)=>{
  if(['/api/weddings','/api/wedding-links'].includes(req.url)) {
    let body='';for await(const chunk of req){body+=chunk;if(body.length>262144){res.writeHead(413).end();return;}}
    req.body=body;res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
    return (req.url==='/api/weddings'?real:sample)(req,res);
  }
  vite.middlewares(req,res,()=>{res.writeHead(404).end();});
}).listen(5176,'127.0.0.1',()=>console.log('Boreal QA http://127.0.0.1:5176/mi-boda.html?boda=11111111-1111-4111-8111-111111111111&admin=1#mesas'));
