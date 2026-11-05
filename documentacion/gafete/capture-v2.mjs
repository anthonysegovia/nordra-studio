import {chromium} from 'playwright';import fs from 'node:fs';import {localServer} from './local-server.mjs';
const server=await localServer(5604),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
try{for(const width of [390,1440])for(const name of ['portada','giro','interior','elegido','personal','no']){
 const page=await browser.newPage({viewport:{width,height:width===390?844:1000},deviceScaleFactor:1});const errors=[];
 page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:5604/documentacion/gafete/boceto/${name}.html`);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const geometry=await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,textOverflow:[...document.querySelectorAll('p,h1,h2,.guest-data')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent),headings:[...document.querySelectorAll('h2')].map(e=>({text:e.textContent,fontSize:parseFloat(getComputedStyle(e).fontSize)})),missingImages:[...document.images].filter(e=>!e.naturalWidth).map(e=>e.src)}));
 await page.screenshot({path:`documentacion/gafete/boceto/${name}-${width}.png`,fullPage:true});fs.copyFileSync(`documentacion/gafete/boceto/${name}-${width}.png`,`documentacion/gafete/capturas/${name}-${width}.png`);
 if(['interior','elegido','personal','no'].includes(name)){await page.locator('#confirmacion').screenshot({path:`documentacion/gafete/boceto/acceso-${name}-${width}.png`});}
 checks.push({name,...geometry,errors});console.log(name,width,geometry.height,errors);await page.close();
}}finally{await browser.close();await new Promise(resolve=>server.close(resolve));fs.writeFileSync('documentacion/gafete/comprobaciones-v2.json',JSON.stringify(checks,null,2));}
if(checks.some(c=>c.scrollWidth>c.width||c.textOverflow.length||c.missingImages.length||c.errors.length||(c.width===390&&c.height>2600)||c.headings.some(h=>h.fontSize<(c.width===390?40:64))))process.exitCode=1;
