const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./agua-03Z9pg_z.js","./three.core-BnyATOTM.js","./BufferGeometryUtils-jD_E6XKo.js","./fx-CuyCxU8j.js","./aire-Zw6DUGgG.js"])))=>i.map(i=>d[i]);
import{Cn as e,Hn as t,Kn as n,St as r,ot as i,yt as a,z as o}from"./three.core-BnyATOTM.js";import{n as s,t as c}from"./preload-helper-IQOi9ru3.js";var l=7,u=window.matchMedia(`(prefers-reduced-motion: reduce)`);function d(e,t){for(let n=e instanceof Element?e:null;n&&n!==document.body;n=n.parentElement){if(n.scrollHeight<=n.clientHeight+1)continue;let e=getComputedStyle(n).overflowY;if((e===`auto`||e===`scroll`)&&(t<0?n.scrollTop>0:n.scrollTop+n.clientHeight<n.scrollHeight-1))return!0}return!1}function f({isLocked:e}){let t=()=>Math.max(0,document.documentElement.scrollHeight-window.innerHeight),n=e=>Math.min(t(),Math.max(0,e)),r=window.scrollY,i=window.scrollY,a=!1;function o(){a=!1,r=i=window.scrollY}window.addEventListener(`wheel`,t=>{if(u.matches||e()||t.ctrlKey)return;let o=t.deltaY;Math.abs(t.deltaX)>Math.abs(o)||(t.deltaMode===1?o*=16:t.deltaMode===2&&(o*=window.innerHeight),d(t.target,o)||(t.preventDefault(),a||(r=i=window.scrollY),r=n(r+o),a=!0))},{passive:!1}),window.addEventListener(`keydown`,o),window.addEventListener(`touchstart`,o,{passive:!0}),window.addEventListener(`pointerdown`,e=>{e.pointerType===`mouse`&&e.clientX>=document.documentElement.clientWidth&&o()});function s(e){if(!a)return;let t=1-Math.exp(-Math.min(Math.max(e,0),.1)*l);i+=(r-i)*t,Math.abs(r-i)<.5&&(i=r,a=!1),window.scrollTo(0,i)}function c(e){if(u.matches)return window.scrollTo(0,n(e));a||(i=window.scrollY),r=n(e),a=!0}return{update:s,to:c,stop:o}}var p={uniforms:{tDiffuse:{value:null},tAlt:{value:null},uMode:{value:0},uCenter:{value:new t(.5,.5)},uRadius:{value:0},uLine:{value:-.2},uAspect:{value:1},uTime:{value:0},uGrade:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform sampler2D tAlt;
    uniform int uMode;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uLine;
    uniform float uAspect;
    uniform float uTime;
    uniform float uGrade;
    varying vec2 vUv;
    void main() {
      float k;
      float rim;
      vec2 off;
      if (uMode == 0) {
        // ring: the ripple keeps widening until it is the frame
        vec2 d = (vUv - uCenter) * vec2(uAspect, 1.0);
        float r = length(d);
        float e = r - uRadius;
        rim = exp(-pow(e / 0.03, 2.0));
        off = (d / max(r, 1e-4)) * vec2(1.0 / uAspect, 1.0) * rim * 0.018 * sin(e * 140.0 - uTime * 3.0);
        k = 1.0 - smoothstep(-0.01, 0.01, e);
      } else {
        // water line: the camera slips under the surface
        float wob = 0.012 * sin(vUv.x * 13.0 + uTime * 1.7) + 0.006 * sin(vUv.x * 31.0 - uTime * 2.3);
        float e = vUv.y - (uLine + wob);
        rim = exp(-pow(e / 0.012, 2.0));
        off = vec2(0.0, rim * 0.025);
        k = 1.0 - smoothstep(-0.004, 0.004, e);
      }
      vec3 base = texture2D(tDiffuse, vUv - off).rgb;
      // the second scene's lens: a faint chromatic fringe and a vignette
      vec2 dc = vUv - 0.5;
      vec2 ca = dc * 0.005 * uGrade;
      vec3 alt = vec3(texture2D(tAlt, vUv + off + ca).r, texture2D(tAlt, vUv + off).g, texture2D(tAlt, vUv + off - ca).b);
      float rn = length(dc * vec2(uAspect, 1.0)) / length(vec2(uAspect, 1.0) * 0.5);
      alt *= 1.0 - uGrade * 0.45 * smoothstep(0.3, 1.05, rn);
      vec3 c = mix(base, alt, k) + rim * vec3(1.0, 0.92, 0.94) * 0.32;
      gl_FragColor = vec4(c, 1.0);
    }`};function m(e,t,n){let r=document.createElement(e);return t&&(r.className=t),n&&(r.innerHTML=n),r}async function h(t,l){let{renderer:u,composer:d}=l,h=await(t===`agua`?await c(()=>import(`./agua-03Z9pg_z.js`),__vite__mapDeps([0,1,2,3]),import.meta.url):await c(()=>import(`./aire-Zw6DUGgG.js`),__vite__mapDeps([4,1,3]),import.meta.url)).createChapters(l),g=h.length,_=l.lead??0,v=_+g,y=new URLSearchParams(location.search),b=y.has(`p`)?parseFloat(y.get(`p`)):null,x=document.documentElement;x.classList.add(`has-story`,`story-locked`),x.dataset.story=t;let S=m(`div`,`story-track`);S.style.height=`${(v+1)*100}vh`,S.setAttribute(`aria-hidden`,`true`),document.body.append(S),window.scrollTo(0,0);let C=b!==null,w=()=>{C||(C=!0,x.classList.remove(`story-locked`))};C&&x.classList.remove(`story-locked`);let T=()=>Math.max(1,document.documentElement.scrollHeight-window.innerHeight),E=f({isLocked:()=>!C}),D=e=>{w(),requestAnimationFrame(()=>E.to(Math.ceil(e/v*T())))};document.querySelector(`.brand`)?.addEventListener(`click`,e=>{e.preventDefault(),D(0)}),document.querySelector(`.nav__bag`)?.addEventListener(`click`,e=>{e.preventDefault(),D(v)});let O=new n(2,2,{type:o,samples:l.samples??4}),k=new s(p);k.uniforms.tAlt.value=O.texture,k.uniforms.uMode.value=h.mode,k.uniforms.uGrade.value=+(h.mode===1),k.enabled=!1,d.insertPass(k,1);let A=b===null?0:_+b,j=b??0,M={k:0};function N(e){if(b!==null)return;E.update(e);let t=C?window.scrollY/T()*v:0,n=1-Math.exp(-Math.min(Math.max(e,0),.1)*5),r=(t-A)*n;r=Math.max(-.08,Math.min(.08,r)),A+=r,Math.abs(t-A)<1e-4&&(A=t),j=Math.max(0,A-_)}function P(e,t){M=h.update(j,e,t),k.uniforms.uTime.value=e}function F(){let e=M.k;return k.enabled=e>0,e>0&&(k.uniforms.uRadius.value=M.radius??0,k.uniforms.uLine.value=M.line??-.2,M.center&&k.uniforms.uCenter.value.copy(M.center),h.alt.camera.updateMatrixWorld(),u.setRenderTarget(O),u.setClearColor(0,1),u.clear(),u.render(h.alt.scene,h.alt.camera),u.setRenderTarget(null)),e<1}function I(e){O.samples=e,O.dispose()}function L(t){t(h.alt.scene),u.setRenderTarget(O);let n=u.compileAsync(h.alt.scene,h.alt.camera),o=new e;o.add(new i(new r(2,2),k.material)),u.setRenderTarget(d.renderTarget1);let s=u.compileAsync(o,new a(-1,1,1,-1,0,1));return u.setRenderTarget(null),[n,s]}function R(e,t,n){O.setSize(Math.max(2,Math.round(e*n)),Math.max(2,Math.round(t*n))),k.uniforms.uAspect.value=e/t,h.resize(e,t)}return{update:P,scroll:N,unlock:w,goTo:D,prepare:F,resize:R,setSamples:I,precompile:L,N:g,lead:_,showroom:h.showroom??null,get glow(){return M.glow??0},get lead01(){return _?Math.min(1,Math.max(0,A/_)):1},get q(){return A},get p(){return j}}}export{h as createStory};