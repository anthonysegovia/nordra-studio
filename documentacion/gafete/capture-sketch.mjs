import {chromium} from 'playwright';import fs from 'node:fs';import {localServer} from './local-server.mjs';
fs.mkdirSync('documentacion/gafete/capturas',{recursive:true});
const server=await localServer(5603),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
try{
 for(const width of [390,1440])for(const name of ['portada','giro','interior','elegido','personal','no']){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000},deviceScaleFactor:1});
  const errors=[];page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  await page.goto(`http://127.0.0.1:5603/documentacion/gafete/boceto/${name}.html`);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  const geometry=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,textOverflow:[...document.querySelectorAll('p,h1,h2,.tab span')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent)}));
  await page.screenshot({path:`documentacion/gafete/capturas/${name}-${width}.png`,fullPage:true});checks.push({name,width,...geometry,errors});console.log(name,width,geometry);await page.close();
 }
}finally{fs.writeFileSync('documentacion/gafete/comprobaciones.json',JSON.stringify(checks,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));}
if(checks.some(c=>c.scrollWidth>c.width||c.textOverflow.length||c.errors.length||(['interior','elegido','personal','no'].includes(c.name)&&c.width===390&&c.height>2600)))process.exitCode=1;
