import sharp from 'sharp';
import fs from 'node:fs';
const root='documentacion/gafete/';
const columns=[['El gafete',root+'capturas/interior-1440.png'],['La caja de regalo',root+'referencias/caja-1440.png'],['La posada',root+'referencias/posada-1440.png'],['La Mansión',root+'referencias/mansion-1440.png']];
const label=(text,width)=>Buffer.from(`<svg width="${width}" height="100"><rect width="100%" height="100%" fill="#edf2f4"/><text x="30" y="62" font-family="Arial" font-size="32" fill="#123044">${text}</text></svg>`);
const layers=[];
for(let i=0;i<columns.length;i++){layers.push({input:label(columns[i][0],1440),left:i*1464,top:0},{input:columns[i][1],left:i*1464,top:100});}
await sharp({create:{width:5832,height:4380,channels:3,background:'#d7e0e3'}}).composite(layers).png().toFile(root+'comparacion-1440.png');
await sharp(root+'comparacion-1440.png').resize(1920).png().toFile(root+'comparacion-vista.png');
const assets=JSON.parse(fs.readFileSync('artwork-source/event-gafete-v1/web-assets.json'));
const large=assets.filter(a=>!assets.some(b=>b.file.replace(/-\d+\.webp$/,'')===a.file.replace(/-\d+\.webp$/,'')&&b.width>a.width));
const gallery=[];
for(let i=0;i<large.length;i++){const a=large[i],x=(i%4)*400,y=Math.floor(i/4)*350;gallery.push({input:await sharp(a.file).resize(380,280,{fit:'inside'}).extend({top:0,bottom:0,left:0,right:0}).toBuffer(),left:x+10,top:y+60},{input:await sharp(label(a.file.split('/').pop(),800)).resize(400,50).toBuffer(),left:x,top:y});}
await sharp({create:{width:1600,height:Math.ceil(large.length/4)*350,channels:3,background:'#e8edef'}}).composite(gallery).png().toFile(root+'arte-contacto.png');
console.log({webFiles:assets.length,totalWebBytes:assets.reduce((n,a)=>n+a.bytes,0)});
