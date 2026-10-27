// Local UI verification only; production always uses the Supabase repository.
import http from 'node:http';
import { createServer } from 'vite';
import { weddingHandler } from '../server/wedding-links.js';
const origin='http://127.0.0.1:5174';
const rows=new Map();
const store={
  async read(id){return rows.has(id)?structuredClone(rows.get(id)):null;},
  async create(row){rows.set(row.id,structuredClone(row));return row;},
  async swap(row,list){if(rows.get(row.id)?.version!==row.version)return false;rows.set(row.id,{...row,invitations:structuredClone(list),version:row.version+1});return true;},
  async allow(){return true;},
};
const handler=weddingHandler({store:()=>store,secret:()=> 'isolated-local-fixture',site:()=>origin,bucket:()=> 'fixture'});
const vite=await createServer({server:{middlewareMode:true},appType:'mpa'});
http.createServer(async(req,res)=>{
  if(req.url==='/api/wedding-links') {
    let body='';for await(const chunk of req){body+=chunk;if(body.length>8192){res.writeHead(413).end();return;}}
    req.body=body;res.status=code=>{res.statusCode=code;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
    return handler(req,res);
  }
  vite.middlewares(req,res,()=>{res.writeHead(404).end();});
}).listen(5174,'127.0.0.1',()=>console.log('Wedding fixture http://127.0.0.1:5174/panel-boda.html'));
