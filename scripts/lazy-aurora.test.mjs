import test from 'node:test';import assert from 'node:assert/strict';
import {lazyAurora,compileAurora} from '../src/site/webgl/lazy-aurora.js';

function globals(values){const old=Object.fromEntries(Object.keys(values).map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));Object.assign(globalThis,values);return()=>{for(const [key,value] of Object.entries(old))if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];};}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('zero-size and distant fields wait; shared idle queue initializes one at a time and cancels disposed work',async()=>{
 const idle=[],intersections=[],sizes=[];const restore=globals({Worker:undefined,OffscreenCanvas:undefined,innerHeight:900,addEventListener(){},requestIdleCallback:fn=>idle.push(fn),
  IntersectionObserver:class{constructor(fn,options){assert.equal(options.rootMargin,'900px 0px');intersections.push(fn);}observe(){}disconnect(){}},
  ResizeObserver:class{constructor(fn){sizes.push(fn);}observe(){}disconnect(){}}});
 const calls=[],a={clientWidth:100,clientHeight:0,dataset:{}},b={clientWidth:100,clientHeight:100,dataset:{}};let release;
 try{
  const disposeA=lazyAurora(a,async()=>{calls.push('a');await new Promise(r=>release=r);});const disposeB=lazyAurora(b,async()=>calls.push('b'));
  intersections[0]([{isIntersecting:true}]);assert.equal(idle.length,0);
  a.clientHeight=100;sizes[0]();await settle();assert.equal(idle.length,1);
  intersections[1]([{isIntersecting:true}]);await settle();assert.equal(idle.length,1,'No second idle callback until first job finishes');
  const running=idle.shift()();await settle();assert.deepEqual(calls,['a']);disposeB();release();await running;
  assert.equal(idle.length,1);await idle.shift()();assert.deepEqual(calls,['a']);disposeA();
 }finally{restore();}
});

test('parallel compilation polls future frames before checking link status',async()=>{
 const frames=[],calls=[];const restore=globals({requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},cancelAnimationFrame(){}});
 let done=false;const gl={VERTEX_SHADER:1,FRAGMENT_SHADER:2,LINK_STATUS:3,createProgram:()=>({}),createShader:()=>({}),shaderSource(){},compileShader(){},attachShader(){},getExtension:()=>({COMPLETION_STATUS_KHR:4}),linkProgram:()=>calls.push('link'),getProgramParameter:(_,key)=>{calls.push(key);if(key===3)assert(done,'LINK_STATUS may block before completion');return key===4?done:true;},deleteProgram(){},deleteShader(){}};
 try{const promise=compileAurora(gl,'vertex','fragment',new AbortController().signal);assert.deepEqual(calls,['link']);frames.shift()();await settle();assert.deepEqual(calls,['link',4]);done=true;frames.shift()();await promise;assert.deepEqual(calls,['link',4,4,3]);}finally{restore();}
});

test('aborting compilation releases the program without a blocking status read',async()=>{
 let disposed=0;const restore=globals({requestAnimationFrame:()=>1,cancelAnimationFrame(){}});const gl={createProgram:()=>({}),createShader:()=>({}),shaderSource(){},compileShader(){},attachShader(){},getExtension:()=>null,linkProgram(){},getProgramParameter:()=>assert.fail('Cancelled compilation'),deleteProgram:()=>disposed++,deleteShader(){}};
 try{const controller=new AbortController(),promise=compileAurora(gl,'v','f',controller.signal);controller.abort();await assert.rejects(promise,{name:'AbortError'});assert.equal(disposed,1);}finally{restore();}
});
