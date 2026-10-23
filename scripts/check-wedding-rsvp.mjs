import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const listeners = new Map(), elements = new Map(), animations = [];
let motion = true;
function element(name, height = 240) {
  const handlers = new Map(), classes = new Set();
  const el = {
    style:{}, hidden:false, inert:false, disabled:false, value:'', textContent:'',
    classList:{add:key=>classes.add(key),remove:key=>classes.delete(key),toggle(key,on){on?classes.add(key):classes.delete(key)},contains:key=>classes.has(key)},
    addEventListener:(event,handler)=>{const list=handlers.get(event)||[];list.push(handler);handlers.set(event,list)},
    fire(event){for(const handler of handlers.get(event)||[])handler({preventDefault(){}})},
    querySelector:selector=>elements.get(selector),setAttribute(){},focus(){},
    getBoundingClientRect:()=>({height}),
    animate(frames,options){
      let resolve,reject;
      const animation={frames,options,cancelled:false,finished:new Promise((yes,no)=>{resolve=yes;reject=no}),
        finish(){resolve()},cancel(){this.cancelled=true;reject(new Error('cancelled'))}};
      animations.push(animation);return animation;
    },
  };
  elements.set(name,el);return el;
}
const dialog=element('#dialog'), panels=element('.rsvp-panels',280), form=element('#form');
const confirmation=element('#confirmation',220), result=element('#result'), detail=element('#result-detail');
const attendance=element('#attendance'), guests=element('#guests'), guestField=element('.guest-field');
const trigger=element('#rsvp'), close=element('#close');
dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false;dialog.fire('close')};
form.reset=()=>{attendance.value='yes';guests.value='1'};
const context={
  document:{querySelector:selector=>elements.get(selector),addEventListener:(event,handler)=>listeners.set(event,handler)},
  window:{},weddingMotionAllowed:()=>motion,
  getComputedStyle:()=>({height:'260px',opacity:'.5',transform:'none'}),
};
new Script(readFileSync(new URL('../public/demos/boda-jardin/rsvp-motion.js',import.meta.url),'utf8')).runInNewContext(context);
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve()};

trigger.fire('click');assert(dialog.open);assert(!form.hidden);assert(confirmation.hidden);
attendance.value='no';attendance.fire('change');assert(guests.disabled);assert(guestField.classList.contains('is-unavailable'));
form.fire('submit');assert.equal(result.textContent,'Gracias');assert(form.inert);assert(!confirmation.inert);
assert.equal(detail.textContent,'por hacérnoslo saber.');
const count=animations.length;form.fire('submit');assert.equal(animations.length,count,'Ignore repeated submission while transitioning');
const interrupted=[...animations];close.fire('click');trigger.fire('click');
interrupted.forEach(a=>a.finish());await flush();
assert(!form.hidden && confirmation.hidden,'A stale completion after close/reopen must not hide the new form');
assert.equal(attendance.value,'yes');assert.equal(guests.value,'1');assert(!guests.disabled);

guests.value='3';guests.fire('change');form.fire('submit');
assert.equal(result.textContent,'¡Qué alegría!');
assert.equal(detail.textContent,'3 lugares de muestra.');
motion=false;listeners.get('wedding:motionchange')();await flush();
assert(form.hidden && !confirmation.hidden,'Pausing settles to the submitted response');
assert.equal(panels.style.height,'');assert(!panels.classList.contains('is-changing'));
assert(animations.every(a=>a.cancelled),'No field or panel effect remains active after pause');

close.fire('click');trigger.fire('click');const pausedCount=animations.length;
form.fire('submit');assert.equal(animations.length,pausedCount,'Paused confirmation remains usable without motion');
assert.equal(result.textContent,'¡Qué alegría!');assert.equal(detail.textContent,'1 lugar de muestra.');
motion=true;close.fire('click');trigger.fire('click');form.fire('submit');
animations.filter(a=>!a.cancelled).forEach(a=>a.finish());await flush();
assert(form.hidden && !confirmation.hidden);assert.equal(panels.style.height,'');
close.fire('click');trigger.fire('click');attendance.value='no';form.fire('submit');
assert.equal(result.textContent,'Gracias');
assert.equal(detail.textContent,'por hacérnoslo saber.','A declined response must replace the previous guest count');
console.log('RSVP checks passed: local responses, availability, repeated submit, close/reopen races, pause and settled panel cleanup.');
