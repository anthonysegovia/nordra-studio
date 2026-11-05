// Production build, same PerformanceObserver/FCP-to-10s method as the original report.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createServer} from 'node:http';
import {launch,profile,preparationMetrics} from './wedding-rings-browser-support.mjs';
const output=process.env.RINGS_EVIDENCE;if(!output)throw Error('Set RINGS_EVIDENCE outside the repository');
const root=path.resolve('dist');const server=createServer((req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
 if(pathname==='/_vercel/insights/script.js'){res.setHeader('Content-Type','text/javascript');res.end('');return;}
 let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))throw Error();if(!path.extname(file))file+='.html';
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const results=[];
try{for(const theme of ['light','dark'])for(let run=1;run<=3;run++){
 // Fresh browser process per pair also avoids reusing another pair's GPU program cache.
 const browser=await launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:'es-MX'});await profile(context,{cores:4});const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(page);
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:10*1024*1024/8,uploadThroughput:750*1024/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 for(const visit of ['first','repeat']){
  await page.goto(`http://127.0.0.1:${server.address().port}/bodas?theme=${theme}`);
  await page.waitForSelector('.rings-hero.has-scene',{timeout:60000});await page.waitForTimeout(await page.evaluate(()=>Math.max(0,10000-performance.now())));
  const data=await preparationMetrics(page);assert(Number.isFinite(data.ready),'Scene must finish preparation');results.push({theme,run,visit,...data,errors:[...errors]});console.log(JSON.stringify(results.at(-1)));
 }
 }finally{await browser.close();}
}fs.writeFileSync(path.join(output,'production-performance.json'),JSON.stringify(results,null,2));assert(results.every(r=>r.maximumTask<=200),'A scene task exceeds 200 ms');assert(results.every(r=>r.errors.length===0),'Page errors');
}finally{await new Promise(r=>server.close(r));}
