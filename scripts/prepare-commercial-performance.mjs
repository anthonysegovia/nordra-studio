// Regenerate small category artwork with the project's Sharp/WebP toolchain.
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
await mkdir('public/artwork/performance',{recursive:true});
for(const [name,source] of [['lily','artwork/wedding-lilies/lily-stem-v1-320.webp'],['gafete','artwork/event-gafete/reverso-live-480.webp'],['pinata','demos/posada-pinata/assets/pinata-560.webp']])
 await sharp('public/'+source).resize({width:200}).webp({quality:80}).toFile('public/artwork/performance/'+name+'-200.webp');

for(const index of [0,1,2]){const dest=`public/artwork/performance/aurora-${index}-780.webp`;await sharp(`public/nordra/v548/assets/aurora-mobile-${index}.webp`).resize({width:780}).webp({quality:80}).toFile(dest);}
