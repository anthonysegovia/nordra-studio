import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='review/auroras/composicion', results=[];
const browser=await chromium.launch({channel:'chrome'});
try{for(const version of (process.argv[2]||'nueva,anterior,publicada').split(',')){
 for(const lang of ['es','en'])for(const width of [1440,375])for(const theme of version==='nueva'?['dark','light']:['dark']){
 const page=await browser.newPage({viewport:{width,height:width===375?812:900},locale:lang==='es'?'es-MX':'en-US'});
 await page.addInitScript(()=>{sessionStorage.setItem('nordra-landscape-entered','true');window.pose={t:60,x:0}});
 if(width===1440)await page.route('**/assets/landscape-scene-*.js',async route=>{
   const response=await route.fetch(),body=await response.text();
   const anchor=body.match(/(\w+)=(\w+)\.domElement;\1\.setAttribute\("aria-hidden","true"\)/);assert.ok(anchor);
   const helper=`{const r=${anchor[2]},draw=r.render;r.render=function(scene,camera){if(scene.isScene){scene.traverse(o=>{const u=o.material?.uniforms;if(u?.time)u.time.value=window.pose.t;if(u?.pulse)u.pulse.value=1;if(u?.pulseCenter)u.pulseCenter.value=window.pose.x});window.renderedPose=window.pose.t+','+window.pose.x;}return draw.call(this,scene,camera)}}`;
   await route.fulfill({response,body:body.replace(anchor[0],anchor[1]+'='+anchor[2]+'.domElement;'+helper+';'+anchor[1]+'.setAttribute("aria-hidden","true")')});
 });
 const port={nueva:5282,anterior:5281,publicada:5277}[version];
 await page.goto('http://127.0.0.1:'+port+(lang==='en'?'/en/':'/')+'?theme='+theme+'&nieve=0');
 await page.evaluate(()=>document.fonts.ready);
 if(width===1440) await page.waitForSelector('.horizon-landscape.has-scene');
 await page.waitForTimeout(700);
 const name=[version,lang,theme,width].join('-');
 await page.screenshot({path:dir+'/'+name+'.png'});
 if(version==='nueva'){
 const selectors=['.horizon-intro','.horizon-ending','.horizon-offer','.horizon-detail','.horizon-button'];
 const boxes=await page.evaluate(selectors=>selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map(el=>{
   const r=document.createRange();r.selectNodeContents(el);return {selector,color:getComputedStyle(el).color,rects:[...r.getClientRects()].map(v=>[v.left,v.top,v.right,v.bottom])};
 })),selectors);
 // Identify glyph interiors by rendering the same frozen frame with white and black ink.
 const ink=selectors.flatMap(sel=>[sel,sel+' *']).join(',');
 const inkStyle=color=>ink+'{color:'+color+'!important;-webkit-text-fill-color:'+color+'!important;text-shadow:none!important;transition:none!important}';
 const masks=[];
 for(const color of ['white','black']){
   const style=await page.addStyleTag({content:inkStyle(color)});
   masks.push((await page.screenshot()).toString('base64'));
   await style.evaluate(el=>el.remove());
 }
 await page.evaluate(async masks=>{
   const pixels = await Promise.all(masks.map(async png=>{
     const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return g.getImageData(0,0,c.width,c.height).data;
   }));
   window.glyphMask=Uint8Array.from({length:pixels[0].length/4},(_,i)=>pixels[0][4*i]-pixels[1][4*i]>175);
 },masks);
 await page.addStyleTag({content:ink+'{color:transparent!important;-webkit-text-fill-color:transparent!important;transition:none!important}.horizon-button svg{visibility:hidden!important}'});
 const values={},where={};
 const poses=width===1440 && theme==='dark'?[60,65,69,73,77,81,85,90,94,100,108,115,120].flatMap(t=>[-55,-27.5,0,27.5,55].map(x=>({t,x}))):[{t:60,x:0}];
 for(const pose of poses){
   if(width===1440){await page.evaluate(p=>window.pose=p,pose);await page.waitForFunction(p=>window.renderedPose===p.t+','+p.x,pose)}
   const png=(await page.screenshot()).toString('base64');
   const contrast=await page.evaluate(async({png,boxes})=>{
     const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
     const transfer=Array.from({length:256},(_,i)=>{const a=i/255;return a<.04045?a/12.92:((a+.055)/1.055)**2.4});
     const lum=(r,g,b)=>.2126*transfer[r]+.7152*transfer[g]+.0722*transfer[b];
     const out={};for(const {selector,color,rects} of boxes){let min=21,fg=lum(...color.match(/\d+/g).map(Number));for(const [l,t,r,b] of rects)for(let y=Math.max(0,Math.ceil(t)+1);y<Math.min(c.height,b-1);y++)for(let x=Math.max(0,Math.ceil(l)+1);x<Math.min(c.width,r-1);x++){if(!window.glyphMask[y*c.width+x])continue;const i=4*(y*c.width+x),bg=lum(data[i],data[i+1],data[i+2]);min=Math.min(min,(Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05))}out[selector]=Math.min(out[selector]??21,min)}return out;
   },{png,boxes});
   for(const [key,val] of Object.entries(contrast))if(val<(values[key]??22)){values[key]=val;where[key]=pose;}
 }
 results.push({lang,width,theme,values,where});console.log(name,values);
 await fs.writeFile(dir+'/contraste.json',JSON.stringify(results,null,2));
 }
 await page.close();
 }}
}finally{await browser.close()}