import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';

const html=readFileSync('dist/invitaciones/camila-30/index.html','utf8');
const modules=new Set();
function visit(file){
  if(modules.has(file))return;
  modules.add(file);
  const js=readFileSync(path.join('dist/assets',file),'utf8');
  for(const match of js.matchAll(/["'](?:\.\/|\/assets\/)([\w.-]+\.js)["']/g))visit(match[1]);
}
for(const found of html.matchAll(/(?:src|href)="\/assets\/([\w.-]+\.js)"/g))visit(found[1]);
assert.ok([...modules].some(name=>name.startsWith('three-')));
assert.ok([...modules].some(name=>name.startsWith('personal-rsvp-')));
assert.doesNotMatch(html,/<(?:link|script)\b[^>]+(?:href|src)="[^"]*\/(?:scene|three)-[^"]+\.js"/);
const size=[...modules].reduce((sum,file)=>sum+gzipSync(readFileSync(path.join('dist/assets',file))).length,0);
assert.ok(size<=250000,'Birthday JavaScript exceeds 250 kB gzip: '+size);
console.log('Number invitation, including Three and personal RSVP: '+size+' bytes gzip ('+modules.size+' modules)');
