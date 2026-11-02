// Start production previews for 3db332c and the candidate; capture both on the same GPU.
// node scripts/check-winter-night.mjs http://127.0.0.1:5301 http://127.0.0.1:5302
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const urls=process.argv.slice(2);
assert.equal(urls.length,2,'Pass the base and candidate preview URLs');
const root='review/invierno';
const dirs=['noche-base','noche-invierno'].map(name=>root+'/'+name);
for(const [index,url] of urls.entries()){
  const capture=spawnSync(process.execPath,['scripts/capture-landscape-posters.mjs','--url',url,
    '--build',index===0?root+'/base-dist':'dist','--phase','final','--theme','dark','--software','--output',dirs[index],'--evidence',dirs[index]],{stdio:'inherit'});
  assert.equal(capture.status,0);
}
const results=[];
for(const size of ['compact','desktop','wide','mobile']){
  const pixels=dirs.map(dir=>{
    const decode=spawnSync('ffmpeg',['-v','error','-i',dir+'/landscape-poster-dark-'+size+'-v5.png','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{maxBuffer:32*1024*1024});
    assert.equal(decode.status,0,String(decode.stderr));return decode.stdout;
  });
  assert.equal(pixels[0].length,pixels[1].length);
  let changed=0,maximum=0;
  for(let i=0;i<pixels[0].length;i+=3){
    const delta=Math.max(...[0,1,2].map(j=>Math.abs(pixels[0][i+j]-pixels[1][i+j])));
    if(delta)changed++;
    maximum=Math.max(maximum,delta);
  }
  const count=pixels[0].length/3;
  results.push({size,changed,count,maximum});console.log(results.at(-1));
  assert.equal(changed,0,'Night regression at '+size);
}
writeFileSync(root+'/noche.json',JSON.stringify(results,null,2));