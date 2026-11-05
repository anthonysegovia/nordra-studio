import sharp from 'sharp';
import fs from 'node:fs';
const source='artwork-source/event-gafete-v1',out='public/artwork/event-gafete';
const records=[];
async function exportImage(name,file,widths,extract){
 let buffer=fs.readFileSync(`${source}/${file}.png`);
 if(extract)buffer=await sharp(buffer).extract(extract).toBuffer();
 const metadata=await sharp(buffer).metadata();
 for(const width of widths){const target=`${out}/${name}-${width}.webp`;await sharp(buffer).resize({width,withoutEnlargement:true}).webp({quality:86,alphaQuality:100,effort:6}).toFile(target);records.push({file:target,bytes:fs.statSync(target).size,...await sharp(target).metadata()});}
 console.log(name,metadata.width,metadata.height,metadata.hasAlpha);
}
for(const [name,widths]of [['gafete-reverso',[480,960]],['gafete-frente',[480,960]],['mesa',[780,1536]],['tarjeta-registro',[540,1080]],['programa',[780,1536]],['cordon-tramos',[780,1536]],['tarjetas',[540,1024]],['pestanas',[540,1080]],['circulo',[80,160]],['compartir',[600,1200]]])await exportImage(name,name,widths);
const cardMeta=await sharp(`${source}/tarjetas.png`).metadata();
for(let i=0;i<3;i++)await exportImage(`tarjeta-${i+1}`,'tarjetas',[390,780],{left:55,top:i*512+30,width:914,height:475});
const cordMeta=await sharp(`${source}/cordon-tramos.png`).metadata();
for(const [name,top,height]of [['curva',0,315],['bucle',315,410],['recto',725,162]])await exportImage(`cordon-${name}`,'cordon-tramos',[780,1536],{left:0,top,width:cordMeta.width,height});
const tab=await sharp(`${source}/pestanas.png`).metadata();
for(const [name,left]of [['si',0],['no',Math.floor(tab.width/2)]])await exportImage(`pestana-${name}`,'pestanas',[260,520],{left,top:0,width:Math.floor(tab.width/2),height:tab.height});
fs.writeFileSync(`${source}/web-assets.json`,JSON.stringify(records,null,2));
