import {idleTask,runSteps} from './work.js';
import {lightingCache} from './lighting.js';
import {sanitizeName,sanitizeAge,displayAge,daysToLiftoff,whatsappURL,rememberStyle} from './state.js';
import {dictionary,format} from './copy.js';
import {loadFonts} from './fonts.js';
export async function mountSign({initialStyle,staticMode,loadStyle}){
const lang=document.documentElement.lang.startsWith('en')?'en':'es',copy=dictionary[lang];
let activeStyle=await loadStyle(initialStyle);
const effects=staticMode?null:await import('./effects.js');


const body = document.body;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduced.matches || staticMode;
const fine = matchMedia('(hover:hover)').matches;
const mobile = matchMedia('(max-width:900px)');


const $ = id => document.getElementById('bs-'+id);
const root = document.querySelector('.birthday-sign-root');
const hero = $('hero'), sign = $('sign'), plate = $('plate'), zone = $('zone');
// Non-inherited light intensity avoids invalidating the entire container-query
// subtree on every flicker. Only these decorative consumers need the value.
const lightNodes=[...hero.querySelectorAll('.wall-glow,.motel-arrow .ma-on,.deco,.deco2,.chandelier .flame,.rainbows i,.radar')];
const lightParents=[...hero.querySelectorAll('h1 em,.plate,.shelf')];
const word = $('word'), num = $('num'), tubesBox = $('tubes'), sub = $('sub'), arrow = $('arrow');
const sw = $('switch'), swCap = $('switch-cap'), status = $('status');
const NS = 'http://www.w3.org/2000/svg';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const css = v => getComputedStyle(body).getPropertyValue(v).trim();
const still = () => reduce || body.dataset.journeyMotion === 'paused';
let visible = true, disposed = false, initialized = false;
let on = false, run = 0, tubes = [], bulbs = [], chevs = [...arrow.querySelectorAll('path')];
let userSet = false, sampleIx = 0, current = { name: 'Camila', age: '30' };
const SAMPLES = [
  { name: 'Camila', age: '30', tube: 'rosa', style: 'cursiva' },
  { name: 'Andrés', age: '40', tube: 'ambar', style: 'bloque' },
  { name: 'Ximena', age: 'XV', tube: 'violeta', style: 'cursiva' },
  { name: 'Iker', age: '6', tube: 'cielo', style: 'retro' }
];
const COLOR = { rosa: 'rosa', ambar: 'ámbar', menta: 'menta', violeta: 'violeta', cielo: 'cielo' };

/* ---------- 1 · nombre, edad y estilo ---------- */
const GLYPHS = {
  0:'M50 152C10 152 10 28 50 28C90 28 90 152 50 152Z', 1:'M30 54 60 28V152',
  2:'M18 60C20 20 84 18 84 58C84 94 32 108 18 152H88', 3:'M20 50C28 20 86 16 88 50C90 74 66 84 50 86C76 86 96 100 92 128C88 162 32 164 16 138',
  4:'M68 152V28L14 112H92', 5:'M84 30H30L24 84C42 72 88 72 88 112C88 158 32 162 16 136',
  6:'M82 38C60 18 20 28 18 92C16 140 38 154 54 154C80 154 90 134 88 112C86 88 66 80 52 80C36 80 22 92 18 104',
  7:'M14 30H88L40 152', 8:'M50 88C22 88 20 28 50 28C80 28 78 88 50 88C14 88 14 154 50 154C86 154 86 88 50 88Z',
  9:'M84 74C82 96 66 100 50 100C30 100 16 86 16 64C16 40 32 28 50 28C72 28 86 44 84 80C82 130 60 156 22 146',
  X:'M18 30 86 152M86 30 18 152', V:'M14 30 50 152 86 30'
};
const cleanAge = sanitizeAge;
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; }
let fitLayoutFrame=0;
function fit(){
  tubesBox.style.setProperty('--s', 1);
  const avail = tubesBox.clientWidth;
  const used = word.offsetWidth + (num.style.display === 'none' ? 0 : num.getBoundingClientRect().width) + 30;
  if (used > avail) tubesBox.style.setProperty('--s', (avail / used).toFixed(3));
  cancelAnimationFrame(fitLayoutFrame);fitLayoutFrame=requestAnimationFrame(layout);
}
function setLook(tube, style){
  if (tube) { body.dataset.tube = tube; root.querySelectorAll('.chips .chip').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.c === tube))); }
  if (style) { plate.dataset.style = style; root.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.s === style))); }
}

/* ---------- guirnalda ---------- */
const gsvg = $('garland');
function buildGarland(){
  gsvg.textContent = '';
  const w = hero.clientWidth, small = w < 700;
  const sag = small ? 44 : 92, top = small ? 10 : 14, n = Math.max(7, Math.round(w / (small ? 52 : 84)));
  const y = x => top + sag * 4 * (x / w) * (1 - x / w) + (small ? 0 : 10 * Math.sin(x / w * Math.PI * 3));
  let d = `M0 ${y(0)}`; for (let x = 8; x <= w; x += 8) d += `L${x} ${y(x).toFixed(1)}`;
  el('path', { class: 'wire', d }, gsvg);
  bulbs = garlandWorld(n, w, y, small);
}

/* ---------- cables ---------- */
function drawCables(){
  const c = $('cables'); c.textContent = '';
  const w = plate.offsetWidth, h = c.getBoundingClientRect().height || 190;
  if (world() === 'caja') return cordCaja(c, w, h);
  if (world() === 'xv') return;
  [[.16, -8], [.84, 8]].forEach(([fx, bow]) => {
    const x = w * fx;
    el('path', { d: `M${x + bow * 1.4} 0Q${x + bow} ${h * .55} ${x} ${h - 10}` }, c);
    el('circle', { class: 'eye', cx: x + bow * 1.4, cy: 2, r: 3 }, c);
    el('path', { class: 'hook', d: `M${x} ${h - 12}c-5 0-6 8 0 10s6-6 2-8` }, c);
  });
  c.setAttribute('viewBox', `0 0 ${w} ${h}`);
}
function drawWires(){
  const pw = $('pwires'); pw.textContent = '';
  const pr = plate.getBoundingClientRect(), W = plate.offsetWidth, H = plate.offsetHeight;
  pw.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const wr = word.getBoundingClientRect(), nr = num.getBoundingClientRect();
  const cq = zone.clientWidth / 100, gx = W - cq * 6, gy = H - cq * 1.2;
  const sx = (wr.left - pr.left) + 4, sy = (wr.bottom - pr.top) - wr.height * .22;
  const ex = num.style.display === 'none' ? (wr.right - pr.left) : (nr.right - pr.left) - 6, ey = (nr.bottom - pr.top) - 8;
  el('path', { d: `M${sx} ${sy}C${sx - cq * 2} ${gy - cq * 2} ${sx} ${gy} ${sx + cq * 4} ${gy}L${gx} ${gy}` }, pw);
  el('path', { d: `M${ex} ${ey}C${ex} ${gy} ${gx + 4} ${gy - 6} ${gx} ${gy}` }, pw);
  el('circle', { cx: gx, cy: gy, r: 3.2 }, pw);
  const cord = $('cord'); cord.textContent = '';
  if (mobile.matches) return;
  const zr = zone.getBoundingClientRect(), sr = sw.getBoundingClientRect();
  cord.setAttribute('viewBox', `0 0 ${zr.width} ${zr.height}`);
  const ax = pr.left - zr.left + gx, ay = pr.top - zr.top + gy, bx = sr.left - zr.left + sr.width / 2, by = sr.top - zr.top + 4;
  el('path', { d: `M${ax} ${ay}C${ax} ${ay + 60} ${bx} ${by - 60} ${bx} ${by}` }, cord);
}

/* ---------- pared de ladrillo y luz por ladrillo ---------- */
const canvas = $('wall'), base = document.createElement('canvas');
let bricks = [], W = 0, H = 0, dpr = 1, sources = [];
function rand(seed){ let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
let wallVersion=0, illumination=null, lightGeometry="", fullLight=true, lastFade=-1;
async function paintBase(){
  const version=++wallVersion; illumination=null; lightGeometry=""; fullLight=true;
  dpr = Math.min(devicePixelRatio || 1, 2); W = hero.clientWidth; H = hero.clientHeight;
  for (const cv of [canvas, base, fx]) { cv.width = W * dpr; cv.height = H * dpr; }
  const painted=document.createElement('canvas');painted.width=base.width;painted.height=base.height;
  const c = painted.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dark = body.classList.contains('dark'), r = rand(7);
  const context={W,H,css,star4,copy};
  const nextBricks=activeStyle.paintWorldSteps?await runSteps(activeStyle.paintWorldSteps(c,dark,r,context)):await idleTask(()=>activeStyle.paintWorld(c,dark,r,context));
  if(version!==wallVersion)return;
  base.getContext('2d').drawImage(painted,0,0);bricks=nextBricks;lightGeometry='';light();
}
const rgbCache = {};
function rgb(c){ if (rgbCache[c]) return rgbCache[c]; const d = document.createElement('i'); d.style.color = c; document.body.appendChild(d); const v = getComputedStyle(d).color.match(/\d+/g).map(Number); d.remove(); return rgbCache[c] = v; }
let sign0 = { x: 0, y: 0 }, shelfY = 0;
function collectSources(){
  const hr = hero.getBoundingClientRect();
  const tube = rgb(css('--tube')), gold = rgb(css('--gold')), bulb = rgb(css('--bulb'));
  const pt = (e, col, k) => { const b = e.getBoundingClientRect(); return { e, x: b.left - hr.left + b.width / 2, y: b.top - hr.top + b.height / 2, col, k }; };
  sources = [...word.querySelectorAll('.t'), ...chevs].map(e => pt(e, tube, e.closest('.arrow') ? .22 : .8))
    .concat([...num.querySelectorAll('g.t')].map(e => pt(e, gold, 1)), [pt(sub, gold, .3)], bulbs.map(e => pt(e, bulb, .4)));
  const pr = plate.getBoundingClientRect(), sh = $('shelf').getBoundingClientRect();
  sign0 = { x: pr.left - hr.left + pr.width / 2, y: pr.top - hr.top + pr.height / 2, w: pr.width, h: pr.height };
  shelfY = sh.bottom - hr.top - 16; shelfX = [sh.left - hr.left, sh.right - hr.left];
}
let shelfX = [0, 0], lightQueued = false;
function light(){
  if (!initialized || lightQueued) return; lightQueued = true;
  requestAnimationFrame(() => {
    lightQueued = false;
    const geometry=sources.map(s=>[s.x,s.y,s.k,...s.col].join(',')).join(';');
    if(!illumination||geometry!==lightGeometry){illumination=lightingCache(bricks,sources,W<700?90:150);lightGeometry=geometry;fullLight=true;}
    const fade=1-parseFloat(body.style.getPropertyValue('--handoff')||0)*.7;
    const dirty=illumination.update(sources.map(s=>s.e.classList.contains('on')?(s.party||s.col):[0,0,0]),fullLight||fade!==lastFade);
    const c=canvas.getContext('2d'),dark=body.classList.contains('dark');
    c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';
    if(fullLight)c.drawImage(base,0,0);
    for(const i of dirty){
      const [x,y,w,h]=bricks[i];
      c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';
      const px=Math.floor(x*dpr),py=Math.floor(y*dpr),pw=Math.ceil((x+w)*dpr)-px,ph=Math.ceil((y+h)*dpr)-py;
      c.drawImage(base,px,py,pw,ph,px,py,pw,ph);
      const [r,g,b,up]=illumination.values[i],alpha=Math.min(1,Math.max(0,(r+g+b)/765));
      if(alpha<.01)continue;
      const n=Math.max(r,g,b)||1,rr=[r/n*255|0,g/n*255|0,b/n*255|0];
      const tint=t=>dark?'rgba('+rr+','+t+')':'rgb('+rr.map(v=>255-(255-v)*t|0)+')';
      c.setTransform(dpr,0,0,dpr,0,0);c.globalCompositeOperation=dark?'lighter':'multiply';
      c.fillStyle=tint((dark?.22:.12)*alpha*fade);c.fillRect(x,y,w,h);
      c.fillStyle=tint((dark?.55:.26)*alpha*fade);c.fillRect(x+2,up>=0?y:y+h-2,w-4,2);
    }
    c.globalCompositeOperation='source-over';fullLight=false;lastFade=fade;
  });
}

/* ---------- encendido con arranque (9) ---------- */
const setLit = () => {
 const value=(tubes.filter(t=>t.classList.contains('on')).length/Math.max(1,tubes.length)).toFixed(3);
 if(hero.style.getPropertyValue('--lit')!==value){
  hero.style.setProperty('--lit',value);
  for(const node of lightNodes)node.style.setProperty('--lit',value);
  for(const node of lightParents)node.style.setProperty('--local-lit',value);
 }
 light();syncReflect();startFx();
};
function strike(t){
  if (world() !== 'neon') { t.classList.add('warming'); requestAnimationFrame(() => { t.classList.add('on'); setLit(); }); setTimeout(() => t.classList.remove('warming'), 1200); return; }
  t.classList.add('on', 'strike'); setLit();
  setTimeout(() => { t.classList.add('warming'); t.classList.remove('strike'); setTimeout(() => t.classList.remove('warming'), 1100); }, 70);
}
async function flick(t, pattern){ for (const [s, ms] of pattern) { if (s === 2) { strike(t); } else { t.classList.toggle('on', !!s); setLit(); } if (ms) await sleep(ms); } }
const P_LETTER = [[1, 35], [0, 55], [2, 0]], P_NUM = [[1, 50], [0, 90], [1, 30], [0, 240], [1, 40], [0, 70], [2, 0]];
async function ignite(fast){
  const id = ++run; on = true; updateSwitch(); hum(); startFx();
  if (still()) { [...tubes, ...bulbs, ...chevs].forEach(t => t.classList.add('on')); arrow.classList.add('chase'); setLit(); return; }
  await sleep(fast ? 120 : 1150);
  bulbs.forEach((b, i) => setTimeout(() => id === run && flick(b, [[1, 40], [0, 50], [1, 0]]), i * (fast ? 25 : 55)));
  await sleep(fast ? 80 : 300);
  if (!await lightName(id, fast)) return;
  rebelLetter();
  await sleep(fast ? 200 : 520); if (id !== run) return;
  flick(sub, [[1, 60], [0, 120], [2, 0]]);
  await sleep(fast ? 200 : 600); if (id !== run) return;
  for (const c of [...chevs].reverse()) { await flick(c, [[1, 40], [0, 60], [1, 0]]); await sleep(110); }
  if (id === run) { arrow.classList.add('chase'); scheduleRotation(id); }
}
async function kill(){
  const id=++run; on = false; updateSwitch(); hum(); arrow.classList.remove('chase'); stopParty();
  for (const t of [...chevs, ...tubes]) { if(id!==run)return; if (world() === 'neon' && t.classList.contains('on')) { t.classList.add('afterglow'); setTimeout(() => t.classList.remove('afterglow'), 1200); } t.classList.remove('on', 'strike', 'rebel'); setLit(); if (!still()) await sleep(18); }
  if(id!==run)return; bulbs.forEach(b => b.classList.remove('on')); setLit();
}
/* cambia solo el nombre y el número; guirnalda, fecha y flecha siguen encendidas */
async function swap(name, age, tube, style, opts = {}){
  const id = ++run;
  if(style&&world()==='neon')await loadFonts([{cursiva:'Neonderthaw',bloque:'Tilt Neon',retro:'Monoton',motel:'Yellowtail'}[style]]);
  if(id!==run)return;
  const old = tubes.filter(t => t !== sub);
  for (const t of [...old].reverse()) { t.classList.remove('on'); setLit(); if (!still()) await sleep(16); }
  if (id !== run) return;
  if (!still()) await sleep(220);
  if(id!==run)return; setLook(tube, style); build(name, age);
  // Fonts are ready before building. fit() already schedules the one geometry
  // pass; wait for it instead of forcing a second layout for the same name.
  await new Promise(requestAnimationFrame);if(id!==run)return;
  if (!on) return;
  if (still()) { tubes.forEach(t => t.classList.add('on')); setLit(); }
  else if (!await lightName(id, true)) return;
  if (opts.confetti) confetti();
  if (opts.announce) status.textContent = format(copy.lit, {name, age:displayAge(age,world())}).replace(/ +\./,'.');
  scheduleRotation(id);
}
function updateSwitch(){
  sw.setAttribute('aria-checked', on);
  sw.setAttribute('aria-label', on ? copy.signOn : copy.signOff);
  swCap.textContent = on ? copy.off : copy.on;
}
sw.addEventListener('click', () => { click(); if (navigator.vibrate) navigator.vibrate(12); on ? kill() : ignite(true); });

/* rotación de festejados mientras nadie escribe su nombre */
let rotTimer;
function scheduleRotation(id){
  clearTimeout(rotTimer);
  if (userSet || still() || disposed || !visible || document.hidden || id!==run) return;
  rotTimer = setTimeout(() => {
    if (id !== run || userSet || !on || !visible || document.hidden || body.dataset.journeyMotion === 'paused' || party || zone.classList.contains('is-wrapped') || zone.classList.contains('door-in')) return scheduleRotation(id);
    if (zone.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return scheduleRotation(id);
    sampleIx = (sampleIx + 1) % SAMPLES.length; const s = SAMPLES[sampleIx];
    swap(s.name, world() === 'neon' ? s.age : current.age, world() === 'neon' ? s.tube : null, world() === 'neon' ? s.style : null);
  }, 5200);
}
function stopRotation(){ userSet = true; clearTimeout(rotTimer); }

/* parpadeo ocasional */
(function flutter(){
  setTimeout(async () => {
    if (on && visible && !still() && !document.hidden && !party && world() === 'neon') {
      const t = tubes[Math.floor(Math.random() * tubes.length)];
      if (t && t.classList.contains('on')) await flick(t, [[0, 45], [1, 70], [0, 30], [1, 0]]);
    }
    if (!disposed) flutter();
  }, 5000 + Math.random() * 6000);
})();

/* ---------- formulario, estilo y color ---------- */
const ask = $('ask');
function updateAsk(){
 ask.href = whatsappURL({ ...current, style:world(), color:body.dataset.tube, lettering:plate.dataset.style, lang });
}
function personalize(name, age){
  body.classList.add('named');
  root.querySelectorAll('[data-name]').forEach(e => e.textContent = name);
  root.querySelectorAll('.phone [data-age]').forEach(e => e.textContent = displayAge(age, e.closest('.c-xv') ? 'xv' : 'neon') || e.dataset.age);
  root.querySelectorAll('[data-name-tag]').forEach(e => e.textContent = name);
  const a = cleanAge(age); root.querySelectorAll('[data-xv]').forEach(e => e.textContent = !a || a === 'XV' || a === '15' ? copy.quince : copy.birthday);
  $('estilos-titulo').textContent = '';
  $('estilos-titulo').append(name + ',', document.createElement('br'));
  const b = document.createElement('b'); b.textContent = copy.fourStyles; $('estilos-titulo').append(b);
}
$('namer').addEventListener('submit', async e => {
  e.preventDefault();
  stopRotation();
  const name = sanitizeName($('nm').value) || 'Camila';
  const age = cleanAge($('ag').value);
  $('nm').blur(); $('ag').blur();
  if (!on) { on = true; updateSwitch(); }
  await swap(name, age, null, null, { confetti: true, announce: true });
  if (!sub.classList.contains('on')) { strike(sub); bulbs.forEach(b => b.classList.add('on')); chevs.forEach(c => c.classList.add('on')); arrow.classList.add('chase'); setLit(); }
  personalize(name, age); updateAsk(); ask.hidden = false;
});
$('nm').addEventListener('input', stopRotation);
$('ag').addEventListener('input', e => { stopRotation(); e.target.value = sanitizeAge(e.target.value); });
root.querySelectorAll('.chips .chip').forEach(b => b.addEventListener('click', async () => {
  stopRotation();
  const wasOn = on; setLook(b.dataset.c);
  if (wasOn && !reduce) { const id = ++run; const ts = [...word.querySelectorAll('.t'), ...chevs]; ts.forEach(t => t.classList.remove('on')); setLit(); await sleep(140); if (id !== run) return; collectSources(); for (const t of ts) { strike(t); await sleep(22); } }
  collectSources(); light(); updateAsk();
}));
root.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => { stopRotation(); swap(current.name, current.age, null, b.dataset.s).then(updateAsk); }));
$('custom-toggle').addEventListener('click', e => {
  const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
  e.currentTarget.setAttribute('aria-expanded', String(open)); $('controls').classList.toggle('open', open);
  if (open) setTimeout(() => $('nm').focus({ preventScroll: true }), 300);
});

/* ---------- 6 · confeti y polvo en el aire ---------- */
const fx = $('fx'), fctx = staticMode ? null : fx.getContext('2d');
if(staticMode)fx.hidden=true;
let fxFrame=0,fxTimer=0,lastFx=0;
const ambient=()=>!staticMode&&!mobile.matches;
let pieces = [], resting = [], motes = [], fxRunning = false;
function seedMotes(){ if(!ambient()){motes=[];smokeP=[];shoot=[];return;}motes=Array.from({length:W<700?22:46},()=>({x:Math.random(),y:Math.random(),v:.00012+Math.random()*.0003,p:Math.random()*6.28})); }
function startFx(){if(!initialized||!effects||staticMode||still()||!visible||document.hidden||disposed||(!ambient()&&!pieces.length&&!sparks.length))return;if(!fxRunning){fxRunning=true;fxFrame=requestAnimationFrame(tick);}}
function tick(t){
 if(still()||!visible||document.hidden||disposed){fxRunning=false;return;}

  const dt=lastFx?Math.min(2,(t-lastFx)/(1000/60)):1;lastFx=t;
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.clearRect(0, 0, W, H);
  const lit = parseFloat(hero.style.getPropertyValue('--lit') || 0);
  // polvo: solo se ve dentro del haz de luz del letrero
  if (!still() && lit > .3) {
    const tube = rgb(css('--tube'));
    for (const m of motes) {
      m.y -= m.v*dt; if (m.y < 0) m.y = 1;
      const x = sign0.x + (m.x - .5) * sign0.w * 1.5 + Math.sin(t / 2400 + m.p) * 14, y = sign0.y + (m.y - .5) * sign0.h * 2.4;
      const d = Math.hypot((x - sign0.x) / (sign0.w * .75), (y - sign0.y) / (sign0.h * 1.2));
      const a = Math.max(0, 1 - d) * .55 * lit;
      if (a > .02) { fctx.fillStyle = `rgba(${tube},${a})`; if (world() === 'xv') { const tw = (Math.sin(t / 380 + m.p * 7) + 1) / 2; fctx.globalAlpha = tw; star4(fctx, x, y, 1.5 + tw * 3.5); fctx.globalAlpha = 1; } else { fctx.beginPath(); fctx.arc(x, y, 1.1, 0, 6.3); fctx.fill(); } }
    }
  }
  worldFx(fctx, t, lit);
  // confeti: algunos pedazos se quedan en la repisa
  for (const p of pieces) {
    const pet = p.kind === 'petal'; p.vy = Math.min(p.vy + (pet ? .035 : .07), pet ? 1.3 : 2.6); p.vx *= .99; p.x += p.vx + Math.sin(t / 300 + p.r) * (pet ? 1.1 : .3); p.y += p.vy; p.r += p.vr;
    if (p.y >= shelfY && p.y < shelfY + 6 && p.x > shelfX[0] && p.x < shelfX[1] && Math.random() < .35) { p.rest = true; p.y = shelfY + Math.random() * 3; resting.push(p); if (resting.length > 40) resting.shift(); }
  }
  pieces = pieces.filter(p => !p.rest && p.y < H + 20);
  for (const p of [...resting, ...pieces]) drawPiece(fctx, p, t);
  if(pieces.length||sparks.length)fxFrame=requestAnimationFrame(tick);
  else if(ambient()&&((lit>.3&&motes.length)||smokeP.length||shoot.length||(on&&world()==='espacio')))fxTimer=setTimeout(()=>{fxFrame=requestAnimationFrame(tick);},1000/30);
  else fxRunning=false;
}

/* ---------- 8 · modo fiesta ---------- */
let party = false, partyEnd;
const PARTY = ['#ff4fa3', '#ffb640', '#22f0bd', '#a57bff', '#3cc6ff'];
function stopParty(){
  party = false; clearTimeout(partyEnd); sign.classList.remove('party'); $('party').setAttribute('aria-pressed', 'false');
  bulbs.forEach(b => { b.style.removeProperty('--bc'); b.style.removeProperty('--bg2'); }); sources.forEach(s => delete s.party); light();
}
$('party').addEventListener('click', () => {
  if (party) return stopParty();
  if (!on) return;
  party = true; $('party').setAttribute('aria-pressed', 'true'); sign.classList.toggle('party', !reduce);
  const t0 = performance.now();let lastPartyStep=-1;
  (function loop(t){
    if (!party || still() || !visible || document.hidden) return;
    const step = Math.floor((t - t0) / 160);
    bulbs.forEach((b, i) => { const c = PARTY[(i + step) % PARTY.length]; b.style.setProperty('--bc', c); b.style.setProperty('--bg2', c); });
    for (const s of sources) { const i = bulbs.indexOf(s.e); if (i >= 0) s.party = rgb(PARTY[(i + step) % PARTY.length]); }
    if(step!==lastPartyStep){light();lastPartyStep=step;} if (!still()) requestAnimationFrame(loop);
  })(t0);
  confetti(); partyWorld();
  partyEnd = setTimeout(stopParty, 6500);
});

/* ---------- zumbido y clic (apagado por defecto) ---------- */
let ac, humGain;
function click(){
  if (!soundOn()) return;
  const len = ac.sampleRate * .03, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  f.type = 'bandpass'; f.frequency.value = 2400; g.gain.value = .5; s.buffer = buf; s.connect(f).connect(g).connect(ac.destination); s.start();
}
function hum(){ if (humGain) humGain.gain.setTargetAtTime(on && soundOn() && !document.hidden ? .018 : 0, ac.currentTime, .08); }
$('sound').addEventListener('click', e => {
  const b = e.currentTarget, next = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', String(next));
  if (next && !ac) {
    ac = new AudioContext(); const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter();
    humGain = ac.createGain(); humGain.gain.value = 0; o.type = 'sawtooth'; o.frequency.value = 120; o2.type = 'sine'; o2.frequency.value = 240;
    f.type = 'lowpass'; f.frequency.value = 520; o.connect(f); o2.connect(f); f.connect(humGain).connect(ac.destination); o.start(); o2.start();
  }
  if (ac) next ? ac.resume() : ac.suspend();
  hum();
});

/* Existing global motion control is the only source of truth. */
/* ---------- cursor ---------- */
if (!reduce && fine) {
  hero.addEventListener('pointermove', e => {
    if (still() || !visible) return;
    for (const t of tubes) {
      const b = t.getBoundingClientRect();
      t.style.setProperty('--b', Math.max(0, 1 - Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / 240).toFixed(2));
    }
    const s = sign.getBoundingClientRect();
    const nx = (e.clientX - (s.left + s.width / 2)) / innerWidth, ny = (e.clientY - (s.top + s.height / 2)) / innerHeight;
    sign.style.setProperty('--rx', (nx * 4).toFixed(2) + 'deg'); sign.style.setProperty('--ry', (-ny * 3).toFixed(2) + 'deg');
    plate.style.setProperty('--sx', (-nx * 30).toFixed(1) + 'px'); plate.style.setProperty('--sy', (-ny * 16).toFixed(1) + 'px');
    hero.style.setProperty('--gx', (62 + nx * 6).toFixed(1) + '%');
    hero.querySelector('.garland').style.setProperty('--gsx', (nx * 14).toFixed(1) + 'px');
    pointerWorld(e, nx, ny);
  });
  hero.addEventListener('pointerleave', () => { tubes.forEach(t => t.style.setProperty('--b', 0)); ['--rx', '--ry'].forEach(p => sign.style.setProperty(p, '0deg')); });
}

/* ---------- la luz pasa a los estilos ---------- */
const next = $('estilos');
function handoff(){
  parallax();
  const r = next.getBoundingClientRect();
  body.style.setProperty('--handoff', Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .75))).toFixed(3)); light();
}
addEventListener('scroll', () => requestAnimationFrame(handoff), { passive: true });

/* ---------- maquetación ---------- */
function placeSwitch(){ (mobile.matches ? $('shelf') : $('switch-wrap')).appendChild($('switch-box')); }
mobile.addEventListener('change', () => { placeSwitch(); fit(); });
function layout(){ drawCables(); drawWires(); collectSources(); light(); positionBow(); }
let rz; new ResizeObserver(() => {if(!initialized|| (W===hero.clientWidth&&H===hero.clientHeight))return;cancelAnimationFrame(rz);rz=requestAnimationFrame(async()=>{await idleTask(buildGarland);await paintBase();seedMotes();fit();if(on)bulbs.forEach(b=>b.classList.add('on'));});}).observe(hero);
// Letter warm-up events bubble here too; their opacity does not change geometry.
// Rebuild wires/light coordinates only when the sign itself finishes moving.
sign.addEventListener('animationend', event => {if(event.target===sign)layout();});

function setTheme(){ paintBase(); collectSources(); light(); }

/* =====================================================================
   v4 · CINCO ESTILOS Y SUS TRANSICIONES
   ===================================================================== */
const WORLDS = copy.worlds;
function world(){ return body.dataset.world || 'neon'; }
body.dataset.world = initialStyle;

/* ---------- fondos pintados de cada estilo ---------- */
function star4(c, x, y, s){ c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill(); }
function paintWorld(c,dark,r){return activeStyle.paintWorld(c,dark,r,{W,H,css,star4,copy});}
/* ---------- la guirnalda de cada estilo ---------- */
function garlandWorld(n,w,y,small){return activeStyle.garlandWorld(n,w,y,small,{rand,el,gsvg});}
/* ---------- aplicar un estilo ---------- */
const worldBtn = $('world-btn'), worldMenu = $('world-menu');
function syncWorldUI(){
  const w = world();
  $('world-name').textContent = WORLDS[w].label;
  worldMenu.querySelectorAll('[data-world]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.world === w)));
  root.querySelectorAll('.try-style').forEach(b => { const a = b.dataset.world === w; b.setAttribute('aria-pressed', String(a)); b.textContent = a ? copy.active : copy.tryStyle; });
}
let busy = false;
async function goWorld(w, after){
 if (busy || !WORLDS[w] || w===world()) {after?.();return;}
 busy=true; closeMenu();
 try {
  const nextStyle=await loadStyle(w);
  const {transition}=await import('./transitions.js');
  await transition(w,{still,css,star4,swap:()=>{activeStyle=nextStyle;applyWorld(w);after?.();}});
 } finally {busy=false;}
}

/* ---------- selector ---------- */
function closeMenu(){ worldMenu.classList.remove('open'); worldBtn.setAttribute('aria-expanded', 'false'); }
worldBtn.addEventListener('click', () => { const o = !worldMenu.classList.contains('open'); worldMenu.classList.toggle('open', o); worldBtn.setAttribute('aria-expanded', String(o)); if (o) worldMenu.querySelector('[aria-pressed=true]')?.focus({preventScroll:true}); });
worldMenu.querySelectorAll('[data-world]').forEach(b => b.addEventListener('click', () => { goWorld(b.dataset.world, () => worldBtn.focus({ preventScroll: true })); }));
document.addEventListener('click', e => { if (!e.target.closest('.world-pick')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && worldMenu.classList.contains('open')) { closeMenu(); worldBtn.focus(); } });
root.querySelectorAll('.try-style').forEach(b => b.addEventListener('click', () => goWorld(b.dataset.world, () => scrollTo({ top: 0, behavior: 'instant' }))));
syncWorldUI();


/* ---------- NEÓN · 7 · carteles de otras fiestas ---------- */

/* =====================================================================
   v5 · 50 MEJORAS: 10 POR ESTILO
   ===================================================================== */
const PARTY_DATE = new Date(2027, 6, 24);
const PIECE_COLORS = { caja: ['#c9973e', '#f6dc94', '#7a2c5e', '#f3c6d6', '#fff4d6'], bar: ['#d6b26a', '#f6dc9c', '#8a5a1c', '#ffffff'], xv: ['#f7a8c4', '#e86a92', '#ffd1e0', '#c94f7c'], espacio: ['#ffd84a', '#ffffff', '#7ff0ff', '#ff7a3d'] };
const PIECE_KINDS = { neon: ['paper'], caja: ['paper', 'glitter', 'glitter'], bar: ['paper', 'glitter'], xv: ['petal'], espacio: ['star', 'star', 'meteor'] };
const COPY = copy.forms;
Object.assign(GLYPHS, { I: 'M50 28V152', L: 'M32 28V152H86', C: 'M86 48C72 22 22 22 18 88C14 150 70 162 88 132' });


/* ---------- sonidos (solo con el zumbido activado) ---------- */
const soundOn = () => ac && $('sound').getAttribute('aria-pressed') === 'true';
function tone(f, d, type = 'sine', g = .06, when = 0){ if (!soundOn()) return; const o = ac.createOscillator(), v = ac.createGain(), t = ac.currentTime + when; o.type = type; o.frequency.value = f; v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(v).connect(ac.destination); o.start(t); o.stop(t + d + .03); }
function noise(d, f, g = .22, when = 0){ if (!soundOn()) return; const len = ac.sampleRate * d | 0, buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = ac.createBufferSource(), bf = ac.createBiquadFilter(), v = ac.createGain(); bf.type = 'bandpass'; bf.frequency.value = f; bf.Q.value = .8; v.gain.value = g; s.buffer = buf; s.connect(bf).connect(v).connect(ac.destination); s.start(ac.currentTime + when); }
const crinkle = () => { for (let i = 0; i < 8; i++) noise(.04 + Math.random() * .05, 2400 + Math.random() * 3200, .25, i * .06 + Math.random() * .03); };
const clink = () => { tone(2350, .55, 'sine', .05); tone(3520, .4, 'sine', .03, .02); };
const beep = (f = 880) => tone(f, .07, 'square', .02);

/* ---------- el nombre según el estilo ---------- */
function build(name, age){
  current = { name, age };
  const wd = world();
  word.textContent = '';
  let i = 0;
  for (const ch of name) { const s = document.createElement('span'); s.textContent = ch; s.className = ch.trim() ? 't' : 'sp'; s.style.setProperty('--i', i++); word.appendChild(s); }
  num.textContent = '';
  let ds = displayAge(age,wd); //   // XV · 6 · números romanos
  num.style.display = ds ? '' : 'none';
  const digits=document.createDocumentFragment();
  const behind = el('g', {}, digits), ends = [];
  if (wd === 'bar' && ds) {                                 // BAR · 5 · números art déco
    const g = el('g', { class: 't' }, num), tx = el('text', { class: 'core deco-num', x: 6, y: 156 }, g);
    tx.textContent = ds;
    let L = ds.length * 84; try { L = tx.getComputedTextLength() || L; } catch {}
    L += 12; num.setAttribute('viewBox', `0 0 ${L} 180`); num.style.width = `calc(21cqi * var(--s) * ${(L / 180).toFixed(3)})`;
  } else {
    const Wd = 104, n = ds.length;
    num.setAttribute('viewBox', `0 0 ${Wd * n} 180`);
    num.style.width = `calc(21cqi * var(--s) * ${(Wd * n / 180).toFixed(3)})`;
    [...ds].forEach((d, k) => {
      const g = el('g', { class: 't', transform: `translate(${k * Wd} 0)` }, digits);
      if (wd === 'neon') el('path', { class: 'core2', d: GLYPHS[d] }, g);   // NEÓN · 9 · doble tubo
      const core = el('path', { class: 'core', d: GLYPHS[d] }, g);
      el('path', { class: 'hl', d: GLYPHS[d] }, g);
      const Lp = core.getTotalLength(), a = core.getPointAtLength(0), b = core.getPointAtLength(Lp);
      core.setAttribute('pathLength', 1);                                   // CAJA · 2 · trazo de pluma
      el('circle', { class: 'cap', cx: a.x, cy: a.y, r: 5.5 }, g);
      if (Math.hypot(a.x - b.x, a.y - b.y) > 4) el('circle', { class: 'cap', cx: b.x, cy: b.y, r: 5.5 }, g);
      ends.push({ a: { x: a.x + k * Wd, y: a.y }, b: { x: b.x + k * Wd, y: b.y } });
    });
    for (let k = 0; k < ends.length - 1; k++) { const p = ends[k].b, r = ends[k + 1].a; el('path', { class: 'behind', d: `M${p.x} ${p.y}C${p.x} 176 ${r.x} 176 ${r.x} ${Math.max(r.y, 150)}` }, behind); }
  }
  num.appendChild(digits);
  tubes = [...word.querySelectorAll('.t'), ...num.querySelectorAll('g.t'), sub];
  sign.setAttribute('aria-label', format(copy.sign, {name,age:ds}).trim());
  sign.dataset.age = ds;
  buildReflect(); updateProps();
  fit();
}

/* ---------- NEÓN · 3 · reflejo en la repisa ---------- */
const reflect = $('reflect');
function buildReflect(){
  reflect.textContent = '';
  if (world() !== 'neon') return;
  const c = tubesBox.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  reflect.appendChild(c); syncReflect();
}
function syncReflect(){
  const c = reflect.firstChild; if (!c) return;
  const src = tubesBox.querySelectorAll('.t'), dst = c.querySelectorAll('.t');
  src.forEach((s, k) => dst[k] && dst[k].classList.toggle('on', s.classList.contains('on')));
  c.style.setProperty('--s', tubesBox.style.getPropertyValue('--s') || 1);
}

/* ---------- NEÓN · 6 · letra rebelde ---------- */
let rebelDone = false;
function rebelLetter(){
  if (rebelDone || world() !== 'neon' || still()) return; rebelDone = true;
  const ls = [...word.querySelectorAll('.t')], t = ls[ls.length - 1]; if (!t) return;
  t.classList.remove('on'); t.classList.add('rebel'); setLit();
  const fix = () => { if (!t.classList.contains('rebel')) return; t.classList.remove('rebel'); t.classList.add('thunk'); strike(t); tone(85, .18, 'sawtooth', .05); setTimeout(() => t.classList.remove('thunk'), 450); };
  t.addEventListener('click', fix, { once: true }); setTimeout(fix, 7000);
}

/* ---------- pluma y cursor de teletipo ---------- */
async function lightName(id, fast){
  if(still()){tubes.forEach(t=>t.classList.add('on'));setLit();return id===run;}
  const wd = world(), nib = $('nib'), writes = wd === 'caja' || wd === 'espacio';
  if (writes) nib.classList.add('show');
  for (const t of tubes.filter(t => t !== sub)) {
    if (id !== run || disposed) { nib.classList.remove('show'); return false; }
    const isNum = t.closest && t.closest('.num');
    flick(t, wd !== 'neon' ? [[2, 0]] : isNum ? P_NUM : P_LETTER);
    if (writes) { const b = t.getBoundingClientRect(), pr = plate.getBoundingClientRect(); nib.style.transform = `translate(${(b.right - pr.left).toFixed(1)}px,${(b.top - pr.top + b.height * (wd === 'caja' ? .62 : .22)).toFixed(1)}px)`; }
    if (wd === 'espacio') beep(700 + Math.random() * 500);
    await sleep(wd === 'caja' ? (fast ? 90 : 150) : wd === 'espacio' ? (fast ? 70 : 95) : fast ? 60 : isNum ? 360 : 140);
  }
  setTimeout(() => nib.classList.remove('show'), 380);
  return id === run;
}

/* ---------- confeti según el estilo ---------- */
function confetti(ox, oy){
  if (still() || !visible) return;
  const wd = world(), cols = PIECE_COLORS[wd] || [css('--tube'), css('--gold'), '#ffffff', css('--tube-core')], kinds = PIECE_KINDS[wd];
  const fromBox = ox != null;
  for (let i = 0; i < 110; i++) pieces.push({ kind: kinds[i % kinds.length], x: fromBox ? ox + (Math.random() - .5) * 30 : sign0.x + (Math.random() - .5) * sign0.w, y: fromBox ? oy : sign0.y - sign0.h * .6 - Math.random() * 60, vx: (Math.random() - .5) * (fromBox ? 7 : 2.2), vy: fromBox ? -4 - Math.random() * 5 : Math.random() * 1.2 - 2.4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .3, w: 4 + Math.random() * 5, h: 2 + Math.random() * 3, c: cols[i % cols.length], tw: Math.random() * 6.28 });
  startFx();
}
function drawPiece(c,p,t){effects?.drawPiece(c,p,t,star4);}
/* ---------- efectos del lienzo por estilo ---------- */
let sparks = [], smokeP = [], shoot = [], lastShoot = 0, lastSpark = 0;
function worldFx(c,t,lit){if(!effects)return;const ctx={world,still,body,W,H,sign0,star4,sparks,smokeP,shoot,lastShoot,emit:on&&ambient()};effects.worldFx(c,t,lit,ctx);({sparks,smokeP,shoot,lastShoot}=ctx);}
/* ---------- cursor: sombra, espejo, chispas, destellos y astronauta ---------- */
function pointerWorld(e, nx, ny){
  const wd = world();
  tubesBox.style.setProperty('--tsx', (-nx * 16).toFixed(1) + 'px'); tubesBox.style.setProperty('--tsy', (8 - ny * 10).toFixed(1) + 'px');
  sign.style.setProperty('--rxn', nx.toFixed(3));
  const pr = plate.getBoundingClientRect();
  if (wd === 'xv') { plate.style.setProperty('--mx', ((e.clientX - pr.left) / pr.width * 100).toFixed(1) + '%'); plate.style.setProperty('--my', ((e.clientY - pr.top) / pr.height * 100).toFixed(1) + '%'); }
  const inside = e.clientX > pr.left && e.clientX < pr.right && e.clientY > pr.top && e.clientY < pr.bottom, now = performance.now();
  if (inside && on && (wd === 'neon' || wd === 'xv') && now - lastSpark > 30) {
    lastSpark = now; const hr = hero.getBoundingClientRect(), x = e.clientX - hr.left, y = e.clientY - hr.top;
    if (wd === 'neon') for (let i = 0; i < 2; i++) sparks.push({ kind: 'spark', x, y, vx: (Math.random() - .5) * 3, vy: -Math.random() * 2.5, s: 1.2 + Math.random() * 1.6, c: Math.random() < .5 ? '#fff' : css('--tube'), t0: now, life: 500 + Math.random() * 300 });
    else {
      let best = null, bd = 1e9;
      for (const t of word.querySelectorAll('.t')) { const b = t.getBoundingClientRect(), d = Math.hypot(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2); if (d < bd) { bd = d; best = b; } }
      if (best && bd < 170) sparks.push({ kind: 'diamond', x: best.left - hr.left + Math.random() * best.width, y: best.top - hr.top + best.height * (.2 + Math.random() * .5), s: 3 + Math.random() * 5, c: '#fff', t0: now, life: 700 });
    }
    startFx();
  }
  if (wd === 'espacio') { const a = $('astro').getBoundingClientRect(); $('astro').classList.toggle('wave', Math.hypot(e.clientX - a.left - a.width / 2, e.clientY - a.top - a.height / 2) < 240); }
}

/* ---------- modo fiesta por estilo ---------- */
function partyWorld(){
  const wd = world();
  if (wd === 'caja') { const g = $('giftbox'); g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop'); crinkle(); const b = g.getBoundingClientRect(), hr = hero.getBoundingClientRect(); setTimeout(() => confetti(b.left - hr.left + b.width / 2, b.top - hr.top), 200); setTimeout(() => g.classList.remove('pop'), 2600); }
  if (wd === 'bar') clink();
  if (wd === 'espacio') { beep(660); setTimeout(() => beep(990), 120); }
}

/* ---------- CAJA · cordón de yute que pasa por el ojal ---------- */
function cordCaja(c, w, h){
  const cq = zone.clientWidth / 100, hx = 5.9 * cq, hy = h - 1.6 * cq + plate.offsetHeight / 2;
  c.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const d = `M${hx + 24} 0C${hx + 30} ${h * .45} ${hx - 34} ${hy - 50} ${hx - 2} ${hy - 4}`;
  el('path', { class: 'jute', d }, c); el('path', { class: 'jute2', d }, c);
  const loop = `M${hx - 2} ${hy - 4}c10 4 9 15 -1 16c-11 -1 -12 -12 -3 -17`;
  el('path', { class: 'jute', d: loop }, c); el('path', { class: 'jute2', d: loop }, c);
}

/* ---------- CAJA · desenvolver jalando el moño ---------- */
const bowBtn = $('bow');
function positionBow(){ const sr = sign.getBoundingClientRect(), zr = zone.getBoundingClientRect(); zone.style.setProperty('--bowy', (sr.top - zr.top + sr.height / 2).toFixed(1) + 'px'); }
function wrapIntro(){ zone.classList.add('is-wrapped'); tubes.forEach(t => t.classList.remove('on')); setLit(); requestAnimationFrame(positionBow); }
async function unwrap(){
  if (!zone.classList.contains('is-wrapped') || zone.classList.contains('is-unwrapping')) return;
  crinkle(); zone.classList.add('is-unwrapping');
  await sleep(still() ? 0 : 760);
  zone.classList.remove('is-wrapped', 'is-unwrapping'); bowBtn.style.transform = ''; sign.style.setProperty('--pull', 0);
  if (on) { const id = ++run; if (still()) { tubes.forEach(t=>t.classList.add('on')); setLit(); } else if (await lightName(id, false)) { strike(sub); scheduleRotation(id); } }
}
let drag = null;
bowBtn.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, m: 0 }; bowBtn.setPointerCapture(e.pointerId); });
bowBtn.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.m = Math.hypot(dx, dy); bowBtn.style.transform = `translate(${(dx * .6).toFixed(1)}px,${(dy * .6).toFixed(1)}px) rotate(${(dx * .12).toFixed(1)}deg)`; sign.style.setProperty('--pull', Math.min(1, drag.m / 90).toFixed(2)); });
bowBtn.addEventListener('pointerup', () => { if (!drag) return; const m = drag.m; drag = null; if (m > 60 || m < 6) unwrap(); else { bowBtn.style.transform = ''; sign.style.setProperty('--pull', 0); } });
bowBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unwrap(); } });

/* ---------- BAR · entrada por la mirilla ---------- */
async function doorIntro(){
  if (still()) return;
  const door = $('door'); zone.classList.add('door-in'); door.classList.remove('peek', 'open');
  tone(110, .09, 'sine', .09); tone(98, .09, 'sine', .09, .2);
  await sleep(450); door.classList.add('peek');
  await sleep(700); door.classList.add('open');
  await sleep(880); zone.classList.remove('door-in'); door.classList.remove('peek', 'open');
}

/* ---------- textos, accesorios y paralaje ---------- */
function worldCopy(){
  const c = COPY[world()];
  root.querySelector('.try').textContent = c.tryT;
  $('nm').placeholder = c.ph;
  const b = $('namer').querySelector('button'); b.firstChild.nodeValue = c.btn + ' ';
}
function updateProps(){
  $('board-name').textContent = format(copy.cocktail,{name:current.name});
  const days = daysToLiftoff(new Date());
  $('countdown').textContent = format(copy.countdown,{n:days});
}
function parallax(){
  if (world() !== 'espacio') return;
  const y = scrollY;
  root.querySelectorAll('.planets .pl').forEach((p, k) => p.style.transform = `translateY(${(-y * [.35, .12, .22][k]).toFixed(1)}px)`);
}
function applyWorld(w){
  body.dataset.world = w; rememberStyle(w);
  stopParty(); syncWorldUI(); worldCopy();
  ++run; sparks = []; smokeP = []; shoot = []; zone.classList.remove('is-wrapped', 'is-unwrapping', 'door-in');
  build(current.name, current.age);
  buildGarland(); paintBase(); seedMotes(); fit();
  if (on) { bulbs.forEach(b => b.classList.add('on')); tubes.forEach(t => t.classList.add('on')); }
  setLit(); status.textContent = format(copy.styleNotice,{style:WORLDS[w].label}); updateAsk();
  parallax();
  if (w === 'caja' && !staticMode) wrapIntro();
  if (on && !still() && w !== 'caja') {tubes.forEach(t=>t.classList.remove('on')); const id=++run; lightName(id,false).then(ok=>{if(ok){strike(sub);scheduleRotation(id);}});}
  startFx();
  if (w === 'bar') doorIntro();
}

/* ---------- XV · color de tus XV ---------- */
root.querySelectorAll('.xv-chips .chip').forEach(b => b.addEventListener('click', () => {
  stopRotation(); body.dataset.xvc = b.dataset.xvc;
  root.querySelectorAll('.xv-chips .chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  rgbCache && Object.keys(rgbCache).forEach(k => delete rgbCache[k]);
  paintBase(); collectSources(); light();
}));

/* ---------- BAR · copa, tocadiscos ---------- */
const glassBtn = $('glass');
const doClink = () => { glassBtn.classList.remove('clink'); void glassBtn.offsetWidth; glassBtn.classList.add('clink'); clink(); };
glassBtn.addEventListener('mouseenter', clink); glassBtn.addEventListener('click', doClink);
$('turntable').addEventListener('click', () => root.querySelector('[data-business-toggle]').click());


/* ---------- ESPACIO · palancas y perilla ---------- */
const LEDS = ['#ffd84a', '#7ff0ff', '#ff7ab6', '#9dff7a'];
let led = 0, kr = 0;
root.querySelectorAll('.c-lever').forEach(b => b.addEventListener('click', () => {
  const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(v)); beep(v ? 1040 : 520);
  if (b.dataset.l === '1') body.classList.toggle('panel-alt', v);
  if (b.dataset.l === '2') plate.classList.toggle('radar-off', !v);
}));
$('knob').addEventListener('click', e => { led = (led + 1) % LEDS.length; kr += 90; plate.style.setProperty('--led', LEDS[led]); e.currentTarget.style.setProperty('--kr', kr + 'deg'); zone.style.setProperty('--led', LEDS[led]); beep(780 + led * 120); });

/* ---------- XV · pista de baile ---------- */
(() => { const g = document.createElement('div'); g.className = 'grid'; for (let i = 0; i < 96; i++) { const t = document.createElement('i'); t.style.setProperty('--d', (-Math.random() * 2.4).toFixed(2) + 's'); g.appendChild(t); } $('floor').appendChild(g); })();
worldCopy();

$('namer').addEventListener('submit', () => zone.classList.remove('is-wrapped', 'is-unwrapping'), true);
placeSwitch();

let previousDark=body.classList.contains('dark');
function syncPolicy(){
 hero.classList.toggle('hero-asleep',!visible||document.hidden);
 reduce=reduced.matches||staticMode;
 $('turntable').setAttribute('aria-label',body.dataset.journeyMotion==='paused'?copy.resume:copy.pause);
 if(still()||!visible||document.hidden){cancelAnimationFrame(fxFrame);clearTimeout(fxTimer);fxRunning=false;stopParty();clearTimeout(rotTimer);++run;if(on&&!zone.classList.contains('is-wrapped')){[...tubes,...bulbs,...chevs].forEach(t=>t.classList.add('on'));setLit();}}
 else {startFx();scheduleRotation(run);}
 const dark=body.classList.contains('dark');if(previousDark!==dark){previousDark=dark;setTheme();}
 hum();
}
const observer=new MutationObserver(syncPolicy);observer.observe(body,{attributes:true,attributeFilter:['class','data-journey-motion']});
const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncPolicy();});visibility.observe(hero);
document.addEventListener('visibilitychange',syncPolicy);reduced.addEventListener('change',syncPolicy);
window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(fxFrame);clearTimeout(fxTimer);fxRunning=false;clearTimeout(rotTimer);stopParty();ac?.suspend();});
window.addEventListener('pageshow',e=>{if(e.persisted){disposed=false;syncPolicy();}});
await idleTask(()=>build('Camila','30'));
await idleTask(buildGarland);
await paintBase();
await idleTask(layout);initialized=true;seedMotes();handoff();updateAsk();
await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
if(world()==='caja'&&!staticMode){on=true;updateSwitch();bulbs.forEach(b=>b.classList.add('on'));wrapIntro();}
else {if(world()==='bar')doorIntro();await ignite(false);}
startFx();
hero.dataset.ready='true';
const cardFonts=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const fonts=e.target.classList.contains('c-bar')?['Poiret One']:e.target.classList.contains('c-xv')?['Pinyon Script']:['Fredoka'];loadFonts(fonts,false).catch(()=>{});cardFonts.unobserve(e.target);}},{rootMargin:'160px'});
root.querySelectorAll('.cover').forEach(c=>cardFonts.observe(c));


}
