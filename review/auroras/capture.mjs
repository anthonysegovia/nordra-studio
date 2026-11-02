import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const out='review/auroras/muestras';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('console',m=>{if(m.type()==='error') console.error(m.text())});
 page.on('pageerror',console.error);
 await page.goto('http://127.0.0.1:5276/review/auroras/');
 await page.waitForSelector('#scene.has-scene');
 const cdp=await page.context().newCDPSession(page);
 const results=[];
 for(const [index,name] of ['serena','activa','corona','activa-suavizada'].entries()){
  if(process.argv[2] && name!==process.argv[2]) continue;
  await page.keyboard.press(String(index+1)); await page.waitForTimeout(400);
  if(name.startsWith('activa')) await page.waitForFunction(() => window.reviewPulse > 0.94);
  await page.screenshot({path:out+'/'+name+'.png'});
  const timings=await page.evaluate(()=>new Promise(resolve=>{
    const samples=[],pixel=new Uint8Array(4);
    window.measureLandscape=(renderer,draw)=>{
      const gl=renderer.getContext(),t=performance.now();
      draw();
      gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
      samples.push(performance.now()-t);
      if(samples.length===125){window.measureLandscape=null;resolve(samples.slice(5).sort((a,b)=>a-b))}
    };
  }));
  results.push({name,samples:timings.length,medianMs:timings[60],p95Ms:timings[114]});
  await fs.writeFile(out+'/'+(process.argv[2]||'coste')+'.json',JSON.stringify(results,null,2));
  const dir=out+'/frames-'+name;await fs.mkdir(dir,{recursive:true});
  const frames=[],writes=[];
  const capture=({data,metadata,sessionId})=>{
    cdp.send('Page.screencastFrameAck',{sessionId}).catch(()=>{});
    const file='f'+frames.length+'.jpg';frames.push({file,t:metadata.timestamp});
    writes.push(fs.writeFile(dir+'/'+file,Buffer.from(data,'base64')));
  };
  cdp.on('Page.screencastFrame',capture);
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1440,maxHeight:900});
  await page.waitForTimeout(10500);await cdp.send('Page.stopScreencast');
  cdp.off('Page.screencastFrame',capture);await Promise.all(writes);
  if(frames.length<30||frames.at(-1).t-frames[0].t<10)throw Error('Incomplete capture');
  await fs.writeFile(dir+'/frames.txt',frames.map((f,i)=>"file '"+f.file+"'\nduration "+Math.max(.01,(frames[i+1]?.t??f.t+.04)-f.t)).join('\n'));
  const r=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',dir+'/frames.txt','-t','10','-vf','fps=30','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',out+'/'+name+'.mp4'],{encoding:'utf8'});
  if(r.status!==0)throw Error(r.stderr);console.log(results.at(-1));
 }
}finally{await browser.close()}
