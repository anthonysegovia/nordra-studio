// Render the same pose as the first WebGL frame, using the installed Chromium and FFmpeg.
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {eventStamp} from '../src/celebrations/caja-de-regalo/clock.mjs';
import {invitation} from '../src/celebrations/caja-de-regalo/config.mjs';

if(!/^\/artwork\/[a-z\d/-]+$/i.test(invitation.poster))throw Error('Use a local /artwork/ poster prefix.');
const base=path.join('public',invitation.poster);
mkdirSync(path.dirname(base),{recursive:true});
const vite=await createServer({optimizeDeps:{include:['three','three/addons/objects/MarchingCubes.js']},server:{host:'127.0.0.1',port:0}});
await vite.listen();
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage();
  await page.route('**/render.html',r=>r.fulfill({contentType:'text/html',body:'<div style="width:780px"><canvas></canvas></div>'}));
  await page.goto(vite.resolvedUrls.local[0]+'render.html');
  const png=await page.evaluate(async()=>{
    const {createFloatScene}=await import('/src/celebrations/numero-que-flota/scene.js');
    const canvas=document.querySelector('canvas');
    const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
    if(!gl)throw Error('WebGL 2 is required to generate the poster.');
    const scene=createFloatScene(canvas.parentElement,canvas,gl,'high');
    scene.render(0,{x:0,y:0});
    const data=canvas.toDataURL().split(',')[1];scene.dispose();return data;
  });
  for(const width of [390,780]){
    const result=spawnSync('ffmpeg',['-loglevel','error','-y','-i','pipe:0','-vf','scale='+width+':'+width,'-quality','92',base+'-'+width+'.webp'],{input:Buffer.from(png,'base64')});
    if(result.status!==0)throw Error(result.stderr?.toString()||'FFmpeg failed');
  }
  // Keep calendar identity stable when changing the invitation's display data.
  const calendar='public/invitaciones/camila-30/fecha.ics';
  const ics=value=>value.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
  const stamp=new Date(eventStamp(invitation)).toISOString().replace(/[-:]/g,'').replace('.000','');
  writeFileSync(calendar,['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nordra Studio//Invitaciones//ES','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:camila-30@nordrastudio.mx','DTSTAMP:20261102T000000Z','DTSTART:'+stamp,'SUMMARY:'+ics(invitation.name+' '+invitation.balloons),'LOCATION:'+ics(invitation.place),'DESCRIPTION:Invitacion de muestra con datos ficticios','STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR',''].join('\r\n'));
}finally{await browser.close();await vite.close()}
