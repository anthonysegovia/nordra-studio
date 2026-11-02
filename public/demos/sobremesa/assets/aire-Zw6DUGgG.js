import{An as e,B as t,Cn as n,E as r,En as i,Hn as a,P as o,Un as s,_ as c,a as l,bt as u,f as d,ft as f,o as p,ot as m,pt as h,r as g,rt as _,u as v,wn as y,wt as b}from"./three.core-BnyATOTM.js";import{a as x,c as S,i as C,n as w,o as T,r as E,s as D}from"./fx-CuyCxU8j.js";var O=new s(.72,1.12,1.05),k=.4,A=2.6,j=`
attribute vec4 aSeed;
uniform float uM;
uniform float uTime;
uniform vec3 uOrigin;
uniform float uPx;
varying float vA;
varying float vAge;
void main() {
  float birth = aSeed.x * 0.55;
  float a = (uM - birth) / 0.55;
  vAge = a;
  if (a <= 0.0 || a >= 1.5) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vA = 0.0;
    return;
  }
  float ang = aSeed.y * 6.2832 + a * (1.4 + aSeed.w * 2.2) + uTime * 0.15 * (aSeed.w - 0.5);
  float rad = 0.012 + a * a * (0.35 + aSeed.z * 1.3);
  vec3 p = uOrigin;
  p.y += pow(a, 1.15) * (1.2 + aSeed.z * 1.1);
  p.x += cos(ang) * rad + sin(a * 3.0 + aSeed.y * 9.0) * 0.06 * a;
  p.z += sin(ang) * rad * 0.8 - a * a * (1.2 + aSeed.w * 2.4);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = 0.014 + a * a * (0.16 + aSeed.w * 0.22);
  gl_PointSize = clamp(size * uPx / -mv.z, 1.0, 200.0);
  vA = smoothstep(0.0, 0.05, a) * (1.0 - smoothstep(0.55, 1.5, a)) * (0.5 + 0.5 * aSeed.z);
}`,M=`
attribute vec4 aSeed;
uniform float uG;
uniform vec3 uDrop;
uniform float uPx;
varying float vA;
varying float vAge;
void main() {
  vec3 dir = normalize(aSeed.xyz - 0.5);
  float f = smoothstep(0.0, 1.0, uG);
  vec3 p = uDrop + dir * (0.03 + aSeed.w * 0.22) * (1.0 - f) + vec3(0.0, 0.06 * (1.0 - f), 0.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((0.02 + 0.05 * aSeed.w) * (1.0 - 0.6 * f) * uPx / -mv.z, 1.0, 80.0);
  vA = smoothstep(0.0, 0.25, uG) * (1.0 - smoothstep(0.7, 1.0, uG));
  vAge = 0.9;
}`,N=`
uniform vec3 uColA;
uniform vec3 uColB;
varying float vA;
varying float vAge;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d) * 4.0;
  float g = exp(-r2 * 3.0) * (1.0 - smoothstep(0.7, 1.0, r2));
  vec3 c = mix(uColA, uColB, smoothstep(0.0, 0.9, vAge));
  float a = g * vA * mix(0.9, 0.4, smoothstep(0.0, 1.0, vAge));
  if (a < 0.003) discard;
  gl_FragColor = vec4(c, a);
}`;function P(e,t,n){let r=new p,i=new Float32Array(e*4);for(let e=0;e<i.length;e++)i[e]=x(e*1.37+9.1);r.setAttribute(`position`,new l(new Float32Array(e*3),3)),r.setAttribute(`aSeed`,new l(i,4));let a=new y({uniforms:{uColA:{value:new d(`#955823`)},uColB:{value:new d(`#efd3ba`)},...n},vertexShader:t,fragmentShader:N,transparent:!0,depthWrite:!1}),o=new b(r,a);return o.frustumCulled=!1,o.renderOrder=3,o}function F({studioEnv:a}){let s=new n,l=new d(`#e7dacf`);s.background=l.clone(),s.fog=new o(l,6,15),s.environment=a,s.environmentIntensity=.55;let u=new m(new i(40,32,16),new y({side:1,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new d(`#f8f2ec`)},uHorizon:{value:l}},vertexShader:`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform vec3 uTop, uHorizon; varying vec3 vDir; void main(){ gl_FragColor = vec4(mix(uHorizon, uTop, smoothstep(0.0, 0.45, vDir.y)), 1.0); }`}));s.add(u);let p=new m(new v(30,64),new h({color:`#e9ddd2`,roughness:.92}));p.rotation.x=-Math.PI/2,p.receiveShadow=!0,s.add(p);let g=new f({color:`#f3e9e0`,roughness:.34,clearcoat:.6,clearcoatRoughness:.25}),_=new f({color:`#efc07a`,metalness:1,roughness:.18,envMapIntensity:1.2}),b=new m(new c(.42,.44,.62,96),g);b.position.y=.31;let x=new m(new c(.52,.53,.035,96),g);x.position.y=.0175;let S=new m(new e(.421,.005,12,160),_);S.rotation.x=Math.PI/2,S.position.y=.6;for(let e of[b,x])e.castShadow=!0,e.receiveShadow=!0;s.add(b,x,S),s.add(new t(`#fcf7f3`,`#c9b5a3`,.9));let C=new r(`#fff1ea`,2.1);C.position.set(-2.2,4.2,2.6),C.castShadow=!0,C.shadow.mapSize.set(1024,1024),Object.assign(C.shadow.camera,{left:-1.5,right:1.5,top:2,bottom:-1,near:.5,far:10}),C.shadow.radius=8,C.shadow.blurSamples=16,C.shadow.bias=-4e-4;let w=new r(`#f7eade`,1.3);w.position.set(2.6,2.2,-3);let T=new r(`#f5e3d4`,.35);return T.position.set(2.5,.8,2.5),s.add(C,w,T),{scene:s,top:.62}}async function I(e){let{scene:t,camera:n,flowerRoot:r,bottle:o,backdrop:c,envMap:l,isMobile:d}=e,p=P(d()?900:1800,j,{uM:{value:0},uTime:{value:0},uOrigin:{value:new s},uPx:{value:1}}),h=P(60,M,{uG:{value:0},uDrop:{value:O.clone()},uPx:{value:1}});t.add(p,h);let v=new f({color:`#ffffff`,roughness:0,metalness:0,transmission:1,ior:1.33,thickness:.05,specularIntensity:1,envMapIntensity:1.8,clearcoat:1,clearcoatRoughness:0});v.envMap=l;let b=new m(new i(1,40,28),v);b.visible=!1,b.renderOrder=2,t.add(b);let x=new y({transparent:!0,depthWrite:!1,blending:2,vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2); float g = pow(max(dot(vN, normalize(vV + vec3(-0.4, 0.6, 0.2))), 0.0), 60.0); gl_FragColor = vec4(vec3(1.0, 0.97, 0.98) * (f * 0.85 + g * 1.6), 1.0); }`}),N=new m(b.geometry,x);N.renderOrder=3,b.add(N);let I=w({count:18,size:.006,speed:.75,envMap:l});t.add(I.mesh);let L=new s(O.x,0,O.z),R=O.clone(),z=F(e),B=await e.makeProduct();B.setReveal(1),B.inner.position.y=0,B.group.position.y=z.top,z.scene.add(B.group);let V=new u(30,16/9,.05,100),H=new g,U=new s,W=new s,G=new a,K=16/9;function q(e,t,r){let i=E(D(.05,1,e)),a=E(D(.8,1.45,e)),s=D(1.75,2.35,e);o.group.position.y=.55*i+2.6*s*s,o.group.rotation.y=.9*i+.8*s,o.setExplode(a+.35*s),o.group.visible=o.group.visible&&s<.999;let l=D(1.05,2.3,e)*1.4;o.group.updateMatrixWorld(!0),H.setFromObject(o.parts.Body.mesh),H.getCenter(U),U.y=H.max.y-.005,p.material.uniforms.uM.value=l,p.material.uniforms.uTime.value=t,p.material.uniforms.uOrigin.value.copy(U),p.visible=l>0&&l<1.85;let u=.85*S(D(.25,1.1,l));c.uniforms.uSkyTint.value.set(1.13,.8,.88,u);let f=D(2,2.27,e),m=D(2.27,A,e);h.material.uniforms.uG.value=f,h.visible=f>0&&f<1,R.x=d()?k:O.x,L.x=R.x,h.material.uniforms.uDrop.value.copy(R);let g=(d()?.05:.04)*C(f);if(b.visible=f>0&&m<1,b.visible){let e=O.y*(1-m*m)+(1-f)*.04,t=1+.45*m;b.position.set(R.x,Math.max(e,g),R.z),b.scale.set(g/Math.sqrt(t),g*t,g/Math.sqrt(t))}let _=(e-A)*4;I.update(L,_,1),c.uniforms.uSplash.value.set(L.x,L.z,Math.max(_,0),_>0&&_<9?1.4:0);let v=E(D(0,1,e)),y=E(D(1,1.9,e)),x=E(D(1.95,2.45,e)),w=E(D(2.6,3.4,e)),j=T(.42*v+.5*y,0,x);r.pos.y+=j,r.look.y+=j-.14*x,r.pos.z*=1+(.1*v+.08*y)*(1-x)-.1*w,r.pos.x+=L.x*.25*w,r.look.x+=L.x*.4*w,r.look.y-=.05*w;let M=C(D(3.05,3.7,e));B.setExplode(1-M),B.group.position.y=z.top+.12*(1-M),B.group.rotation.y=t*.22+1.2*(1-M);let N=d(),P=N?4.6:4,F=N?0:-.62,q=Math.sin(t*.13)*.05;V.position.set(F+q,N?.98:1.02,P*(.9+.1*M)),V.lookAt(F,N?.6:.86,0),n.position.copy(r.pos),n.lookAt(r.look),n.updateMatrixWorld(),W.copy(L).project(n),G.set(W.x*.5+.5,W.y*.5+.5);let J=Math.max(Math.hypot(G.x*K,G.y),Math.hypot((1-G.x)*K,G.y),Math.hypot(G.x*K,1-G.y),Math.hypot((1-G.x)*K,1-G.y)),Y=D(3,3.65,e),X=(J+.06)*Y*Y;return{k:Y<=0?0:Y>=1?1:.5,center:G,radius:X}}function J(e,t){K=e/t,V.aspect=K,V.updateProjectionMatrix();let r=t*Math.min(window.devicePixelRatio,1.75)/(2*Math.tan(_.degToRad(n.fov/2)));p.material.uniforms.uPx.value=r,h.material.uniforms.uPx.value=r}return{length:4,mode:0,alt:{scene:z.scene,camera:V},nav:[0,1.35,4],card:3.8,captions:[{from:-1,to:.55,eyebrow:`Capítulo uno`,title:`La flor`,text:`Nace del agua y se abre al cielo.`},{from:.85,to:1.9,eyebrow:`Capítulo dos`,title:`La esencia`,text:`El frasco se abre y su perfume se vuelve nube.`},{from:2.05,to:2.95,eyebrow:`Capítulo tres`,title:`La gota`,text:`De la bruma nace una sola gota de agua, que vuelve a la superficie.`}],update:q,resize:J}}export{I as createChapters};