import fs from 'node:fs';import path from 'node:path';import {gzipSync} from 'node:zlib';import assert from 'node:assert/strict';
const html=fs.readFileSync('dist/invitaciones/conexion-27/index.html','utf8'),files=new Set();
function visit(file){if(files.has(file))return;files.add(file);const js=fs.readFileSync(path.join('dist/assets',file),'utf8');assert.doesNotMatch(file,/^three-/);for(const m of js.matchAll(/["'](?:\.\/|\/assets\/)([\w.-]+\.js)["']/g))visit(m[1]);}
for(const m of html.matchAll(/(?:src|href)="\/assets\/([\w.-]+\.js)"/g))visit(m[1]);
assert.ok(files.size);assert.ok([...files].some(f=>f.startsWith('personal-rsvp-')));const bytes=[...files].reduce((n,f)=>n+gzipSync(fs.readFileSync('dist/assets/'+f)).length,0);assert.ok(bytes<=120000,`Gafete JavaScript: ${bytes} bytes gzip`);console.log(JSON.stringify({gafeteGzipBytes:bytes,limit:120000,modules:[...files]},null,2));
