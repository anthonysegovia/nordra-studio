import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const names = ['nervous-groom', 'before-call', 'heavy-veil', 'sore-smiles', 'both-camera'];
const assets=[];
for (const name of names) {
 const source=`artwork-source/wedding-marfil-v2/${name}-v1.png`;
 const {width,height}=await sharp(source).metadata();
 const outputs=[];
 for (const size of width<height ? [320,640,1120] : [480,800,1440]) {
  const output=`public/artwork/wedding-marfil/${name}-v1-${size}.webp`;
  const info=await sharp(source).resize({width:size}).webp({quality:80}).toFile(output);
  outputs.push({file:output,width:info.width,height:info.height,bytes:info.size});
 }
 assets.push({name,source,width,height,outputs});
}
await writeFile('artwork-source/wedding-marfil-v2/assets.json',JSON.stringify(assets,null,2)+'\n');
console.log(JSON.stringify(assets));
