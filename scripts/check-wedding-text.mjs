import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';

const listeners = new Map();
const preference = {matches:false, addEventListener(name,handler){listeners.set('preference',handler)}};
let motionAllowed = true;
const document = {hidden:false, addEventListener(name,handler){listeners.set(name,handler)}};
const context = {
  document, innerHeight:800, matchMedia:()=>preference,
  weddingMotionAllowed:()=>motionAllowed && !preference.matches,
  getComputedStyle:()=>({opacity:'0.7',transform:'none'}),
};
const source = readFileSync(new URL('../public/demos/boda-jardin/motion-text.js',import.meta.url),'utf8');
new Script(source+'\nglobalThis.updateText = weddingSetText;').runInNewContext(context);
const update = context.updateText;
const flush = async()=>{await Promise.resolve();await Promise.resolve()};
function label(value) {
  return {
    textContent:value, animations:[], top:100,
    getBoundingClientRect(){return {width:180,height:24,top:this.top,bottom:this.top+24}},
    animate(frames,options){
      let resolve,reject;
      const animation = {frames,options,cancelled:false,
        finished:new Promise((yes,no)=>{resolve=yes;reject=no}),
        finish(){resolve()},cancel(){this.cancelled=true;reject(new Error('cancelled'))},
      };
      this.animations.push(animation);
      return animation;
    },
  };
}

const color=label('Turquesa');
update(color,'Turquesa');assert.equal(color.animations.length,0,'No replay for an unchanged choice');
update(color,'Coral');
assert.equal(color.textContent,'Turquesa','Keep the old copy during its exit');
const exit=color.animations.at(-1);
update(color,'Coral');assert.equal(color.animations.at(-1),exit,'Repeated clicks cannot restart the fade');
exit.finish();await flush();
assert.equal(color.textContent,'Coral','Replace text only after it has faded out');
assert.equal(color.animations.at(-1).frames[0].opacity,0,'The new copy fades in');
color.animations.at(-1).finish();await flush();
assert.equal(color.textContent,'Coral');

update(color,'Azul');const stale=color.animations.at(-1);
update(color,'Arena');const latest=color.animations.at(-1);
assert(stale.cancelled,'Cancel the superseded transition');
stale.finish();await flush();assert.equal(color.textContent,'Coral','A stale completion cannot restore a discarded choice');
latest.finish();await flush();assert.equal(color.textContent,'Arena');
const incoming=color.animations.at(-1);
update(color,'Turquesa');assert(incoming.cancelled,'A new choice also interrupts an entrance');
motionAllowed=false;listeners.get('wedding:motionchange')();await flush();
assert.equal(color.textContent,'Turquesa','Pause immediately settles to the latest choice');
assert(color.animations.at(-1).cancelled);

motionAllowed=true;
update(color,'Coral');preference.matches=true;listeners.get('preference')();await flush();
assert.equal(color.textContent,'Coral','A reduced-motion preference settles pending text');
const count=color.animations.length;
update(color,'Azul');assert.equal(color.animations.length,count,'Reduced motion skips the effect');
preference.matches=false;
update(color,'Arena');document.hidden=true;listeners.get('visibilitychange')();await flush();
assert.equal(color.textContent,'Arena','Hidden tabs do not leave a pending label behind');
document.hidden=false;
color.top=900;
const offscreenCount=color.animations.length;
update(color,'Turquesa');assert.equal(color.animations.length,offscreenCount,'Offscreen changes need no animation');
color.top=100;
update(color,'Coral');update(color,'Azul',{immediate:true});await flush();
assert.equal(color.textContent,'Azul','Immediate initialization cancels any earlier pending value');

const seconds=label('09');update(seconds,'08',{compact:true});
assert.equal(seconds.animations.at(-1).options.duration,90);
seconds.animations.at(-1).finish();await flush();
assert.equal(seconds.textContent,'08');assert.equal(seconds.animations.at(-1).options.duration,230);
seconds.animations.at(-1).finish();await flush();
console.log('Wedding text checks passed: exit/entrance, repeated/rapid choices, stale completions, pause, reduced motion, hidden/offscreen updates and countdown timing.');
