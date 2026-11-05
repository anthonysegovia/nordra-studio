import sharp from 'sharp';import fs from 'node:fs';
const source='artwork-source/event-gafete-v1',out='public/artwork/event-gafete',records=[];
async function emit(name,sourceName,widths,crop){
 let buffer=fs.readFileSync(`${source}/${sourceName}.png`);if(crop)buffer=await sharp(buffer).extract(crop).toBuffer();
 for(const width of widths){const file=`${out}/${name}-${width}.webp`;await sharp(buffer).resize({width}).webp({quality:90,alphaQuality:100,effort:6}).toFile(file);records.push({file,bytes:fs.statSync(file).size,...await sharp(file).metadata()});}
}
for(const name of ['frente-impreso-v2','registro-impreso-v2','programa-impreso-v2','cordon-tejido-v2','mesa-calida-v2','abanico-impreso-v2','cafe-v2'])await emit(name,name,[780,1536]);
await emit('acceso-v2','frente-acceso-final-v2',[700,1400],{left:160,top:490,width:700,height:1046});
for(const [name,sheet,top]of [['boleto-si-v2','pestanas-impresas-v2',110],['boleto-no-v2','pestanas-impresas-v2',560],['boleto-neutro-v2','pestanas-neutras-v2',110]])await emit(name,sheet,[400,800],{left:50,top,width:1440,height:400});
for(let i=0;i<3;i++)await emit(`tarjeta-impresa-${i+1}-v2`,'tarjetas-impresas-v2',[400,800],{left:30,top:i*512+20,width:960,height:492});
fs.writeFileSync(`${source}/web-assets-v2.json`,JSON.stringify(records,null,2));console.log(records.map(r=>[r.file,r.bytes,r.hasAlpha]));
