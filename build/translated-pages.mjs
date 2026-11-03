import { readFileSync } from 'node:fs';
import { homeCopy } from '../src/i18n/home.en.mjs';
import { englishHref, localeChrome } from './commercial-locales.mjs';

export const translatedPages = ['estudio','negocios','invitaciones','bodas','cumpleanos','eventos','temporada','aviso-de-privacidad'];
const legal = 'aviso-de-privacidad';
const origin = 'https://nordrastudio.mx';
const dictionaries = Object.assign({}, ...translatedPages.map(page =>
  JSON.parse(readFileSync(new URL('../src/i18n/'+page+'.en.json',import.meta.url),'utf8'))), homeCopy);
const money = /\$[\d,]+(?:\.\d+)?/g;
const decode = text => text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const esc = text => text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

function copy(text) {
  const key = decode(text.trim()).replace(money,'{price}');
  if (!key || !/[a-záéíóúñ]/i.test(key) || /^(?:https?:|[\w.-]+@[\w.-]+$)/.test(key)) return text;
  const value = dictionaries[key];
  if (value === undefined) throw Error('Missing English copy: '+key);
  const prices = text.match(money) || [];
  let i = 0;
  const result = value.replaceAll('{price}',()=>prices[i++]);
  if (i !== prices.length) throw Error('Price count differs: '+key);
  return text.replace(/\S[\s\S]*\S|\S/,()=>result);
}

function link(href) {
  href = decode(href);
  if(href.startsWith('mailto:') && href.includes('?')){
    const url=new URL(href);
    if(url.searchParams.has('body')){
      url.searchParams.set('subject','My website project · Nordra Studio');
      url.searchParams.set('body','Hi, I’d like to talk about a website for my business.\nMy business is…');
    }else if(url.searchParams.get('subject')==='Solicitud sobre datos personales'){
      url.searchParams.set('subject','Personal data request');
    }
    return url.href.replaceAll('+','%20');
  }
  if(href.startsWith('https://wa.me/')){
    const url = new URL(decode(href));
    const message = url.searchParams.get('text');
    if(message)url.search='?text='+encodeURIComponent(copy(message));
    return url.href;
  }
  if(href.startsWith(origin+'/'))return origin+englishHref(href.slice(origin.length));
  return englishHref(href);
}

function translateSchema(value,key='') {
  if(Array.isArray(value))return value.map(item=>translateSchema(item,key));
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,translateSchema(v,k)]));
  if(typeof value!=='string')return value;
  if(key==='url')return link(value);
  if(['name','description','serviceType','text'].includes(key))return copy(value);
  return value; // IDs, offer amounts, ratings and authorized review bodies are language-independent.
}

function translateInline(script) {
  if(!script.includes('const studioView='))return script;
  // These legacy handlers normalize commercial URLs and menu labels after page load.
  return script.replace(/(["'])(\/(?:invitaciones|negocios|estudio|bodas|cumpleanos|eventos|temporada|)(?=["'#?]))/g,'$1/en$2')
    .replaceAll("'Abrir menú'","'Open menu'").replaceAll("'Cerrar menú'","'Close menu'");
}

function renderEnglish(html,page) {
  const parts=html.split(/(<(?:script|style|blockquote)\b[^>]*>[\s\S]*?<\/(?:script|style|blockquote)>)/gi);
  let translated=parts.map(part=>{
    if(part.startsWith('<blockquote'))return part.replace('<blockquote>','<blockquote lang="es-MX">');
    if(part.startsWith('<style'))return part;
    if(part.startsWith('<script')){
      if(!part.includes('type="application/ld+json"'))return translateInline(part);
      return part.replace(/>([\s\S]+)<\/script>$/,(_,json)=>'>'+JSON.stringify(translateSchema(JSON.parse(json))).replaceAll('<','\\u003c')+'</script>');
    }
    return part.replace(/>([^<>]+)</g,(_,text)=>'>'+esc(copy(text))+'<')
      .replace(/\b(alt|aria-label|placeholder|data-offer-name|data-live-try|title)="([^"]*)"/g,(_,attr,text)=>attr+'="'+esc(copy(text))+'"')
      .replace(/(<meta (?:name="description"|property="og:(?:title|description)") content=")([^"]+)"/g,(_,start,text)=>start+esc(copy(text))+'"')
      .replace(/\bhref="([^"]*)"/g,(_,href)=>'href="'+esc(link(href))+'"')
      .replace('content="es_MX"','content="en_US"')
      .replace(/(<meta property="og:url" content=")([^"]+)"/g,(_,start,url)=>start+link(url)+'"');
  }).join('');
  // Use a separate label; click handlers can update a button's first text node.
  translated=translated.replace(/<a\b([^>]*href="\/(?:demos\/|invitaciones\/|panel-boda\.html)[^"]*"[^>]*)>([\s\S]*?)<\/a>/g,
    (all,attrs,body)=>{
      const isInvitation = page==='invitaciones' && /href="\/invitaciones\/(?:valentina-y-sebastian|spooky-party)\//.test(attrs);
      return `<a${attrs}>${body}<small class="demo-language">${isInvitation?'Invitation in Spanish':'Demo in Spanish'}</small></a>`;
    });
  translated=translated.replaceAll('/artwork/wedding-dashboard-preview/dashboard-v3-es-','/artwork/wedding-dashboard-preview/dashboard-v3-en-');
  if(page===legal)translated=translated.replace(/(<h1>[^<]+<\/h1>)/,'$1<p class="translation-note">This is a translation for convenience; the Spanish version is the legally binding one.</p>')
    .replace("'Activar tema claro' : 'Activar tema oscuro'","'Switch to light mode' : 'Switch to dark mode'");
  return translated;
}

function pageFor(path) {
  const name=path.replace(/^\/(?:en\/)?/,'').replace(/(?:\/index)?\.html$/,'').replace(/\/$/,'');
  return translatedPages.includes(name)?name:null;
}

export function loadLocaleTemplate() {
  return {name:'nordra-shared-page-templates',transformIndexHtml:{order:'pre',handler(html,ctx){
    const page=pageFor(ctx.path);
    if(!page)return;
    if(page===legal)return readFileSync(new URL('../public/'+legal+'.html',import.meta.url),'utf8');
    if(ctx.path.startsWith('/en/'))return readFileSync(new URL('../'+page+'.html',import.meta.url),'utf8');
  }}};
}

// Runs after the commercial partials have expanded prices, FAQ, schema and contact links.
export function translatedPageOutput() {
  return {name:'nordra-page-locales',transformIndexHtml:{order:'pre',handler(html,ctx){
    const page=pageFor(ctx.path);
    if(!page)return;
    const en=ctx.path.startsWith('/en/');
    if(en)html=renderEnglish(html,page);
    if(page===legal)html=html.replace('<link rel="stylesheet" href="/privacy.css">','').replace('</body>','<script type="module" src="/src/site/entries/privacy.js"></script></body>');
    return localeChrome(html,en,'/'+page);
  }}};
}
