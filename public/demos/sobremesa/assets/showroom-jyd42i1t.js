import{Un as e,at as t,r as n,rt as r}from"./three.core-BnyATOTM.js";import{t as i}from"./steam-DozDKHBM.js";var a=[{ml:250,scale:.84,price:85},{ml:500,scale:1,price:145},{ml:1e3,scale:1.16,price:260}],o={no:`12`,name:`Reposo doce`,description:`Café de Chiapas de tueste medio, doce horas en agua fría. Se toma solo, con hielo o con un chorrito de leche de avena. Dura diez días en el refri, si es que llega.`,gem:{body:{glow:`#5a2a0c`,att:`#6b3410`},cap:{glow:`#7a4a1c`,att:`#8d5622`},fire:`#ffb067`,refl:[1,.62,.36],spec:`#ffd2a1`,glass:`#fff1e2`},notes:[{tier:`Primero`,name:`Cacao`,more:`Cacao amargo, nuez tostada, pan de pulque`},{tier:`A la mitad`,name:`Panela`,more:`Panela, ciruela pasa, cajeta`},{tier:`Al final`,name:`Naranja`,more:`Cáscara de naranja, canela, un final seco`}],profile:{hours:12,intensity:.65,trail:.8}},s=e=>`$${e} MXN`,c=2.92,l=e=>Math.min(1,Math.max(0,e)),u=e=>e*e*(3-2*e),d=(e,t,n,r)=>e+(t-e)*(1-Math.exp(-n*r)),f=matchMedia(`(prefers-reduced-motion: reduce)`),p=.6,m=[-.32,0,.38,.72,1],h=1,g=Math.PI*2,_=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 4v16M4 12h16"/><path d="M9.5 6.5 12 4l2.5 2.5M9.5 17.5 12 20l2.5-2.5M6.5 9.5 4 12l2.5 2.5M17.5 9.5 20 12l-2.5 2.5"/></svg>`,v=`<svg class="lx-mini" viewBox="0 0 32 40" aria-hidden="true">
  <defs>
    <linearGradient id="lx-ruby" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b8743a"/><stop offset=".55" stop-color="#6b3410"/><stop offset="1" stop-color="#2e1406"/>
    </linearGradient>
    <linearGradient id="lx-gilt" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a8742c"/><stop offset=".45" stop-color="#f4d99c"/><stop offset="1" stop-color="#8f5f22"/>
    </linearGradient>
  </defs>
  <g class="lx-mini__cap">
    <path d="M11 3.5h10l3 3.8-8 3.9-8-3.9z" fill="url(#lx-ruby)"/>
    <path d="M11 3.5h10l-5 3.6z" fill="#ffffff" opacity=".28"/>
    <rect x="12" y="11.2" width="8" height="3.2" rx=".6" fill="url(#lx-gilt)"/>
  </g>
  <path d="M8.5 15.5h15l4.5 5v11.5l-4.5 5h-15l-4.5-5V20.5z" fill="url(#lx-ruby)"/>
  <path d="M8.5 15.5 16 21l7.5-5.5M16 21v16M4 20.5l12 .5 12-.5" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width=".8"/>
</svg>`,y=`<svg viewBox="0 0 24 34" aria-hidden="true">
  <rect class="lx-glyph__cap" x="9" y="2" width="6" height="5" rx="1.2"/>
  <path class="lx-glyph__neck" d="M10.5 7h3v3h-3z"/>
  <rect class="lx-glyph__body" x="4" y="10" width="16" height="21" rx="5"/>
</svg>`;function b({hours:e},{x0:t,x1:n,top:r,base:i}){let a=t=>(1-Math.exp(-t*2.2))*(.76+.24*Math.exp(-t*.9))/(1+Math.exp((t-e*.72)/1.05)),o=Array.from({length:49},(e,t)=>a(t/48*12)),s=Math.max(...o),c=e=>t+e/12*(n-t),l=e=>i-e/s*(i-r),u=o.map((e,t)=>[c(t/48*12),l(e)]),d=`M${u[0][0].toFixed(1)} ${u[0][1].toFixed(1)}`;for(let e=0;e<u.length-1;e++){let[t,n,r,i]=[u[Math.max(0,e-1)],u[e],u[e+1],u[Math.min(u.length-1,e+2)]],a=[n[0]+(r[0]-t[0])/6,n[1]+(r[1]-t[1])/6],o=[r[0]-(i[0]-n[0])/6,r[1]-(i[1]-n[1])/6];d+=`C${a.map(e=>e.toFixed(1)).join(` `)} ${o.map(e=>e.toFixed(1)).join(` `)} ${r[0].toFixed(1)} ${r[1].toFixed(1)}`}return{d,area:`${d}L${n} ${i}L${t} ${i}Z`,at:e=>[c(e),l(a(e))],X:c}}function x(e,t){let n={x0:2,x1:298,top:24,base:92},r=b(e,n),i=[...o.notes.map((t,n)=>[t.name,[1,3.4,e.hours*.62][n],`middle`])].map(([e,t,n])=>{let[i,a]=r.at(t);return`<g class="lx-chart__phase"><circle cx="${i.toFixed(1)}" cy="${a.toFixed(1)}" r="2.6"/>
        <text x="${i.toFixed(1)}" y="${(a-9).toFixed(1)}" text-anchor="${n}">${e}</text></g>`}).join(``);return`<svg class="lx-chart" viewBox="0 0 300 96" role="img" aria-label="Entra con cacao, se endulza a la mitad y termina en cáscara de naranja.">
    <defs>
      <linearGradient id="${t}-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".88"/><stop offset=".7" stop-color="#ffffff" stop-opacity=".32"/><stop offset="1" stop-color="#ffffff" stop-opacity=".08"/></linearGradient>
    </defs>
    <path class="lx-chart__area" d="${r.area}" fill="url(#${t}-area)"/>
    <path class="lx-chart__line" d="${r.d}" pathLength="1"/>
    <line class="lx-chart__base" x1="${n.x0}" y1="${n.base}" x2="${n.x1}" y2="${n.base}"/>
    ${i}
  </svg>`}function S(e,t){return`<div class="lx-bar">
    <p class="lx-bar__label">${t}<span class="sr-visually-hidden">: ${Math.round(e*10)} de 10</span></p>
    <span class="lx-bar__track" aria-hidden="true"><span class="lx-bar__fill" style="--v:${e}"></span></span>
  </div>`}function C(e,t){let n=o.profile;return`<div class="lx-curve__head"><h3 class="lx-title" id="${t}">Del primer al último trago</h3>
    <p class="lx-curve__hours">${n.hours}<span>horas</span></p></div>
    ${x(n,e)}
    <div class="lx-bars">${S(n.intensity,`Intensidad`)}${S(n.trail,`Dulzor`)}</div>`}function w(e){return a.map((t,n)=>`<button type="button" class="${e}" data-size="${n}" aria-pressed="${n===1}" aria-label="${t.ml} ml, ${s(t.price)}">
      <span class="lx-glyph" style="--h:${(.62+.38*(n/(a.length-1))).toFixed(2)}">${y}</span><span class="lx-size__ml">${t.ml>=1e3?t.ml/1e3:t.ml}<small>${t.ml>=1e3?`l`:`ml`}</small></span></button>`).join(``)}function T(e){let t=e.lastIndexOf(` `);return t<0?e:`${e.slice(0,t)} <em>${e.slice(t+1)}</em>`}function E(){let e=o.notes.map(e=>`<li><small>${e.tier}</small><span>${e.name}</span></li>`).join(``),t=o.notes.map(e=>`<li><small>${e.tier}</small><span>${e.more}</span></li>`).join(``);return`
  <div class="lx-left">
    <section class="lx-card lx-glass lx-size" aria-labelledby="lx-size-title">
      <h3 class="lx-title" id="lx-size-title">Tamaño</h3>
      <div class="lx-size__row" role="group" aria-labelledby="lx-size-title">${w(`lx-size__btn`)}</div>
    </section>
    <section class="lx-card lx-glass lx-curve" aria-labelledby="lxc-title">${C(`lxc`,`lxc-title`)}</section>
  </div>

  <aside class="lx-info lx-glass" aria-labelledby="lx-name"><div class="lx-info__in">
    <p class="lx-title lx-info__no">Cold brew · ${o.no} horas</p>
    <h2 class="lx-info__name" id="lx-name">${T(o.name)}</h2>
    <p class="lx-info__desc">${o.description}</p>
    <ul class="lx-notes" aria-label="Notas de cata">${e}</ul>
    <div class="lx-sizes-inline" role="group" aria-label="Tamaño">${w(`lx-chip`)}</div>
    <p class="lx-price"><span data-f="price"></span><small data-f="ml"></small></p>
    <div class="lx-buy__row">
      <div class="lx-qty" role="group" aria-label="Cantidad">
        <button type="button" data-act="less" aria-label="Una botella menos"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"/></svg></button>
        <output data-f="qty" aria-live="polite">1</output>
        <button type="button" data-act="more" aria-label="Una botella más"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4v8M4 8h8"/></svg></button>
      </div>
      <button type="button" class="lx-add pill" data-act="buy"><span class="pill__label"><span class="lx-add__text">Apartar</span></span><svg class="pill__arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 12.5l9-9M5 3.5h7.5V11"/></svg></button>
    </div>
    <button type="button" class="lx-more" data-act="details" aria-expanded="false" aria-controls="lx-details">Todas las notas</button>
    <div class="lx-details" id="lx-details">
      <ul class="lx-pyramid">${t}</ul>
      <div class="lx-details__curve" aria-labelledby="lxm-title" role="group">${C(`lxm`,`lxm-title`)}</div>
    </div>
  </div></aside>

  <div class="lx-orbit">
    <svg class="lx-orbit__ring" viewBox="0 0 560 96" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <!-- the far side of the orbit fades out behind the bottle, the near side stays lit -->
        <linearGradient id="lx-orbit-fade" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="92">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="0.22" stop-color="#ffffff" stop-opacity="0.1"/>
          <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <ellipse class="lx-orbit__line" cx="280" cy="48" rx="276" ry="44"/>
    </svg>
    <div class="lx-orbit__handle lx-glass" role="slider" tabindex="0" aria-label="Girar la botella" aria-valuemin="0" aria-valuemax="359" aria-valuenow="0" aria-valuetext="De frente">${_}</div>
    <p class="lx-orbit__label" aria-hidden="true">Arrastra para girarla</p>
  </div>

  <button type="button" class="lx-steam lx-glass" data-act="steam" aria-label="Destápala para ver subir el vapor">${v}<span class="lx-hint" aria-hidden="true">Destápala</span></button>

  <div class="lx-zoom" role="group" aria-label="Acercar o alejar">
    <button type="button" class="lx-glass" data-act="zoom-in" aria-label="Acercar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg><span class="lx-hint" aria-hidden="true">Acercar</span></button>
    <button type="button" class="lx-glass" data-act="zoom-out" aria-label="Alejar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg><span class="lx-hint" aria-hidden="true">Alejar</span></button>
  </div>

  <p class="sr-visually-hidden" role="status" data-f="status"></p>`}function D({ctrl:_,deep:v,scene:y,camera:b,plinthTop:x,isMobile:S}){v.group.updateMatrixWorld(!0);let C=new t().copy(v.inner.matrixWorld).invert(),w=(v.parts.Label??v.parts.Collar)?.mesh,T=w?new n().setFromObject(w).applyMatrix4(C).getCenter(new e).y:.5,D=i({count:S()?72:140});y.add(D.mesh);for(let[e,t]of Object.entries({body:v.parts.Body?.mesh.material,cap:v.parts.Cap?.mesh.material})){if(!t)continue;let{gem:n}=o,r=t.userData.gem;r.uGlow.value.set(n[e].glow),r.uFire.value.set(n.fire),r.uTint.value.fromArray(n.refl),t.attenuationColor.set(n[e].att),t.specularColor.set(n.spec),t.color.set(n.glass)}let O=document.createElement(`section`);O.className=`sr`,O.setAttribute(`aria-label`,`La bodega`),O.innerHTML=E(),O.inert=!0,O.setAttribute(`aria-hidden`,`true`),document.body.append(O);let k=e=>O.querySelector(e),A=e=>[...O.querySelectorAll(e)],j=(e,t)=>A(`[data-f="${e}"]`).forEach(e=>e.textContent=t),M=e=>k(`[data-act="${e}"]`),N=document.querySelector(`#scene`),P=document.querySelector(`.nav__bag`),F=document.querySelector(`.nav__badge`),I=k(`.lx-orbit__handle`),L=k(`.lx-orbit`),R=k(`.lx-info`),z={size:1,qty:1,zoom:h,details:!1,bag:0},B={act:0,zoom:0,still:0,scale:a[1].scale,pan:0,yawVel:0,yawTarget:null,clock:0,openedAt:null},V=!1,H=null,U=0;function W(){let e=a[z.size];j(`price`,s(e.price)),j(`ml`,e.ml>=1e3?`${e.ml/1e3} l`:`${e.ml} ml`),j(`qty`,String(z.qty)),A(`[data-size]`).forEach(e=>e.setAttribute(`aria-pressed`,String(Number(e.dataset.size)===z.size))),M(`less`).disabled=z.qty<=1,M(`more`).disabled=z.qty>=9,M(`zoom-in`).disabled=z.zoom>=m.length-1,M(`zoom-out`).disabled=z.zoom<=0,M(`details`).setAttribute(`aria-expanded`,String(z.details)),M(`details`).textContent=z.details?`Menos notas`:`Todas las notas`,O.classList.toggle(`is-details`,z.details)}function G(){let e=a[z.size];z.bag+=z.qty,F&&(F.textContent=String(z.bag)),P?.setAttribute(`aria-label`,`Apartado, ${z.bag} ${z.bag===1?`botella`:`botellas`}`);let t=z.qty;j(`status`,`${t} × ${o.name} ${e.ml} ml apartadas. Es una demostración: no se envía ningún pedido.`);let n=M(`buy`);n.classList.add(`is-added`),n.querySelector(`.lx-add__text`).textContent=`Apartada`,clearTimeout(U),U=setTimeout(()=>{n.classList.remove(`is-added`),n.querySelector(`.lx-add__text`).textContent=`Apartar`},1800)}O.addEventListener(`click`,e=>{let t=e.target.closest(`button`);if(t&&!t.disabled){if(t.dataset.size)z.size=Number(t.dataset.size),W();else{switch(t.dataset.act){case`less`:z.qty=Math.max(1,z.qty-1);break;case`more`:z.qty=Math.min(9,z.qty+1);break;case`zoom-in`:z.zoom=Math.min(m.length-1,z.zoom+1);break;case`zoom-out`:z.zoom=Math.max(0,z.zoom-1);break;case`details`:z.details=!z.details;break;case`steam`:B.openedAt??=B.clock;return;case`buy`:G();return;default:return}W()}}});function K(e,t){H={id:e.pointerId,x:e.clientX,t:performance.now(),k:t,moved:!1},B.yawTarget=null,B.yawVel=0}N.addEventListener(`pointerdown`,e=>{!V||e.button>0||K(e,.009)}),L.addEventListener(`pointerdown`,e=>{!V||e.button>0||(e.preventDefault(),I.focus({preventScroll:!0}),L.setPointerCapture?.(e.pointerId),K(e,Math.PI/2/Math.max(80,L.clientWidth/2)),L.classList.add(`is-grabbed`))}),window.addEventListener(`pointermove`,e=>{if(!H||e.pointerId!==H.id)return;let t=e.clientX-H.x,n=performance.now(),r=Math.max(1,n-H.t)/1e3;_.yaw+=t*H.k,B.yawVel=t*H.k/r,H.x=e.clientX,H.t=n,Math.abs(t)>1&&!H.moved&&(H.moved=!0,O.classList.add(`has-turned`))});let q=e=>{H&&e.pointerId===H.id&&(H=null,L.classList.remove(`is-grabbed`))};window.addEventListener(`pointerup`,q),window.addEventListener(`pointercancel`,q),I.addEventListener(`keydown`,e=>{let t={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:3,PageDown:-3}[e.key];if(t===void 0&&e.key!==`Home`)return;e.preventDefault();let n=B.yawTarget??_.yaw;B.yawTarget=e.key===`Home`?g*Math.round(n/g):n+t*Math.PI/12,B.yawVel=0,O.classList.add(`has-turned`)}),new ResizeObserver(()=>O.style.setProperty(`--sheet-h`,`${R.offsetHeight}px`)).observe(R),W();let J={x:null,y:null,deg:null,behind:null};function Y(e,t,n,i){t=Math.min(Math.max(t,0),.1),B.clock+=t;let o=+(n>=2.919999);B.act=d(B.act,o,3.2,t),Math.abs(B.act-o)<.002&&(B.act=o);let s=B.act,c=s>.5;c!==V&&(V=c,O.classList.toggle(`is-on`,V),O.inert=!V,O.setAttribute(`aria-hidden`,String(!V)),document.documentElement.classList.toggle(`has-showroom`,V),V||(H=null)),O.classList.toggle(`is-lite`,!!i);let h=window.innerWidth<=900;H||(B.yawTarget===null?(B.yawVel*=Math.exp(-t*3),Math.abs(B.yawVel)<.002&&(B.yawVel=0),_.yaw+=B.yawVel*t):(_.yaw=d(_.yaw,B.yawTarget,4,t),Math.abs(_.yaw-B.yawTarget)<.002&&(_.yaw=B.yawTarget,B.yawTarget=null))),V||(B.openedAt=null);let y=B.openedAt===null?-1:B.clock-B.openedAt,b=f.matches?1.6:3.1,S=l(y/p)*(1-l((y-b)/p));if(v.setCapOff(u(S)*s),y>=b+p&&(B.openedAt=null),B.zoom=d(B.zoom,m[z.zoom],3,t),B.still=d(B.still,H||S>0||B.yawTarget!==null?1:0,3,t),B.scale=d(B.scale,a[z.size].scale,4,t),B.pan=d(B.pan,h&&!z.details?.15:0,3,t),_.offset.set(0,0,0),_.zoom=B.zoom*s,_.still=B.still*s,_.pan=B.pan*s,_.scale=B.scale,_.focusY=x+T*B.scale,V){let e=L.clientWidth,t=L.querySelector(`.lx-orbit__ring`).clientHeight,n=(_.yaw%g+g)%g,i=e/2+(e/2-2)*(276/280)*Math.sin(n),a=t/2+t/2*(44/48)*Math.cos(n);(Math.abs(i-J.x)>.3||Math.abs(a-J.y)>.3||J.x===null)&&(J.x=i,J.y=a,I.style.transform=`translate(${i.toFixed(1)}px, ${a.toFixed(1)}px)`);let o=Math.cos(n)<0;o!==J.behind&&(J.behind=o,I.classList.toggle(`is-behind`,o));let s=Math.round(r.radToDeg(n))%360;s!==J.deg&&(J.deg=s,I.setAttribute(`aria-valuenow`,String(s)),I.setAttribute(`aria-valuetext`,s===0?`De frente`:`${s} grados`))}}function X(){D.update(B.openedAt===null?-1:B.clock-B.openedAt-.4,v.mouth)}function Z(e,t,n){let i=t*n/(2*Math.tan(r.degToRad(b.fov/2)));D.uniforms.uPx.value=i,J={x:null,y:null,deg:null,behind:null}}return{update:Y,post:X,resize:Z,onAt:c,get on(){return V},state:z,anim:B,ctrl:_}}export{D as createShowroom};