import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {ShaderChunk, REVISION} from 'three';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('heroes locales: módulos diferidos, recursos completos y ninguna CDN',()=>{
 for(const [entry,hero]of [['business','vitrina'],['invitations','sobre']]){
  assert.match(read(`src/site/entries/${entry}.js`),new RegExp(`loadHero\\(\\(\\) => import\\('..\/heroes\/${hero}.js'\\)\\)`));
  const source=read(`src/site/heroes/${hero}.js`)+read(`src/site/heroes/${hero}.css`);
  assert.doesNotMatch(source,/cdnjs|jsdelivr|unpkg|qrcode-generator|three\/addons/);
  for(const [,asset]of source.matchAll(/\/nordra\/v550\/assets\/([\w.-]+\.(?:jpg|webp|svg))/g))assert.ok(existsSync(new URL('../public/nordra/v550/assets/'+asset,import.meta.url)),asset);
 }
 const files=readdirSync(new URL('../public/nordra/v550/assets/',import.meta.url),{withFileTypes:true});
 assert.ok(files.every(f=>f.isFile()&&!f.name.endsWith('.png')));
 for(const name of ['bodas','cumple','eventos'])for(const suffix of ['.mp4','-0.jpg'])assert.ok(files.some(f=>f.name==='apertura-'+name+suffix));
 assert.match(read('src/site/heroes/sobre.js'),/import\('qrcode'\)/);
});
test('contrato Three r181 utilizado por los shaders personalizados',()=>{
 assert.equal(REVISION,'181');
 assert.match(ShaderChunk.map_fragment,/texture2D\( map, vMapUv \)/);
 assert.match(ShaderChunk.uv_pars_fragment,/#ifdef USE_ALPHAMAP[\s\S]*vAlphaMapUv/);
 assert.ok(ShaderChunk.colorspace_fragment);
});
test('quieto evita el vuelo y los videos; texto visible antes de cargar el motor',()=>{
 assert.match(read('src/site/heroes/shared.js'),/if \(stillMode\(\)\) return/);
 assert.match(read('src/site/heroes/shared.js'),/saveData/);
 assert.match(read('src/site/heroes/sobre.js'),/if\(!vids\[k\]&&!still\)/);
 const loader=read('src/site/heroes/load.js');assert.match(loader,/max-width:860px/);assert.match(loader,/requestIdleCallback\(run, \{ timeout: 600 \}\)/);assert.doesNotMatch(loader,/addEventListener\('load'/);
 for(const page of ['negocios','invitaciones'])assert.match(read(page+'.html'),/<section class="hero nordra-hero"[\s\S]*?<h1[\s\S]*?class="cta"/);
 const vitrina=read('src/site/heroes/vitrina.js');assert.equal((vitrina.match(/lcp:'/g)||[]).length,2);assert.match(vitrina,/lcp:'0.9'/);assert.match(vitrina,/lcp:'1.2'/);
});
