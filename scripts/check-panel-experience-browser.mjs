// Run after npm run build. The fixture intercepts both APIs and never contacts a client panel.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { samplePanelFixture } from './sample-panel-fixture.mjs';
import { preview } from 'vite';
import { sampleInvitations, invitationLink } from '../server/wedding-links.js';
import { sampleBoreal } from '../server/wedding-boreal.js';

const server=await preview({preview:{host:'127.0.0.1',port:5478,strictPort:true}});
const origin='http://127.0.0.1:5478';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
async function panel({plan,admin=false,archived=false,width=390,english=false,noStorage=false}={}){
  const page=await browser.newPage({viewport:{width,height:812},isMobile:width<761,reducedMotion:'reduce'});
  page.on('pageerror',e=>console.error(e.message));
  await page.addInitScript(({english,noStorage})=>{
    localStorage.setItem('nordra-language',english?'en':'es');
    if(noStorage)Object.defineProperty(window,'localStorage',{get(){throw Error('Unavailable')}});
  },{english,noStorage});
  const event={id:'fixture-event',plan,couple:'Pareja local',eventDate:'2027-06-19',city:'Ciudad de México',invitationPath:'/invitaciones/valentina-y-sebastian/',coverPath:'',replyUntil:null,expiresAt:'2027-09-18T00:00:00Z',archived};
  const invitations=sampleInvitations().map(i=>({...i,link:invitationLink(origin,event.id,i.id,'local-only')}));
  const boreal=sampleBoreal(invitations), calls=[];
  boreal.tables.push({id:'table-prueba',name:'Prueba',capacity:2});
  const snapshot={workspaceId:event.id,invitations,boreal,version:1,management:{delivery:{[invitations[1].id]:{sentAt:new Date().toISOString()}},history:[],trash:[]},...(plan?{event}:{})};
  await page.route('**/api/**',async route=>{
    const data=route.request().postDataJSON();calls.push(data);
    assert.equal(new URL(route.request().url()).pathname,plan?'/api/weddings':'/api/wedding-links');
    if(data.action==='session')return route.fulfill({json:{signedIn:true,events:[event]}});
    if(plan){assert.equal(data.eventId,event.id);assert.equal(data.admin,admin)}
    if(data.action==='seat-assign'){
      assert.equal(data.version,snapshot.version);assert(data.personIds.length<=2);
      data.personIds.forEach(id=>boreal.seats[id]=data.tableId);snapshot.version++;
    }else assert.equal(data.action,'load');
    await route.fulfill({json:snapshot});
  });
  await page.goto(origin+(plan?'/mi-boda.html'+(admin?'?boda=fixture-event&admin=1':''):'/panel-boda.html'));
  await page.locator('.ledger-row').first().waitFor();return {page,calls,invitations};
}
try{
  const {page:p,calls,invitations}=await panel();
  const guide=p.locator('.sample-guide');
  await guide.getByRole('button',{name:'Siguiente'}).click();assert.match(await guide.innerText(),/Confirma como invitado/);
  await guide.getByRole('button',{name:'Siguiente'}).click();await p.keyboard.press('Escape');
  assert.equal(await guide.count(),0);await p.reload();await p.locator('.ledger-row').first().waitFor();assert.equal(await guide.count(),0);
  await p.getByRole('button',{name:'Ver guía',exact:true}).click();await p.keyboard.press('Escape');
  assert((await p.locator('.ledger-row').first().boundingBox()).y<812);
  await p.getByRole('button',{name:'⋯ Más'}).click();assert(await p.getByRole('button',{name:'Descargar lista'}).isVisible());
  await p.keyboard.press('Escape');
  await p.locator('.ledger-stat').first().click();assert.equal(await p.locator('.ledger-stat').first().getAttribute('aria-pressed'),'true');
  await p.locator('.ledger-stat').first().click();assert.equal(await p.locator('.ledger-stat').first().getAttribute('aria-pressed'),'false');
  assert.equal(await p.getByLabel('Mostrar',{exact:true}).count(),0);await p.getByRole('button',{name:'Filtros (0)'}).click();
  await p.locator('dialog[open]').getByRole('button',{name:/Parciales/i}).click();await p.keyboard.press('Escape');
  assert(await p.getByRole('button',{name:'Filtros (1)'}).isVisible());
  await p.locator('.panel-tasks button').first().click();const reminder=p.locator('.ledger-row-actions a').first();
  assert(new URL(await reminder.getAttribute('href')).searchParams.get('text').includes(invitations[1].link));
  await reminder.evaluate(el=>el.addEventListener('click',e=>e.preventDefault(),{once:true}));
  await reminder.click();await p.locator('dialog[open] .record-delivery').waitFor();assert(calls.every(c=>c.action==='load'));await p.keyboard.press('Escape');
  await p.getByRole('button',{name:'Mesas',exact:true}).click();const individual=p.locator('.boreal-seating-group').filter({hasText:'Mariana López'});
  assert.equal((await individual.innerText()).split('Mariana López').length,2);
  await p.locator('.boreal-table-card').filter({hasText:'Prueba'}).getByRole('button',{name:'Agregar invitados'}).click();
  const picker=p.locator('.seat-picker'),people=picker.locator('fieldset input');for(let i=0;i<3;i++)await people.nth(i).check();
  const seat=picker.getByRole('button',{name:/Sentar en Prueba/});assert(await seat.isDisabled());
  await people.nth(2).uncheck();await seat.click();await picker.waitFor({state:'detached'});assert(calls.some(c=>c.action==='seat-assign'));
  await p.getByRole('button',{name:'Recepción',exact:true}).click();assert.equal(await p.locator('.boreal-reception .boreal-filters select').inputValue(),'waiting');
  const section=p.locator('.boreal-reception');assert(await section.evaluate(e=>!!(e.querySelector('.boreal-scanner').compareDocumentPosition(e.querySelector('input[type=search]'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  await p.close();
  for(const options of [{plan:'Aurora'},{plan:'Boreal',admin:true,archived:true},{english:true,noStorage:true}]){
    const {page}=await panel(options);
    if(options.plan){assert.equal(await page.locator('.guide-trigger,.sample-guide').count(),0);assert.equal(await page.getByRole('button',{name:'Mesas',exact:true}).count(),options.plan==='Boreal'?1:0);if(options.archived)assert.equal(await page.locator('.ledger-add').count(),0)}
    else{await page.locator('.sample-guide').waitFor();await page.keyboard.press('Escape')}
    await page.close();
  }
  for (const [kind,slug,back,brand] of [['cumple','sofia-25','cumpleanos','Sofía 25'],['evento','conexion-27','eventos','Conexión 27']]) {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,reducedMotion:'reduce'});
    await context.route('**/api/wedding-links',samplePanelFixture(origin));
    const dashboard=await context.newPage();
    await dashboard.goto(origin+'/panel-'+kind+'.html');
    await dashboard.locator('.ledger-row').first().waitFor();
    assert.equal(await dashboard.locator('h1').innerText(),brand);
    await dashboard.keyboard.press('Escape');
    assert.doesNotMatch(await dashboard.locator('body').innerText(),/\bboda[s]?\b|Valentina/i);
    const personal=await dashboard.locator('.workspace-quick-links a').last().getAttribute('href');
    assert.equal(new URL(personal).pathname,'/invitaciones/'+slug+'/');
    const guest=await context.newPage();await guest.goto(personal);
    await guest.locator('[data-skip]').click();
    await guest.locator('.celebration-rsvp select').selectOption('1');
    await guest.locator('#guest').fill('Andrea Local');
    await guest.locator('[value=yes]').check();
    await guest.locator('.celebration-rsvp [type=submit]').click();
    await guest.getByText('Tu respuesta ya está en el panel de muestra.').waitFor();
    await dashboard.reload();await dashboard.getByText('Andrea Local',{exact:true}).first().waitFor({state:'attached'});
    await dashboard.locator('.workspace-topbar button').click();
    assert.match(await dashboard.locator('.workspace-topbar').innerText(),/Your (birthday|event) space/);
    for(const label of ['Tables','Reception']){
      await dashboard.getByRole('button',{name:label,exact:true}).first().click();
      assert.doesNotMatch(await dashboard.locator('body').innerText(),/\bwedding[s]?\b|Valentina/i);
    }
    await dashboard.goto(origin+'/en/'+back+'#'+back+'-panel-muestra');
    const image=dashboard.locator('.wedding-dashboard img');await image.evaluate(i=>i.decode());
    assert.match(await image.getAttribute('src'),/dashboard-en-/);
    await context.close();
  }
  console.log('Panel experience: three public samples, personal RSVP round trips, private Aurora, archived Boreal, keyboard, capacity and manual reminders passed.');
}finally{await browser.close();await server.close()}
