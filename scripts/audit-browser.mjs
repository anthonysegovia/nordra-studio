import {chromium} from 'playwright';
import {preview} from 'vite';
import fs from 'node:fs';
export async function auditBrowser(){
 const server=process.env.MOTION_URL?null:await preview({preview:{host:'127.0.0.1',port:0}});
 const base=process.env.MOTION_URL||server.resolvedUrls.local[0].replace(/\/$/,'');
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 return {browser,base,async close(){await browser.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));}};
}
export function report(name,rows){fs.mkdirSync('documentacion/auditoria-glitches',{recursive:true});fs.writeFileSync(`documentacion/auditoria-glitches/${name}.json`,JSON.stringify(rows,null,2));}
export async function settle(page){await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);}
