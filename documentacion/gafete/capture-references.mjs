import {chromium} from 'playwright';
import {createServer} from 'vite';
import fs from 'node:fs';
import {localServer} from './local-server.mjs';
fs.mkdirSync('documentacion/gafete/referencias',{recursive:true});
const server=await createServer({server:{host:'127.0.0.1',port:5601}});await server.listen();
const staticServer=await localServer(5602);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 for(const [name,route,control]of [['caja','/invitaciones/camila-30/','[data-skip]'],['posada','/demos/posada-pinata/','#open-invitation'],['mansion','/demos/halloween-mansion/','#open']]){
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.goto((name==='caja'?server.resolvedUrls.local[0].replace(/\/$/,''):'http://127.0.0.1:5602')+route);await page.evaluate(()=>document.fonts.ready);
  if(await page.locator(control).isVisible())await page.locator(control).click();
  await page.waitForTimeout(1200);if(name==='mansion'){for(const candle of await page.locator('.lantern').all()){await candle.click();await page.waitForTimeout(200);}} await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`documentacion/gafete/referencias/${name}-1440.png`,fullPage:true});
  console.log(name,await page.evaluate(()=>({height:document.documentElement.scrollHeight,title:document.title})));await page.close();
 }
}finally{await browser.close();await server.close();await new Promise(resolve=>staticServer.close(resolve));}

