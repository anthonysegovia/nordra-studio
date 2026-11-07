import test from 'node:test';import assert from 'node:assert/strict';import {ringsPolicy,staticProfile} from '../src/site/wedding-rings/state.js';
const initial={visible:true,painted:true,ready:false,phone:false};
test('rings require a visible painted page and respect every still profile',()=>{assert(ringsPolicy(initial).load);for(const key of ['paused','reduced','static','hidden','embeddedHidden','failed','disposed'])assert(!ringsPolicy({...initial,[key]:true}).load,key);assert(!ringsPolicy({...initial,painted:false}).load);assert(!ringsPolicy({...initial,visible:false}).load);});
test('phones preload nearby and animate only when visible, preserving pause',()=>{
 const phone={...initial,phone:true,visible:false,near:true};
 assert(ringsPolicy(phone).load);assert(!ringsPolicy(phone).offerMotion);
 const live={...phone,ready:true};assert(!ringsPolicy(live).animate);assert(!ringsPolicy(live).showScene);
 assert(ringsPolicy({...live,visible:true}).animate);
 assert(ringsPolicy({...live,revealed:true}).showScene);
 for(const key of ['paused','reduced','static','hidden','embeddedHidden'])assert(!ringsPolicy({...phone,[key]:true}).load);
 assert(!ringsPolicy({...live,visible:true,paused:true}).showScene);
});
test('static hardware thresholds match Inicio',()=>{for(const device of [{hardwareConcurrency:3},{deviceMemory:2},{connection:{saveData:true}}])assert(staticProfile(device));assert(!staticProfile({hardwareConcurrency:4,deviceMemory:3}));assert(!staticProfile({}));});
