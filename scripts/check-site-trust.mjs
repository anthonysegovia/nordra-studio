import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { trustPages } from '../build/site-trust.mjs';
import { resolvePreviewRoute } from '../build/commercial-preview.mjs';
const routes=JSON.parse(readFileSync('vercel.json','utf8')).routes;
export function builtFile(path){
  const route=resolvePreviewRoute(path,'nordrastudio.mx',routes);
  if(route?.status)return builtFile(route.headers.Location);
  const dest=(route?.url||path).split('?')[0];
  const candidates=['dist'+dest,'dist'+dest.replace(/\/$/,'')+'/index.html'];
  return candidates.find(p=>existsSync(p)&&statSync(p).isFile());
}
for(const page of trustPages){
  const html=readFileSync('dist/'+page,'utf8');
  assert.match(html,/<body\b[^>]*>\s*<a class="nordra-skip-link"/,'first focusable: '+page);
  assert.match(html,/<main\b[^>]*tabindex="-1"/);
  for(const [,href] of html.matchAll(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g))assert.ok(builtFile(href),page+': '+href);
  if(page.startsWith('en/'))assert.doesNotMatch(html,/href="\/terminos-del-servicio(?:\.html)?"/);
}
const missing=readFileSync('dist/404.html','utf8');
assert.match(missing,/<meta name="robots" content="noindex/);
assert.doesNotMatch(missing,/rel="canonical"/);
for(const [,href] of missing.matchAll(/href="(\/[^"#]*)"/g))assert.ok(builtFile(href),'404 link '+href);
for(const path of ['/en/','/en/negocios','/en/invitaciones'])assert.ok(builtFile(path));
for(const path of ['/terminos-del-servicio','/en/terminos-del-servicio']){
  const html=readFileSync(builtFile(path),'utf8');
  for(const marker of ['rel="canonical"','hreflang="es-MX"','hreflang="en"','property="og:title"','property="og:description"','property="og:image"','name="twitter:card"'])assert.ok(html.includes(marker),path+': '+marker);
  assert.doesNotMatch(html,/<meta name="robots" content="noindex/);
  assert.doesNotMatch(html,/T\?rminos|Espa\?ol/);
  if(path.startsWith('/en/'))assert.match(html,/<title>Terms of service \| Nordra Studio<\/title>/);
}
const xml=readFileSync('dist/sitemap.xml','utf8');
assert.match(xml,/^<\?xml version="1.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">[\s\S]*<\/urlset>\s*$/);
// Validate the complete deliberately small XML grammar, not just matching URLs.
const inner=xml.slice(xml.indexOf('>',xml.indexOf('<urlset'))+1,xml.indexOf('</urlset>'));
const entries=[...inner.matchAll(/<url><loc>(https:\/\/nordrastudio\.mx\/[a-z/-]*)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)];
assert.ok(entries.length>=20);assert.equal(inner.replace(/<url><loc>https:\/\/nordrastudio\.mx\/[a-z/-]*<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod><\/url>/g,'').trim(),'');
for(const [,url,date] of entries){assert.ok(builtFile(new URL(url).pathname),url);assert.equal(new Date(date).toISOString().slice(0,10),date);}
for(const [name,size] of [['apple-touch-icon.png',180],['favicon-32x32.png',32]]){
  const meta=await sharp('dist/'+name).metadata();assert.equal(meta.width,size);assert.equal(meta.height,size);
}
const ico=readFileSync('dist/favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
for(const [i,size] of [16,32,48].entries()){assert.equal(ico[6+16*i],size);assert.equal(ico[7+16*i],size);}
console.log(`Site trust build: ${trustPages.length} pages, ${entries.length} sitemap URLs, icons and 404 OK`);
