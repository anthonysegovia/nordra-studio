import test from 'node:test';import assert from 'node:assert/strict';
import {pageLifecycle} from '../src/site/webgl/page-lifecycle.js';import {lazyAurora} from '../src/site/webgl/lazy-aurora.js';
function environment(extra={}){
 const listeners=new Map(),values={addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);},...extra};
 const previous=Object.fromEntries(Object.keys(values).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));Object.assign(globalThis,values);
 return{emit(type,persisted){for(const fn of [...listeners.get(type)||[]])fn({persisted});},restore(){for(const [key,value] of Object.entries(previous))if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}};
}
const settle=()=>new Promise(r=>setImmediate(r));
test('persistent pagehide parks resources; pageshow resumes; permanent pagehide releases exactly once',()=>{
 const env=environment();let raf=true,observers=true,canvas=true,contexts=1;const calls=[];
 try{pageLifecycle({pause(){calls.push('pause');raf=observers=false;},resume(){calls.push('resume');raf=observers=true;},dispose(){calls.push('dispose');raf=observers=canvas=false;contexts=0;}});
  env.emit('pagehide',true);assert.equal(raf,false);assert.equal(observers,false);assert.equal(canvas,true);assert.equal(contexts,1);
  env.emit('pageshow',false);assert.equal(raf,false);env.emit('pageshow',true);assert.equal(raf,true);assert.equal(observers,true);assert.equal(contexts,1);
  env.emit('pagehide',true);env.emit('pageshow',true);env.emit('pagehide',false);env.emit('pageshow',true);env.emit('pagehide',false);
  assert.equal(canvas,false);assert.equal(contexts,0);assert.deepEqual(calls,['pause','resume','pause','resume','dispose']);
 }finally{env.restore();}
});
test('lazy fields resume pending work and reset a lost context without duplicating initialized fields',async()=>{
 const idle=[],intersections=[];let observations=0,disconnects=0;const env=environment({Worker:undefined,OffscreenCanvas:undefined,innerHeight:900,requestIdleCallback:fn=>idle.push(fn),IntersectionObserver:class{constructor(fn){intersections.push(fn);}observe(){observations++;}disconnect(){disconnects++;}},ResizeObserver:class{constructor(){}observe(){observations++;}disconnect(){disconnects++;}}});
 const signals=[];try{
  const dispose=lazyAurora({clientWidth:200,clientHeight:100,dataset:{}},async signal=>signals.push(signal));
  intersections[0]([{isIntersecting:true}]);await settle();env.emit('pagehide',true);await idle.shift()();assert.equal(signals.length,0);assert.equal(disconnects,2);
  env.emit('pageshow',true);await settle();assert.equal(idle.length,0);intersections[0]([{isIntersecting:true}]);await settle();await idle.shift()();assert.equal(signals.length,1);assert.equal(signals[0].aborted,false);assert.equal(observations,4);
  env.emit('pagehide',true);assert.equal(signals[0].aborted,false);env.emit('pageshow',true);await settle();assert.equal(idle.length,0);
  env.emit('pagehide',true);dispose.reset();assert.equal(signals[0].aborted,true);await settle();assert.equal(idle.length,0);env.emit('pageshow',true);intersections[0]([{isIntersecting:true}]);await settle();await idle.shift()();assert.equal(signals.length,2);
  env.emit('pagehide',false);assert.equal(signals[1].aborted,true);env.emit('pageshow',true);await settle();assert.equal(idle.length,0);
 }finally{env.restore();}
});
