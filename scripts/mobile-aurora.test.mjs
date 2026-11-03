import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('mobile motion advances visible textures and suspends the clock for every stop condition', () => {
  const element = () => ({ dataset:{}, style:{}, classList:{contains:()=>false},
    children:[], append(child){ this.children.push(child); }, remove(){}, setAttribute(){} });
  const field=element(),body=element(),host={ dataset:{view:'bodas'},querySelectorAll:()=>[field] };
  const visibility=[],intersections=[],mutations=[],frames=new Map();
  const reduced={matches:false,listeners:[],addEventListener(_,fn){this.listeners.push(fn)}};
  let id=0;
  const document={body,hidden:false,querySelector:()=>host,createElement:element,
    addEventListener(name,fn){if(name==='visibilitychange')visibility.push(fn)}};
  const window={};Object.assign(window,{window,parent:window,document,navigator:{},addEventListener(){},
    matchMedia:q=>q.includes('reduced')?reduced:{matches:true},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:n=>frames.delete(n),
    IntersectionObserver:class {constructor(fn){intersections.push(fn)} observe(){}},
    MutationObserver:class {constructor(fn){mutations.push(fn)} observe(){}}
  });
  for (const file of ['mobile-aurora','motion']) runInNewContext(readFileSync('src/site/scripts/'+file+'.js','utf8'),window);
  const layer=field.children.at(-1);
  const intersection=visible=>intersections.forEach(fn=>fn([{isIntersecting:visible}]));
  const tick=now=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))};
  intersection(true);assert.equal(frames.size,1);
  tick(100);const initial=layer.style.transform;tick(150);assert.notEqual(layer.style.transform,initial);
  intersection(false);assert.equal(frames.size,0);intersection(true);
  document.hidden=true;visibility.forEach(fn=>fn());assert.equal(frames.size,0);
  document.hidden=false;visibility.forEach(fn=>fn());assert.equal(frames.size,1);
  for(const key of ['journeyMotion','businessMotion']){
    body.dataset[key]='paused';mutations.forEach(fn=>fn());assert.equal(frames.size,0);
    body.dataset[key]='playing';mutations.forEach(fn=>fn());assert.equal(frames.size,1);
  }
  reduced.matches=true;reduced.listeners.forEach(fn=>fn(reduced));assert.equal(frames.size,0);
  reduced.matches=false;reduced.listeners.forEach(fn=>fn(reduced));assert.equal(frames.size,1);
});
