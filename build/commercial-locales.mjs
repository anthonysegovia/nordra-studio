import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homeCopy } from '../src/i18n/home.en.mjs';

const origin = 'https://nordrastudio.mx';
const homeTemplate = new URL('../index.html', import.meta.url);
const commercialPath = /^\/(?:estudio|negocios|invitaciones|bodas|cumpleanos|eventos|temporada|aviso-de-privacidad(?:\.html)?)?(?=[?#]|$)/;

export function englishHref(href) {
  if (!commercialPath.test(href)) return href;
  return '/en' + href.replace('/aviso-de-privacidad.html','/aviso-de-privacidad');
}

function languageLinks(en, path) {
  const locales = [['es-MX','ES',path], ['en','EN','/en'+path]];
  return `<span class="locale-switch" role="group" aria-label="${en?'Language':'Idioma'}">${locales.map(([lang,label,href]) =>
    `<a data-language="${lang}" lang="${lang}" hreflang="${lang}" href="${href}" target="_top" aria-label="${lang==='en'?'English':'Español'}"${(lang==='en')===en?' aria-current="true"':''}>${label}</a>`).join('<span aria-hidden="true">·</span>')}</span>`;
}

function translateHome(html) {
  // Translate only whole text nodes and human-readable attributes in our HTML.
  // Inline programs, data attributes, IDs, paths and client quotations stay intact.
  const parts = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi);
  const unchanged = new Set(['Nordra Studio','Sobremesa','Nítida','Valentina y Sebastián','hola@nordrastudio.mx','© 2026 Nordra Studio']);
  function lookup(text) {
    if (Object.hasOwn(homeCopy,text)) return homeCopy[text];
    if (unchanged.has(text) || !/[a-záéíóúñ]/i.test(text) || /^\{\{[\w:]+\}\}$/.test(text)) return text;
    throw Error('Missing English home copy: '+text);
  }
  return parts.map(part => {
    if (part.startsWith('<script')) return part;
    return part.replace(/>([^<>]+)</g, (match,text) => '>'+text.replace(/\S[\s\S]*\S|\S/,lookup)+'<')
      .replace(/\b(alt|aria-label)="([^"]*)"/g, (_,attr,value) => `${attr}="${lookup(value)}"`)
      .replace(/\bhref="([^"]+)"/g, (_,href) => `href="${englishHref(href)}"`);
  }).join('');
}

export function renderLocaleHome(html, en) {
  if (en) {
    html = translateHome(html);
    const description = 'Websites for your business and digital invitations for your celebrations, designed with you in Monterrey, Mexico. Explore the work of Nordra Studio.';
    html = html.replace(/(<meta name="description" content=")[^"]+/, '$1'+description)
      .replace(/(<meta property="og:description" content=")[^"]+/, '$1'+description)
      .replace(/(<meta property="og:title" content=")[^"]+/, '$1Your idea, made into a website or invitation · Nordra Studio')
      .replace('content="es_MX"', 'content="en_US"')
      .replace(/(<meta property="og:url" content=")[^"]+/, '$1'+origin+'/en/')
      .replace(/"url":"https:\/\/nordrastudio.mx\/"/, '"url":"'+origin+'/en/"')
      .replace(/(href="https:\/\/wa.me\/\d+\?text=)[^"]+"/g, (_,base)=>base+encodeURIComponent("Hi, Nordra. I'd like to talk about an idea I have.")+'"')
      .replace(/(<a class="signature-work"[^>]*>[\s\S]*?<\/h3>)/g, '$1<small class="demo-language">Demo in Spanish</small>');
  }
  const lang = en ? 'en' : 'es-MX';
  const links = languageLinks(en,'/');
  const pageSchema = JSON.stringify({
    '@context':'https://schema.org','@type':'WebPage',inLanguage:lang,
    url:origin+(en?'/en/':'/'),name:en?homeCopy['Nordra Studio · Diseño web e invitaciones digitales']:'Nordra Studio · Diseño web e invitaciones digitales',
    about:{'@id':origin+'/#negocio'}
  });
  html = html.replace('</head>',`<script type="application/ld+json">${pageSchema}</script></head>`);
  html = html.replace(/<html lang="[^"]+"/, '<html lang="'+lang+'"')
    .replace(/<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${origin}${en?'/en/':'/'}"><link rel="alternate" hreflang="es-MX" href="${origin}/"><link rel="alternate" hreflang="en" href="${origin}/en/"><link rel="alternate" hreflang="x-default" href="${origin}/">`)
    .replace('<div class="header-actions">','<div class="header-actions">'+links)
    .replace('<button id="local-motion-toggle"',links+'<button id="local-motion-toggle"');
  if (!en) html = html.replace('</header>', '</header><aside class="locale-suggestion" lang="en" aria-label="Language suggestion" hidden><a href="/en/" hreflang="en" data-language="en" target="_top">View this page in English?</a><button type="button" aria-label="Dismiss language suggestion">×</button></aside>');
  return html;
}

export function commercialLocales() {
  return {
    name:'nordra-commercial-locales',
    transformIndexHtml:{order:'pre',handler(html,ctx){
      if (ctx.path === '/en/index.html' || ctx.path === '/en/') return renderLocaleHome(readFileSync(homeTemplate,'utf8'),true);
      if (ctx.path === '/index.html' || ctx.path === '/') return renderLocaleHome(html,false);
    }},
    handleHotUpdate({file,server}) {
      if(file === fileURLToPath(homeTemplate)) server.ws.send({type:'full-reload'});
    }
  };
}
