import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { trustPages } from '../build/site-trust.mjs';

const output=process.env.CHECK_OUTPUT || 'E:/Nordra Studio/Plataforma/.checks/sitio-confianza';
const origin=process.env.CHECK_ORIGIN || 'http://127.0.0.1:4173';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
  for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    for(const theme of ['light','dark']){
      for(const en of [false,true]){
        const context=await browser.newContext({viewport,colorScheme:'dark',reducedMotion:'reduce'});
        await context.addInitScript(theme=>localStorage.setItem('nordra-theme',theme),theme);
        const page=await context.newPage();
        const response=await page.goto(origin+(en?'/en/':'/')+'ruta-inexistente-confianza',{waitUntil:'networkidle'});
        assert.equal(response.status(),404);
        assert.equal(await page.locator('h1').textContent(),en?"This page doesn't exist":'Esta página no existe');
        assert.equal(await page.locator('html').getAttribute('lang'),en?'en':'es');
        assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),theme==='dark');
        assert.equal(await page.locator('link[rel="canonical"]').count(),0);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        for(const href of await page.locator('main nav a').evaluateAll(els=>els.map(el=>el.getAttribute('href'))))assert.equal((await page.request.get(origin+href)).status(),200,href);
        const name=`404-${en?'en':'es'}-${viewport.width}-${theme}.png`;
        await page.screenshot({path:output+'/'+name,fullPage:true});
        await page.locator('#theme').click();
        assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),theme!=='dark');
        results.push({name,status:response.status(),overflow:false,themeToggle:true});
        await context.close();
      }
      for(const route of ['/','/negocios','/en/','/en/negocios']){
        const context=await browser.newContext({viewport,reducedMotion:'reduce'});
        await context.addInitScript(theme=>{localStorage.setItem('nordra-theme',theme);sessionStorage.setItem('nordra-landscape-entered','true');},theme);
        const page=await context.newPage();await page.goto(origin+route,{waitUntil:'networkidle'});
        await page.keyboard.press('Tab');
        const skip=page.locator('.nordra-skip-link');assert.equal(await skip.evaluate(el=>el===document.activeElement),true,route);
        assert.equal(await skip.textContent(),route.startsWith('/en/')?'Skip to content':'Saltar al contenido');
        const box=await skip.boundingBox(), header=await page.locator('header').first().boundingBox();
        assert.ok(box.x>=0 && box.y>=header.y+header.height,JSON.stringify({route,box,header}));
        const name=`skip-${route.replaceAll('/','-')||'home'}-${viewport.width}-${theme}.png`;
        await page.screenshot({path:output+'/'+name});await page.keyboard.press('Enter');
        assert.equal(await page.locator('main').evaluate(el=>el===document.activeElement),true,route+' target focus');
        results.push({name,skipBounds:box,headerBounds:header,mainFocused:true});
        await context.close();
      }
    }
  }
  const page=await browser.newPage();
  for(const file of trustPages){
    const res=await page.request.get(origin+'/'+file);assert.equal(res.status(),200,file);
    const html=await res.text();
    for(const [,href] of html.matchAll(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)){
      const icon=await page.request.get(origin+href);assert.equal(icon.status(),200,href);assert.match(icon.headers()['content-type'],/image\//);
    }
  }
  await page.goto(origin+'/404.html');
  const xml=await (await page.request.get(origin+'/sitemap.xml')).text();
  const sitemap=await page.evaluate(xml=>{
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    return {valid:!doc.querySelector('parsererror'),urls:[...doc.querySelectorAll('loc')].map(n=>n.textContent)};
  },xml);assert.equal(sitemap.valid,true);
  for(const url of sitemap.urls)assert.equal((await page.request.get(origin+new URL(url).pathname)).status(),200,url);
  // Default stays light even when the operating system requests dark.
  await page.evaluate(()=>localStorage.removeItem('nordra-theme'));await page.emulateMedia({colorScheme:'dark'});await page.reload();
  assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('dark')),false);
  const es=await (await page.request.get(origin+'/terminos-del-servicio')).text();
  const en=await (await page.request.get(origin+'/en/terminos-del-servicio')).text();
  const ids=html=>[...html.matchAll(/<section id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids(es),ids(en));
  for(const theme of ['light','dark']){
    await page.setViewportSize({width:390,height:844});await page.evaluate(theme=>localStorage.setItem('nordra-theme',theme),theme);
    await page.goto(origin+'/en/terminos-del-servicio');await page.screenshot({path:output+`/terms-en-390-${theme}.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  }
  results.push({iconPages:trustPages.length,sitemapXmlValid:true,sitemapResponses:sitemap.urls.length,defaultLight:true,translatedSections:ids(en).length});
  await writeFile(output+'/browser-results.json',JSON.stringify(results,null,2));
  console.log('Site trust browser checks passed: '+results.length+' results');
}finally{await browser.close();}
