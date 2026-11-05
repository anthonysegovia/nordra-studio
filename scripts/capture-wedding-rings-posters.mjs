// Reproducible offline portraits: npm run dev -- --port 5198, then this script.
// No PNG is written; render the actual production module with its RAF suspended.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import sharp from 'sharp';
import {launch,instrument,profile} from './wedding-rings-browser-support.mjs';
const url=process.env.RINGS_URL||'http://127.0.0.1:5198',output=path.resolve('public/artwork/wedding-rings');fs.mkdirSync(output,{recursive:true});
const browser=await launch();
try{for(const [format,viewport] of Object.entries({mobile:{width:390,height:844},desktop:{width:1440,height:900},wide:{width:2560,height:1080}}))for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport,locale:'es-MX',deviceScaleFactor:1});await profile(context);const page=await context.newPage();await instrument(page);
 // Fixed random stream makes particles reproducible as well as camera/time.
 await context.addInitScript(()=>{let s=271828;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};});
 await page.goto(`${url}/bodas?theme=${theme}`);if(format==='mobile')await page.locator('[data-rings-start]').click();await page.waitForFunction(()=>window.__rings);
 const captureHeight=await page.evaluate(()=>{const hero=document.querySelector('.rings-hero'),r=hero.getBoundingClientRect();hero.style.minHeight=hero.style.height=r.height+'px';hero.style.paddingTop=getComputedStyle(hero).paddingTop;hero.querySelector('.copy').style.paddingBottom=getComputedStyle(hero.querySelector('.copy')).paddingBottom;return Math.ceil(r.bottom)+20;});await page.setViewportSize({...viewport,height:captureHeight});await page.waitForTimeout(100);
 await page.evaluate(()=>{const hero=document.querySelector('.rings-hero');for(const el of document.body.querySelectorAll('*'))if(!hero.contains(el)&&!el.contains(hero))el.style.visibility='hidden';window.__rings.freeze(7.8);});await page.addStyleTag({content:'.rings-hero .copy,.rings-hero .rings-controls,.rings-hero .hint,.rings-motion,.rings-hero .grain,.rings-hero .rays,.rings-hero .candles,.rings-hero .vignette{visibility:hidden!important}.rings-hero .rings-poster{display:none!important}'});
 const buffer=await page.locator('.rings-hero').screenshot({animations:'disabled'});let encoded;
 for(const quality of [86,80,74,68,60]){encoded=await sharp(buffer).webp({quality,effort:6}).toBuffer();if(encoded.length<=150000)break;}
 assert(encoded.length<=150000,'Portrait exceeds 150 KB');const file=path.join(output,`rings-poster-${theme}-${format}.webp`);fs.writeFileSync(file,encoded);console.log(path.basename(file),encoded.length);await context.close();
}}finally{await browser.close();}
