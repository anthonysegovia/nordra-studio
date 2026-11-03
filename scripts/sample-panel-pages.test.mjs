import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildInputs } from './check-vercel-build-inputs.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)), inputs=buildInputs(root);
for(const [short,key,title] of [['cumple','birthday','cumpleaños'],['evento','event','eventos']]){
  test('registered sample dashboard: '+key,()=>{
    const page='panel-'+short+'.html',entry='src/'+short+'-panel-main.tsx';
    const html=readFileSync(new URL('../'+page,import.meta.url),'utf8');
    assert.match(html,/name="robots" content="noindex, follow"/);
    assert.ok(html.includes('https://nordrastudio.mx/'+page));
    assert.ok(html.includes('src="/'+entry+'"'));assert.ok(html.includes('Panel de '+title));
    for(const file of [page,entry,'api/wedding-links.js','server/sample-occasions.js',...['es','en'].flatMap(lang=>[760,1280].map(w=>'public/artwork/'+key+'-dashboard-preview/dashboard-'+lang+'-'+w+'.webp'))])assert.ok(inputs.includes(file),file);
  });
}
