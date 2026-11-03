// Build and serve the site first. Reuses the actual light cover at 390 x 844, DPR 2.
// node scripts/capture-celebration-covers.mjs --url http://127.0.0.1:5502 --tools <package.json with Playwright>
// FFmpeg must be on PATH. No capture-only styles or runtime hooks are injected.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {parseArgs} from 'node:util';
import {spawnSync} from 'node:child_process';
const {values}=parseArgs({options:{url:{type:'string',default:'http://127.0.0.1:5502'},tools:{type:'string'},chrome:{type:'string',default:'C:/Program Files/Google/Chrome/Application/chrome.exe'},output:{type:'string',default:'public/artwork/invitation-covers'},evidence:{type:'string',default:'review/celebration-covers'}}});
const require=createRequire(values.tools?path.resolve(values.tools):import.meta.url);
const {chromium}=require('playwright');
fs.mkdirSync(values.output,{recursive:true});fs.mkdirSync(values.evidence,{recursive:true});
const browser=await chromium.launch({executablePath:values.chrome,headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce',colorScheme:'dark'});
 await context.addInitScript(()=>localStorage.setItem('nordra-theme','light'));
 for(const slug of ['camila-30','conexion-27']){
  const page=await context.newPage();await page.goto(`${values.url}/invitaciones/${slug}/`);await page.evaluate(()=>document.fonts.ready);await page.locator(slug==='camila-30'?'.gift img':'.cover-art img').evaluate(img=>img.decode());
  assert.equal(await page.locator('body').getAttribute('data-phase'),'closed');assert.equal(await page.locator('.celebration-header').isVisible(),false);
  const png=path.join(values.evidence,`${slug}.png`),webp=path.join(values.output,`${slug}.webp`);
  await page.screenshot({path:png});
  const birthday=slug==='camila-30';
  for(const width of birthday?[390,780]:[780]){
    const output=birthday?path.resolve(values.output,'../birthday-noche',`camila-portada-${width}.webp`):webp;
    fs.mkdirSync(path.dirname(output),{recursive:true});
    const result=spawnSync('ffmpeg',['-y','-i',png,'-vf',`scale=${width}:-1`,'-c:v','libwebp','-quality','86',output],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);console.log(output);
  }
  await page.close();
 }
 await context.close();
}finally{await browser.close();}
