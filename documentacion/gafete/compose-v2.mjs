import sharp from 'sharp';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import crypto from 'node:crypto';
const root='documentacion/gafete/';
async function pair(name,right,rightLabel){
 const files=[root+'boceto/interior-1440.png',right],layers=[],height=Math.max(...await Promise.all(files.map(async f=>(await sharp(f).metadata()).height)))+100;
 for(let i=0;i<2;i++){const title=i?rightLabel:'El gafete · Fase 1b';layers.push({input:Buffer.from(`<svg width="1440" height="100"><rect width="100%" height="100%" fill="#edf2f4"/><text x="35" y="65" font-family="Arial" font-size="35" fill="#123044">${title}</text></svg>`),top:0,left:i*1464},{input:files[i],top:100,left:i*1464});}
 await sharp({create:{width:2904,height,channels:3,background:'#e7ecef'}}).composite(layers).png().toFile(root+`boceto/${name}.png`);
 await sharp(root+`boceto/${name}.png`).resize(1200).png().toFile(root+`boceto/${name}-vista.png`);
}
await pair('comparacion-caja-v2',root+'referencias/caja-1440.png','La caja de regalo');
await pair('comparacion-anterior-v2',root+'anterior/interior-1440.png','El gafete · Fase 1');
const cover=[];for(const width of [390,1440]){const file=`${root}capturas/portada-${width}.png`;const before=execFileSync('git',['show',`23dff5c:${file}`],{maxBuffer:30*1024*1024});const now=fs.readFileSync(file);cover.push({width,pixelIdentical:await sharp(before).raw().toBuffer().then(async b=>b.equals(await sharp(now).raw().toBuffer())),previousSHA256:crypto.createHash('sha256').update(before).digest('hex'),currentSHA256:crypto.createHash('sha256').update(now).digest('hex')});}
fs.writeFileSync(root+'portada-conservada.json',JSON.stringify(cover,null,2));console.log(cover);
for(const name of ['giro','interior','personal'])await sharp(root+`boceto/${name}-1440.png`).resize(720).png().toFile(root+`capturas/${name}-vista.png`);
