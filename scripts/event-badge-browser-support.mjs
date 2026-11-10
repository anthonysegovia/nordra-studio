import { chromium } from 'playwright';

export const launch = () => chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
export async function profile(context, { cores = 8, memory = 8, saveData = false } = {}) {
  await context.addInitScript(({ cores, memory, saveData }) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => cores });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => memory });
    if (navigator.connection) Object.defineProperty(navigator.connection, 'saveData', { get: () => saveData });
    window.__badgePerf = { tasks: [], lcp: 0 };
    new PerformanceObserver(list => { window.__badgePerf.tasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration }))); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => { window.__badgePerf.lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    const original = HTMLCanvasElement.prototype.getContext;
    window.__webglContexts = 0;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2') window.__webglContexts++;
      return original.call(this, type, ...args);
    };
  }, { cores, memory, saveData });
}

// Only intercepted test responses expose controls. Production has no debug API.
export async function instrument(page) {
  await page.route('**/src/site/event-badge/badge-scene.js*', async route => {
    const response = await route.fetch();
    let body = await response.text();
    body = body.replace(/step\(dt\);\s*renderer.render\(scene,\s*camera\);/, 'step(dt);renderer.render(scene,camera);window.__badge.frames.push(performance.now());');
    body = body.replace(/return\s*\{\s*setState,\s*dispose\s*\};/, `window.__badge={
      frames:[],get state(){return {...S,phase,current,clock,running,entered,stamp:stampMat.opacity}},
      hit(x,y){return hit({clientX:x,clientY:y})},
      rest(){showEvent(0);rest();},
      poster(){renderer.setPixelRatio(devicePixelRatio);layout();showEvent(0);rest();},
      freeze(t){stop();enter();for(let elapsed=0;elapsed<t;elapsed+=1/60)step(Math.min(1/60,t-elapsed));renderOnce();},
      bounds(){badge.updateWorldMatrix(true,false);const r=stage.getBoundingClientRect();return [[-BW/2,-BH/2],[BW/2,-BH/2],[-BW/2,BH/2],[BW/2,BH/2]].map(([x,y])=>{const v=badge.localToWorld(new THREE.Vector3(x,y,0)).project(camera);return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});}
    };return {setState,dispose};`);
    await route.fulfill({ response, body });
  });
}
