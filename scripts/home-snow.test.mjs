import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isolateSiteScript } from '../build/site-scripts.mjs';

const raw = readFileSync(new URL('../src/site/scripts/home-snow.js', import.meta.url), 'utf8');
const source = isolateSiteScript(raw, 'home-snow.js');
const snowSeason = runInNewContext(raw + '\nsnowSeason', { document: { querySelector: () => null } });
test('la temporada incluye noviembre, diciembre y los primeros seis días de enero', () => {
  for (const [month, day, expected] of [[10,31,false],[11,1,true],[12,25,true],[1,6,true],[1,7,false]]) {
    assert.equal(snowSeason(new Date(2026,month-1,day)), expected);
  }
});

function setup({ dark=false, paused=false, reduced=false, summer=false, search='' }={}) {
  const gradient = {addColorStop() {}};
  const brush = {createRadialGradient:()=>gradient, fillRect() {}, setTransform() {},save() {},restore() {},translate() {},rotate() {},scale() {}};
  const canvas = {parentElement:{clientWidth:375,clientHeight:750,querySelector:()=>null}, classList:{toggle() {}},getContext:()=>brush};
  let intersect, pending=0;
  const body = {classList:{contains:()=>dark},dataset:{journeyMotion:paused?'paused':'playing'}};
  const document = {body,hidden:false,querySelector:()=>canvas,createElement:()=>({getContext:()=>brush}),addEventListener(){}};
  runInNewContext(source,{
    document,window:{devicePixelRatio:3},location:{search},URLSearchParams,
    Date:class extends Date {constructor(){super(2026,summer?6:11,15);}},
    matchMedia:()=>({matches:reduced,addEventListener(){}}),
    IntersectionObserver:class {constructor(fn){intersect=fn;}observe(){}},
    ResizeObserver:class {observe(){}},MutationObserver:class {observe(){}},
    requestAnimationFrame(){pending=1;return 1;},cancelAnimationFrame(){pending=0;},
    setTimeout(){},clearTimeout(){},addEventListener(){},
    console:{error:(_,error)=>{throw error;}}
  });
  return visible=>{intersect?.([{isIntersecting:visible}]);return pending;};
}

test('solo programa cuadros en temporada, tema claro y con el hero visible',()=>{
  const visible=setup();
  assert.equal(visible(true),1);
  assert.equal(visible(false),0);
  assert.equal(visible(true),1);
  for(const settings of [{dark:true},{reduced:true},{paused:true},{summer:true},{search:'?nieve=0'}]){
    assert.equal(setup(settings)(true),0,JSON.stringify(settings));
  }
});
test('forzar nieve fuera de temporada sigue respetando las preferencias',()=>{
  assert.equal(setup({summer:true,search:'?nieve=1'})(true),1);
  for(const setting of [{dark:true},{paused:true},{reduced:true}]){
    assert.equal(setup({...setting,summer:true,search:'?nieve=1'})(true),0);
  }
});

test('la ráfaga viaja por el hero y cambia con la altura', () => {
  const field = runInNewContext(raw + '\nsnowWind', { document: { querySelector: () => null } });
  const wind = (x, y, t) => field(x, y, t, {});
  assert.ok(wind(0, 0.5, 3).x > wind(1, 0.5, 3).x + 60);
  assert.ok(wind(1, 0.5, 7).x > wind(0, 0.5, 7).x + 60);
  assert.notEqual(wind(0.4, 0.1, 4).x, wind(0.4, 0.9, 4).x);
  assert.ok(Math.abs(wind(0.4, 0.5, 4).x - wind(0.4, 0.5, 4.01).x) < 4);
});

test('el hielo usa los mismos límites y anulaciones que la nieve, incluso con la escena fija', () => {
  const enabled = runInNewContext(raw + '\nwinterSeason', {document:{querySelector:()=>null}});
  for (const [month,day,expected] of [[10,31,false],[11,1,true],[12,25,true],[1,6,true],[1,7,false]]) {
    const date = new Date(2026,month-1,day);
    assert.equal(enabled(date,null),expected);
    assert.equal(enabled(date,'0'),false);
    assert.equal(enabled(date,'1'),true);
  }
});
