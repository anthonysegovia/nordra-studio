import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const head=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function preload({width=390,theme='light',paused=false,reduced=false,entered=false,saveData=false,cores=8,query='',storageError=false}={}){
 const links=[],root={dataset:{}},storage={getItem(key){if(storageError)throw Error('disabled');if(key==='nordra-theme')return theme;if(key==='nordra-landscape-entered')return String(entered);return JSON.stringify({paused});}};
 runInNewContext(head,{URLSearchParams,location:{search:query},sessionStorage:storage,localStorage:storage,navigator:{hardwareConcurrency:cores,connection:{saveData}},
  matchMedia(q){return{matches:q.includes('reduced-motion')?reduced:q.includes('max-width:700')?width<=700:q.includes('max-width:1600')?width<=1600:width>=2200};},
  document:{documentElement:root,createElement:()=>({}),head:{append:link=>links.push(link)}}});
 assert.equal(links.length,1);assert.equal(links[0].fetchPriority,'high');return links[0].href;
}
test('one early portrait selects the first entrance, including constrained phones',()=>{
 for(const cores of [8,4,2])assert.equal(preload({cores}),'/nordra/v544/assets/landscape-start-light-mobile.webp');
 for(const [width,format]of [[390,'mobile'],[1440,'compact'],[1905,'desktop'],[2560,'wide']])for(const theme of ['light','dark'])assert.ok(preload({width,theme}).endsWith(`landscape-start-${theme}-${format}.webp`));
 assert.ok(preload({storageError:true}).includes('landscape-start-light-'));
});
test('still preferences, data saver and repeat visits preload only the final portrait',()=>{
 for(const state of [{paused:true},{reduced:true},{entered:true},{saveData:true},{query:'?motion=paused'}])assert.ok(preload(state).includes('landscape-poster-light-'));
 assert.ok(preload({theme:'light',query:'?theme=dark'}).includes('landscape-start-dark-'));
});
