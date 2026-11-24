import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = new URL('../review/precios-invitaciones/', import.meta.url);
mkdirSync(out, {recursive:true});
const server = await preview({preview:{host:'127.0.0.1',port:0,open:false}});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
 for(const width of [1440,390]) for(const theme of ['light','dark']) for(const route of ['bodas','invitaciones','temporada']) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  // Keep verification offline, including analytics and external embeds.
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const page=await context.newPage();
  await page.goto(`${server.resolvedUrls.local[0]}${route}?theme=${theme}&motion=paused`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const selector={bodas:'#bodas-planes-eventos',invitaciones:'#planes-invitaciones',temporada:'#temporada-planes'}[route];
  const section=page.locator(selector);
  await page.setViewportSize({width, height:Math.max(1000, Math.ceil(await section.evaluate(el=>el.getBoundingClientRect().height))+250)});
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await section.locator('.invite-card').count(),route==='temporada'?2:3);
  const metrics=await section.locator('.invite-card').evaluateAll(cards=>cards.map(card=>({width:card.getBoundingClientRect().width,overflow:card.scrollWidth>card.clientWidth+1,x:card.getBoundingClientRect().x})));
  assert.ok(metrics.every(m=>!m.overflow && m.x>=0 && m.x+m.width<=width+1),JSON.stringify({route,width,theme,metrics}));
  await section.screenshot({path:fileURLToPath(new URL(`${route}-${width}-${theme}.png`,out))});
  results.push({route,width,theme,metrics});
  await context.close();
 }
 writeFileSync(new URL('verificacion.json',out),JSON.stringify(results,null,2));
 console.log('12 capturas verificadas en '+out.pathname);
} finally {await browser.close();await server.httpServer.close();}
