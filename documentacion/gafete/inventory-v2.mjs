import fs from 'node:fs';import sharp from 'sharp';
const source='artwork-source/event-gafete-v1',doc='documentacion/gafete';
const previous=JSON.parse(fs.readFileSync(`${source}/manifest-v2.json`));
const selected=['frente-impreso-v2','mesa-calida-v2','cordon-tejido-v2','registro-impreso-v2','programa-impreso-v2','abanico-impreso-v2','cafe-v2','frente-acceso-final-v2','pestanas-impresas-v2','pestanas-neutras-v2'];
const all=fs.readdirSync(source).filter(f=>f.endsWith('-v2.png'));
const records=[];for(const original of all){const name=original.replace('.png','');records.push({name,original,prompt:`prompts/${name}.txt`,status:selected.includes(name)?'used-in-sketch':name==='tarjetas-impresas-v2'?'individual-card-sheet':'iteration-not-used',generated:previous.find(r=>r.name===name)?.path,...await sharp(`${source}/${original}`).metadata()});}
fs.writeFileSync(`${source}/manifest-v2.json`,JSON.stringify(records,null,2));
const gallery=[];for(let i=0;i<selected.length;i++){const name=selected[i],x=i%4*400,y=Math.floor(i/4)*370;gallery.push({input:await sharp(`${source}/${name}.png`).resize(370,300,{fit:'inside'}).toBuffer(),left:x+15,top:y+55},{input:Buffer.from(`<svg width="400" height="50"><rect width="100%" height="100%" fill="#edf2f4"/><text x="10" y="32" font-family="Arial" font-size="19" fill="#123044">${name}</text></svg>`),left:x,top:y});}
await sharp({create:{width:1600,height:1110,channels:3,background:'#e3dccf'}}).composite(gallery).png().toFile(`${doc}/arte-v2.png`);
const assets=JSON.parse(fs.readFileSync(`${source}/web-assets-v2.json`));const h=fs.readFileSync(`${doc}/boceto/personal.html`,'utf8');
const budget=[];for(const width of [390,1440]){const files=new Set(['mesa-calida-v2-1536.webp']);for(const m of h.matchAll(/srcset="([^"]+)"/g))files.add(m[1].split(', ')[width===390?0:1].split(' ')[0].split('/').pop());budget.push({width,files:[...files],bytes:assets.filter(a=>files.has(a.file.split('/').pop())).reduce((n,a)=>n+a.bytes,0)});}
fs.writeFileSync(`${doc}/pesos-v2.json`,JSON.stringify(budget,null,2));console.log({originals:records.length,webFiles:assets.length,budget});
