import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Evaluate the scalar portion of the actual vertex shader at its luminous foot (v=0).
// This catches regressions in the bends as well as in the lower elevation bound.
const shader = readFileSync(new URL('../src/site/landscape/curtain.vert',import.meta.url),'utf8');
const start = shader.indexOf('float u =');
const end = shader.indexOf('vec3 base =',start);
assert.ok(start >= 0 && end > start);
const foot = new Function('uv','time','seed','eye',`
  const {sin,cos,sqrt}=Math;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), step=(edge,x)=>Number(x>=edge);
  let nearWeight;
  ${shader.slice(start,end).replace(/\bfloat\b/g,'let')}
  return {x,y,z};
`);

test('both folded feet keep at least a 0.16 vertical slope above the eye-level horizon', () => {
  for (const eye of [{z:24,y:4.2},{z:44,y:4.2},{z:70,y:4.2},{z:125,y:5.4}]) {
    for (const seed of [1.3,4.1]) for(let time=0; time<=180; time+=1.25) {
      for(let i=0; i<=160; i++) {
        const point=foot({x:i/160,y:0.13/1.13},time,seed,eye);
        assert.ok((point.y-eye.y)/(eye.z-point.z) >= 0.16);
      }
    }
  }
});