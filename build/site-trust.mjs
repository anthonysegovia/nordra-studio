import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

export const commercialPages = ['index.html', 'estudio.html', 'negocios.html', 'invitaciones.html', 'bodas.html', 'cumpleanos.html', 'eventos.html', 'temporada.html'];
export const trustPages = [...commercialPages, ...commercialPages.map(p => 'en/'+p), 'aviso-de-privacidad/index.html', 'aviso-de-privacidad.html', 'en/aviso-de-privacidad.html', 'terminos-del-servicio.html', 'en/terminos-del-servicio.html', '404.html'];
export const iconLinks = '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">';
const skipStyle = readFileSync(new URL('../public/site-trust.css',import.meta.url),'utf8');

export function enhancePage(html, page) {
  const en = page.startsWith('en/');
  html = html.replace(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/g, '').replace('</head>', iconLinks+'<style data-site-trust>'+skipStyle+'</style></head>');
  if(en) html = html.replace(/href="\/terminos-del-servicio(?:\.html)?"/g, 'href="/en/terminos-del-servicio"');
  // Keep an existing target, or give the main landmark a stable focus target.
  let target;
  html = html.replace(/<main\b([^>]*)>/, (_, attrs) => {
    target = /\bid="([^"]+)"/.exec(attrs)?.[1] || 'nordra-content';
    return '<main'+attrs+(/\bid=/.test(attrs)?'':` id="${target}"`)+(/\btabindex=/.test(attrs)?'':' tabindex="-1"')+'>';
  });
  if (!target) throw Error('Missing main landmark: '+page);
  html = html.replace(/<a\b[^>]*class="[^"]*\bskip-link\b[^"]*"[^>]*>[\s\S]*?<\/a>/g, '');
  return html.replace(/<body\b[^>]*>/, '$&'+`<a class="nordra-skip-link" href="#${target}">${en?'Skip to content':'Saltar al contenido'}</a>`);
}

export function lastModified(files, fallback = new Date().toISOString().slice(0,10)) {
  try {
    const date = execFileSync('git', ['log','-1','--format=%cs','--',...files], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback;
  } catch { return fallback; }
}

export function sitemapSource(path) {
  const en = path.startsWith('/en/'), name = path.replace(/^\/(?:en\/)?/,'') || 'index';
  if(name==='terminos-del-servicio') return [en?'public/en/terminos-del-servicio.html':'public/terminos-del-servicio.html'];
  if(name==='aviso-de-privacidad') return ['public/aviso-de-privacidad.html', ...(en?['src/i18n/aviso-de-privacidad.en.json']:[])];
  return [name+'.html', ...(en?[name==='index'?'src/i18n/home.en.mjs':`src/i18n/${name}.en.json`]:[])];
}

export function siteTrust() {
  let out;
  return { name:'nordra-site-trust', apply:'build', enforce:'post',
    configResolved(config){out=resolve(config.root,config.build.outDir);},
    writeBundle(){
      for(const page of trustPages){
        const file=resolve(out,page);
        if(!existsSync(file)) throw Error('Missing trust page: '+page);
        writeFileSync(file,enhancePage(readFileSync(file,'utf8'),page));
      }
      const source=readFileSync('public/sitemap.xml','utf8');
      const xml=source.replace(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>[^<]+<\/lastmod>)?\s*<\/url>/g,(_,url)=>`<url><loc>${url}</loc><lastmod>${lastModified(sitemapSource(new URL(url).pathname))}</lastmod></url>`);
      writeFileSync(resolve(out,'sitemap.xml'),xml);
    }
  };
}
