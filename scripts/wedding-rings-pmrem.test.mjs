import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {preparePMREM} from '../src/site/wedding-rings/prepare-programs.js';

test('PMREM adapter must be reviewed when the pinned Three version changes',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 assert.equal(pkg.dependencies.three,'0.181.0','Review the private PMREM adapter before changing Three');
});

test('missing PMREM internals skip preparation without touching the renderer or generator',async()=>{
 const unexpected=()=>assert.fail('Incompatible adapter must not allocate, compile or render');
 const complete={_setSize:unexpected,_allocateTargets:unexpected,_applyGGXFilter:unexpected,_blurMaterial:null,_ggxMaterial:null,_pingPongRenderTarget:null};
 const renderer={render:unexpected,setRenderTarget:unexpected,compileAsync:unexpected};
 for(const key of Object.keys(complete)){
  const pmrem={...complete};delete pmrem[key];
  assert.equal(await preparePMREM(renderer,pmrem),false,key);
 }
 for(const key of ['_setSize','_allocateTargets','_applyGGXFilter'])assert.equal(await preparePMREM(renderer,{...complete,[key]:null}),false,key);
});
