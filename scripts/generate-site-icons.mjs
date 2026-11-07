import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

// Derive every size from the approved vector mark; retain a solid brand background.
const svg=readFileSync('public/favicon.svg','utf8').replace(/rx="14"/, 'rx="0"');
async function icon(size){
  const inset=Math.round(size*.12), inner=size-inset*2;
  return sharp({create:{width:size,height:size,channels:4,background:'#020816'}})
    .composite([{input:await sharp(Buffer.from(svg)).resize(inner,inner).png().toBuffer(),left:inset,top:inset}]).png().toBuffer();
}
writeFileSync('public/apple-touch-icon.png',await icon(180));
writeFileSync('public/favicon-32x32.png',await icon(32));
const sizes=[16,32,48], images=await Promise.all(sizes.map(icon));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(let i=0;i<sizes.length;i++){
  const pos=6+16*i;header[pos]=sizes[i];header[pos+1]=sizes[i];header.writeUInt16LE(1,pos+4);header.writeUInt16LE(32,pos+6);header.writeUInt32LE(images[i].length,pos+8);header.writeUInt32LE(offset,pos+12);offset+=images[i].length;
}
writeFileSync('public/favicon.ico',Buffer.concat([header,...images]));
