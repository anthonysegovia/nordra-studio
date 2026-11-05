import fs from 'node:fs';
const a=JSON.parse(fs.readFileSync('artwork-source/event-gafete-v1/web-assets.json'));
const result=[];
for(const width of [390,1440])for(const state of ['portada','personal']){
 const h=fs.readFileSync(`documentacion/gafete/boceto/${state}.html`,'utf8');
 const files=new Set(['mesa-1536.webp']);
 for(const m of h.matchAll(/srcset="([^"]+)"/g))files.add(m[1].split(', ')[width===390?0:1].split(' ')[0].split('/').pop());
 result.push({width,state,files:[...files],bytes:a.filter(x=>files.has(x.file.split('/').pop())).reduce((n,x)=>n+x.bytes,0)});
}
fs.writeFileSync('documentacion/gafete/pesos.json',JSON.stringify(result,null,2));
console.log(result);
