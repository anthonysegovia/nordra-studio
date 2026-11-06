import './transitions.css';
// Timings, curves and drawings ported from the approved v5 reference.
export async function transition(w,{still,css,star4,swap}){
const veil = document.getElementById('bs-veil'), vfx = document.getElementById('bs-vfx'), vctx = still()?null:vfx.getContext('2d');
let vparts = [], vrun = false;
const ani = (e, kf, o) => e.animate(kf, Object.assign({ fill: 'forwards' }, o)).finished;
function V(cls, html){ const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; veil.appendChild(d); return d; }
function vloop(){
  if (!vrun) { vrun = true; requestAnimationFrame(function f(t){
    const d = Math.min(devicePixelRatio || 1, 2); if (vfx.width !== innerWidth * d) { vfx.width = innerWidth * d; vfx.height = innerHeight * d; }
    vctx.setTransform(d, 0, 0, d, 0, 0); vctx.clearRect(0, 0, innerWidth, innerHeight);
    vparts = vparts.filter(p => (p.age = t - p.t0) < p.life);
    for (const p of vparts) p.draw(vctx, p.age / p.life);
    if (vparts.length) requestAnimationFrame(f); else { vrun = false; vctx.clearRect(0, 0, innerWidth, innerHeight); }
  }); }
}
function sparkles(){
  const cx = innerWidth / 2, cy = innerHeight / 2, t0 = performance.now();
  for (let i = 0; i < 140; i++) {
    const a0 = Math.random() * 6.28, r0 = Math.random() * 40, sp = (Math.random() * .5 + .7) * Math.max(innerWidth, innerHeight) * .6, s = 2 + Math.random() * 5, col = Math.random() < .5 ? '#ffffff' : '#c9bbff';
    vparts.push({ t0: t0 + Math.random() * 300, life: 1100, draw(c, k){ if (k < 0) return; const a = a0 + k * 3.2, r = r0 + sp * k; c.globalAlpha = Math.sin(k * Math.PI); c.fillStyle = col; star4(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8, s * (1 - k * .4)); c.globalAlpha = 1; } });
  }
  vloop();
}
function smoke(x, y, big){
  const t0 = performance.now(), R = Math.max(innerWidth, innerHeight) * (big ? .32 : .16) * (.7 + Math.random() * .6), dx = (Math.random() - .5) * 60, dy = (Math.random() - .5) * 60;
  vparts.push({ t0, life: 1300, draw(c, k){ const r = 10 + R * Math.min(1, k * 2.2); c.globalAlpha = Math.min(1, (1 - k) * 1.6) * .95; const g = c.createRadialGradient(x + dx * k, y + dy * k, 0, x + dx * k, y + dy * k, r); g.addColorStop(0, '#f4f6fb'); g.addColorStop(.6, '#dfe4f0'); g.addColorStop(1, 'rgba(223,228,240,0)'); c.fillStyle = g; c.beginPath(); c.arc(x + dx * k, y + dy * k, r, 0, 6.3); c.fill(); c.globalAlpha = 1; } });
  vloop();
}
const ROCKET = '<svg viewBox="0 0 54 80" width="120" height="178"><path d="M27 2C40 14 42 34 38 54H16C12 34 14 14 27 2Z" fill="#f4f4f8"/><path d="M27 2C33 8 36 14 37 20H17C18 14 21 8 27 2Z" fill="#ff5a5f"/><circle cx="27" cy="32" r="6" fill="#22d3c5" stroke="#14213d" stroke-width="2"/><path d="M16 42 6 58l11-3M38 42l10 16-11-3" fill="#ff5a5f"/><path d="M20 56c2 10 5 16 7 20 2-4 5-10 7-20Z" fill="#ffb02e"/></svg>';
const BOW = '<svg viewBox="0 0 220 140" width="220" height="140"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc94"/><stop offset=".6" stop-color="#c9973e"/><stop offset="1" stop-color="#8a5f18"/></linearGradient></defs><path d="M110 70C80 20 20 10 18 50s50 40 92 20Z" fill="url(#bg1)" stroke="#7a4f12" stroke-width="2"/><path d="M110 70c30-50 90-60 92-20s-50 40-92 20Z" fill="url(#bg1)" stroke="#7a4f12" stroke-width="2"/><path d="M104 74 70 136l18-6 8 10 14-62M116 74l34 62-18-6-8 10-14-62" fill="url(#bg1)" stroke="#7a4f12" stroke-width="2"/><rect x="96" y="56" width="28" height="28" rx="9" fill="#e8c06a" stroke="#7a4f12" stroke-width="2"/></svg>';
const TRANSITIONS = {
  async neon(swap){
    const b = V('v-black');
    await ani(b, [{ opacity: 0 }, { opacity: .9, offset: .35 }, { opacity: .15, offset: .5 }, { opacity: 1, offset: .75 }, { opacity: 1 }], { duration: 440, easing: 'linear' });
    swap();
    await ani(b, [{ opacity: 1 }, { opacity: .35, offset: .15 }, { opacity: .9, offset: .3 }, { opacity: .1, offset: .55 }, { opacity: .7, offset: .7 }, { opacity: 0 }], { duration: 620, easing: 'linear' });
  },
  async caja(swap){
    const l = V('v-half l'), r = V('v-half r'), v = V('v-ribbon'), h = V('v-ribbon h'), bow = V('v-bow', BOW);
    [v, h, bow].forEach(e => e.style.opacity = 0);
    const ease = 'cubic-bezier(.6,0,.4,1)';
    await Promise.all([ani(l, [{ transform: 'translateX(-101%)' }, { transform: 'none' }], { duration: 300, easing: ease }), ani(r, [{ transform: 'translateX(101%)' }, { transform: 'none' }], { duration: 300, easing: ease })]);
    await Promise.all([ani(v, [{ opacity: 1, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 140 }), ani(h, [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], { duration: 140 }), ani(bow, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 140, easing: 'cubic-bezier(.3,1.6,.5,1)' })]);
    swap();
    await Promise.all([ani(bow, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'translateY(-60vh) scale(.6) rotate(25deg)' }], { duration: 200, easing: 'ease-in' }), ani(v, [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'translateY(-115%)' }], { duration: 200, easing: 'ease-in' }), ani(h, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 })]);
    await Promise.all([ani(l, [{ transform: 'none' }, { transform: 'translateX(-101%) rotate(-4deg)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.3,1)' }), ani(r, [{ transform: 'none' }, { transform: 'translateX(101%) rotate(4deg)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.3,1)' })]);
  },
  async bar(swap){
    const i = V('v-iris');
    await ani(i, [{ clipPath: 'circle(0% at 50% 50%)', transform: 'rotate(-40deg)' }, { clipPath: 'circle(72% at 50% 50%)', transform: 'rotate(0deg)' }], { duration: 480, easing: 'cubic-bezier(.6,0,.3,1)' });
    swap();
    await ani(i, [{ clipPath: 'circle(72% at 50% 50%)', transform: 'rotate(0deg)' }, { clipPath: 'circle(0% at 50% 50%)', transform: 'rotate(40deg)' }], { duration: 560, easing: 'cubic-bezier(.5,0,.3,1)' });
  },
  async xv(swap){
    const c = V('v-curtain'); sparkles();
    await ani(c, [{ transform: 'translateY(-102%)' }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.6,0,.3,1)' });
    swap();
    await ani(c, [{ transform: 'none' }, { transform: 'translateY(-102%)' }], { duration: 560, delay: 60, easing: 'cubic-bezier(.5,0,.25,1)' });
  },
  async espacio(swap){
    const s = V('v-space'), cnt = V('v-count'), fog = V('v-fade'), rk = V('v-rocket', ROCKET);
    s.style.opacity = 0; fog.style.cssText = 'background:#e9ecf5;opacity:0'; rk.style.opacity = 0;
    ani(s, [{ opacity: 0 }, { opacity: .82 }], { duration: 220 });
    for (const n of [3, 2, 1]) { cnt.textContent = n; await ani(cnt, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .4 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }], { duration: 115, fill: 'none' }); }
    cnt.remove();
    const W0 = innerWidth, H0 = innerHeight, t0 = performance.now(), D = 420;
    rk.style.opacity = 1;
    await new Promise(res => requestAnimationFrame(function f(t){
      const k = Math.min(1, (t - t0) / D), e = k * k * (3 - 2 * k), x = -.1 * W0 + 1.25 * W0 * e, y = 1.1 * H0 - 1.3 * H0 * e;
      rk.style.transform = `translate(${x}px,${y}px) rotate(42deg)`;
      smoke(x - 30, y + 40, k > .2);
      fog.style.opacity = Math.max(0, (k - .45) / .55);
      if (k < 1) requestAnimationFrame(f); else res();
    }));
    swap(); s.remove(); rk.remove();
    await ani(fog, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' });
  }
};

try {
 veil.textContent="";veil.classList.add("on");veil.dataset.transition=still()?"fade":w;
 if(still()){const f=V("v-fade");f.style.background=css("--bg");await ani(f,[{opacity:0},{opacity:1}],{duration:140});swap();f.style.background=css("--bg");await ani(f,[{opacity:1},{opacity:0}],{duration:160});}
 else await TRANSITIONS[w](swap);
}finally{vparts=[];veil.classList.remove("on");veil.textContent="";vctx?.clearRect(0,0,vfx.width,vfx.height);}

}
