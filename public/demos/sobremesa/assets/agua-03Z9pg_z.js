import{B as e,Cn as t,E as n,En as r,Et as i,F as a,H as o,Hn as s,K as c,Kn as l,M as u,O as d,St as f,U as p,Un as m,V as h,Wn as g,X as _,Z as v,_ as y,at as b,bt as x,f as S,ft as C,hn as w,i as T,l as E,o as D,ot as O,pt as k,st as A,u as j,wn as M,xt as ee,yt as te}from"./three.core-BnyATOTM.js";import{i as ne,n as N,r as P,t as F}from"./BufferGeometryUtils-jD_E6XKo.js";import{a as I,i as re,n as ie,o as L,r as R,s as z,t as B}from"./fx-CuyCxU8j.js";var ae=`
attribute vec4 aSeed;
attribute vec4 aSeed2;
uniform float uTime;
uniform float uFogDensity;
uniform float uSurface;
varying vec2 vUv;
varying float vAlpha;
varying float vFog;
varying float vBig;

float bubbleRadius(float h) {
  return 0.0025 + 0.019 * h * h * h; // mostly tiny, a few big
}

// zig-zag of a rising bubble (bigger ones spiral wider and slower)
vec3 wander(float age, float r, vec4 s) {
  float big = smoothstep(0.006, 0.016, r);
  float w = mix(9.0, 5.0, big) + s.y * 3.0;
  float amp = mix(0.004, 0.018, big) * (0.6 + s.z);
  return vec3(sin(age * w + s.x * 6.28) * amp, 0.0, cos(age * w * 0.8 + s.w * 6.28) * amp * 0.7);
}

void emit(vec3 c, float r, float alpha, float age) {
  vUv = position.xy + 0.5;
  // big bubbles are oblate and wobble
  float big = smoothstep(0.007, 0.018, r);
  float wob = sin(uTime * (14.0 + aSeed.y * 6.0) + aSeed.x * 40.0) * 0.12 * big;
  vec2 shape = vec2(1.0 + 0.22 * big + wob, 1.0 - 0.2 * big - wob);
  vec4 mv = viewMatrix * vec4(c, 1.0);
  mv.xy += position.xy * 2.0 * r * shape;
  gl_Position = projectionMatrix * mv;
  float d = length(mv.xyz);
  vFog = exp(-pow(uFogDensity * d, 2.0));
  // pop at the surface
  alpha *= 1.0 - smoothstep(uSurface - 0.04, uSurface, c.y);
  vAlpha = alpha;
  vBig = big;
  if (alpha <= 0.001) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}
`,oe={ambient:`
uniform float uFloor;
uniform vec4 uVents[4];
void main() {
  float r = bubbleRadius(aSeed.w);
  float span = uSurface - uFloor;
  float speed = 0.16 + 9.0 * r + aSeed2.x * 0.05;
  float life = span / speed;
  float age = mod(uTime + aSeed.x * 97.0, life);
  // accelerate off the bottom, then rise steady
  float y = uFloor + speed * (age - 0.35 * (1.0 - exp(-age * 2.8)));
  vec3 base;
  int v = int(floor(aSeed2.y * 7.0));
  if (v < 4) {
    vec4 vent = uVents[v];
    base = vec3(vent.x, 0.0, vent.z) + (aSeed2.zxw - 0.5) * vec3(0.05, 0.0, 0.05);
  } else {
    base = vec3((aSeed2.z - 0.5) * 4.4, 0.0, (aSeed2.w - 0.5) * 2.6 - 0.7);
  }
  vec3 c = base + wander(age, r, aSeed);
  c.y = y;
  float alpha = smoothstep(0.0, 0.25, age) * (0.7 + 0.3 * aSeed.z);
  emit(c, r, alpha, age);
}`,burst:`
uniform float uP;
uniform float uPImp;
uniform vec3 uEntry;
uniform vec3 uVel;   // horizontal entry speed (per chapter)
uniform float uDive; // vertical entry speed (per chapter)
uniform float uDragH;
uniform float uDragV;
void main() {
  float r = bubbleRadius(aSeed.w * 0.92);
  // born along the bottle's plunge path, most of them right at the entry
  float u0 = 0.32 * aSeed2.x * aSeed2.x;
  float age = (uP - uPImp - u0) * 3.2; // seconds-ish, scrubbed by the scroll
  if (age <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vAlpha = 0.0; return; }
  vec3 born = uEntry + uVel * (1.0 - exp(-u0 * uDragH)) / uDragH;
  born.y = -uDive * (1.0 - exp(-u0 * uDragV)) / uDragV;
  // a cloud around the bottle, wider the deeper it was dragged
  float ang = aSeed2.y * 6.2832;
  float rad = (0.03 + 0.12 * aSeed2.z) * (0.6 + 0.8 * u0 / 0.32);
  born += vec3(cos(ang) * rad, (aSeed2.w - 0.5) * 0.35 * (0.3 + u0), sin(ang) * rad * 0.8);
  float speed = 0.22 + 11.0 * r;
  // a short push down with the bottle, then the rise
  float y = born.y - 0.12 * (1.0 - exp(-age * 5.0)) * (1.0 - u0 * 2.0) + speed * max(0.0, age - 0.15);
  vec3 c = born + wander(age, r, aSeed) * (1.0 + age * 0.3);
  c.y = y;
  float alpha = smoothstep(0.0, 0.06, age);
  emit(c, r, alpha, age);
}`,leak:`
uniform mat4 uEmit;
uniform float uLeak;
void main() {
  float r = bubbleRadius(aSeed.w * 0.75);
  float speed = 0.2 + 10.0 * r;
  float life = 1.6 + aSeed2.x * 1.4;
  float age = mod(uTime * (0.8 + aSeed2.y * 0.4) + aSeed.x * 31.0, life);
  // from the shoulder and the cap of the bottle
  float ang = aSeed2.z * 6.2832;
  vec3 local = vec3(cos(ang) * 0.055, 0.42 + 0.14 * aSeed2.w, sin(ang) * 0.055);
  vec3 born = (uEmit * vec4(local, 1.0)).xyz;
  vec3 c = born + wander(age, r, aSeed);
  c.y += speed * (age - 0.25 * (1.0 - exp(-age * 4.0)));
  float alpha = uLeak * smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(life * 0.6, life, age));
  emit(c, r, alpha, age);
}`},V=`
uniform vec3 uLight;
uniform vec3 uDark;
uniform vec3 uFog;
varying vec2 vUv;
varying float vAlpha;
varying float vFog;
varying float vBig;
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  float r = length(q);
  if (r > 1.0) discard;
  float edge = 1.0 - smoothstep(0.9, 1.0, r);
  // silvery rim: thin and bright on big bubbles, the whole disc on tiny ones
  float rim = pow(smoothstep(mix(0.2, 0.6, vBig), 0.97, r), 1.5);
  float spec = exp(-pow(length(q - vec2(-0.34, 0.4)) / mix(0.32, 0.2, vBig), 2.0));
  float focus = exp(-pow(length(q - vec2(0.08, -0.52)) / 0.36, 2.0)) * 0.45;
  float lit = clamp(rim * 0.8 + spec + focus, 0.0, 1.0);
  vec3 col = mix(uDark, uLight, lit);
  col += uLight * spec * 0.6;
  float a = (0.07 + rim * 0.62 + spec * 0.85 + focus * 0.6) * edge * vAlpha;
  col = mix(uFog, col, vFog);
  a *= mix(0.25, 1.0, vFog);
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}`,H=e=>{let t=Math.sin(e*78.233+12.9898)*43758.5453;return t-Math.floor(t)};function se(e,{count:t,fog:n,density:r,surface:i=0,extra:a={}}){let s=new f(1,1),c=new p;c.index=s.index,c.setAttribute(`position`,s.getAttribute(`position`));let l=new Float32Array(t*4),u=new Float32Array(t*4),d=e.length*101;for(let e=0;e<l.length;e++)l[e]=H(e*1.37+d),u[e]=H(e*2.71+d+7.7);c.setAttribute(`aSeed`,new o(l,4)),c.setAttribute(`aSeed2`,new o(u,4)),c.instanceCount=t;let m={uTime:{value:0},uFogDensity:{value:r},uSurface:{value:i},uFog:{value:new S(n)},uLight:{value:new S(`#fff6ea`)},uDark:{value:new S(`#4d2d17`)},...a},h=new M({uniforms:m,vertexShader:ae+oe[e],fragmentShader:V,transparent:!0,depthWrite:!1}),g=new O(c,h);return g.frustumCulled=!1,g.renderOrder=2,{mesh:g,uniforms:m}}var U=`
precision highp float;
uniform int uMode;
uniform float uTexel;
varying vec2 vUv;

vec2 h22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float h12(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
float vnoise(vec2 p, float n) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = h12(mod(i, n)), b = h12(mod(i + vec2(1, 0), n));
  float c = h12(mod(i + vec2(0, 1), n)), d = h12(mod(i + vec2(1, 1), n));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// periodic Voronoi with n cells per tile: x = distance to the cell border (cell
// units), y/z = two hashes of the cell
vec3 voro(vec2 uv, float n, float jit) {
  vec2 p = uv * n;
  vec2 ip = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  vec2 mr = vec2(0.0);
  vec2 mc = vec2(0.0);
  for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 c = mod(ip + g, n);
      vec2 r = g + 0.5 + jit * (h22(c) - 0.5) - f;
      float d = dot(r, r);
      if (d < d1) { d1 = d; mr = r; mc = c; }
    }
  float md = 8.0;
  for (int y = -2; y <= 2; y++)
    for (int x = -2; x <= 2; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 c = mod(ip + g, n);
      vec2 r = g + 0.5 + jit * (h22(c) - 0.5) - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 1e-5) md = min(md, dot(0.5 * (mr + r), normalize(dr)));
    }
  return vec3(md, h12(mc + n * 7.0), h12(mc * 1.7 + n + 3.1));
}

vec3 palette(float a, float b) {
  // cream, peach, dusty rose, terracotta pink, with white quartz and rare plum
  vec3 c = mix(vec3(0.98, 0.92, 0.86), vec3(0.95, 0.78, 0.68), smoothstep(0.0, 0.35, a));
  c = mix(c, vec3(0.88, 0.62, 0.58), smoothstep(0.35, 0.65, a));
  c = mix(c, vec3(0.76, 0.47, 0.46), smoothstep(0.78, 0.9, a));
  c = mix(c, vec3(1.0, 0.97, 0.94), step(0.8, b));
  c = mix(c, vec3(0.52, 0.32, 0.38), step(0.955, a));
  return c;
}

// one layer of pebbles: some cells stay empty so the next layer shows through
// x = covered (0..1), y = height, rgb in col
float layer(vec2 uv, float n, float fill, float gap0, float lift, out vec3 col, out float h) {
  vec3 v = voro(uv, n, 0.85);
  float gap = gap0 * (0.6 + 0.9 * v.z);
  float inside = smoothstep(gap, gap + 0.035, v.x) * step(v.y * 0.71 + v.z * 0.29, fill);
  float dome = sqrt(clamp((v.x - gap) / 0.3, 0.0, 1.0));
  vec3 c = palette(v.y, v.z);
  // a little grain inside the pebble and a darker rim where it dips into the matrix
  c *= 0.95 + 0.08 * vnoise(uv * n * 6.0 + v.y * 31.0, n * 6.0);
  c *= mix(0.84, 1.0, smoothstep(gap, gap + 0.14, v.x));
  col = c;
  h = lift + (1.0 - lift) * dome * (0.75 + 0.25 * v.z);
  return inside;
}

vec4 aggregate(vec2 uv) {
  // matrix: fine sand with dark and light specks
  float s1 = vnoise(uv * 512.0, 512.0);
  float s2 = vnoise(uv * 256.0 + 11.0, 256.0);
  vec3 col = vec3(0.80, 0.63, 0.57) * (0.9 + 0.2 * s2);
  col *= 1.0 - 0.45 * smoothstep(0.78, 0.92, s1);
  col = mix(col, vec3(0.95, 0.86, 0.8), smoothstep(0.86, 0.97, s2) * 0.6);
  float h = 0.06 * s2;
  vec3 c; float hl; float k;
  k = layer(uv + vec2(0.37, 0.11), 96.0, 0.9, 0.06, 0.12, c, hl);
  col = mix(col, c, k); h = mix(h, hl * 0.45, k);
  k = layer(uv + vec2(0.71, 0.53), 40.0, 0.78, 0.07, 0.2, c, hl);
  col = mix(col, c, k); h = mix(h, hl * 0.75, k);
  k = layer(uv, 17.0, 0.55, 0.08, 0.25, c, hl);
  col = mix(col, c, k); h = mix(h, hl, k);
  return vec4(col, h);
}

void main() {
  if (uMode == 0) {
    vec4 a = aggregate(vUv);
    gl_FragColor = vec4(pow(a.rgb, vec3(1.0 / 2.2)), a.a);
  } else {
    float e = uTexel;
    float hl = aggregate(vUv - vec2(e, 0.0)).a;
    float hr = aggregate(vUv + vec2(e, 0.0)).a;
    float hd = aggregate(vUv - vec2(0.0, e)).a;
    float hu = aggregate(vUv + vec2(0.0, e)).a;
    vec3 n = normalize(vec3((hl - hr) * 3.5, (hd - hu) * 3.5, 1.0));
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
  }
}
`;function ce(e,n=1024){let r=()=>{let t=new l(n,n,{generateMipmaps:!0,minFilter:v,magFilter:_,wrapS:w,wrapT:w,depthBuffer:!1});return t.texture.anisotropy=Math.min(8,e.capabilities.getMaxAnisotropy()),t},i=r(),a=r(),o=new M({uniforms:{uMode:{value:0},uTexel:{value:1/n}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,fragmentShader:U,depthTest:!1,depthWrite:!1}),s=new O(new f(2,2),o);s.frustumCulled=!1;let c=new t;c.add(s);let u=new te(-1,1,1,-1,0,1),d=e.getRenderTarget(),p=e.toneMapping,m=e.autoClear;e.toneMapping=0,e.autoClear=!0;for(let[t,n]of[[i,0],[a,1]])o.uniforms.uMode.value=n,e.setRenderTarget(t),e.render(c,u);return e.setRenderTarget(d),e.toneMapping=p,e.autoClear=m,o.dispose(),s.geometry.dispose(),{albedo:i.texture,normal:a.texture}}var le=`
float sbH(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sbNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sbH(i), sbH(i + vec3(1, 0, 0)), f.x), mix(sbH(i + vec3(0, 1, 0)), sbH(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(sbH(i + vec3(0, 0, 1)), sbH(i + vec3(1, 0, 1)), f.x), mix(sbH(i + vec3(0, 1, 1)), sbH(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
vec3 sbBump(vec3 surfPos, vec3 n, vec2 dHdxy, float faceDir) {
  vec3 sx = normalize(dFdx(surfPos)); vec3 sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, n); vec3 r2 = cross(n, sx);
  float det = dot(sx, r1) * faceDir;
  return normalize(abs(det) * n - sign(det) * (dHdxy.x * r1 + dHdxy.y * r2));
}
`,ue=ne.lights_fragment_begin.replace(`getDirectionalLightInfo( directionalLight, directLight );`,`getDirectionalLightInfo( directionalLight, directLight );
		#if UNROLLED_LOOP_INDEX == 0
		directLight.color *= sbCaus;
		#endif`);function W(e,{color:t=`#d8b493`,grain:n=1,bump:r=.012,caustic:i=1,scale:a=1,roughness:o=.88,agg:s=null,texScale:c=2.2,normK:l=1,crag:u=!1,polyps:d=!1,sss:f=0,ao:p=null,foot:m=null}={}){let h=new k({color:t,roughness:o}),_={};s&&(_.SB_AGG=``),u&&(_.SB_CRAG=``),d&&(_.SB_POLYP=``),p&&(_.SB_AO=``),m!==null&&(_.SB_FOOT=``),h.defines={...h.defines,..._};let v=Array.from({length:8},(e,t)=>new g(...p?.[t]??[0,0,0,0]));return h.onBeforeCompile=t=>{Object.assign(t.uniforms,{uTime:e,uGrain:{value:n},uBumpK:{value:r},uCaustic:{value:i},uScale:{value:a},uAggA:{value:s?.albedo??null},uAggN:{value:s?.normal??null},uTexScale:{value:c},uNormK:{value:l},uSSS:{value:f},uAO:{value:v},uFoot:{value:m??0}}),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vCW;
varying vec3 vCN;`).replace(`#include <worldpos_vertex>`,`#include <worldpos_vertex>
vCW = (modelMatrix * vec4(transformed, 1.0)).xyz;
vCN = normalize(mat3(modelMatrix) * objectNormal);`),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uTime, uGrain, uBumpK, uCaustic, uScale, uTexScale, uNormK, uSSS, uFoot;
uniform sampler2D uAggA, uAggN;
uniform vec4 uAO[8];
varying vec3 vCW;
varying vec3 vCN;
${B}
${le}`).replace(`#include <color_fragment>`,`#include <color_fragment>
        vec3 sbN = normalize(vCN);
        vec3 sp = vCW * uScale;
        float mottle = sbNoise(sp * 2.5) * 0.6 + sbNoise(sp * 7.0) * 0.4;
        float tone = 0.88 + 0.2 * mottle;
        #ifdef SB_AGG
          // triplanar pebble aggregate, mirrored per axis so the pebbles bulge out on every face
          vec3 sbW = pow(abs(sbN), vec3(4.0));
          sbW /= sbW.x + sbW.y + sbW.z;
          vec3 sbS = sign(sbN);
          sbS += 1.0 - abs(sbS);
          vec3 tp = vCW * uTexScale;
          vec2 uvX = vec2(tp.z * sbS.x, tp.y);
          vec2 uvY = vec2(tp.x * sbS.y, tp.z);
          vec2 uvZ = vec2(-tp.x * sbS.z, tp.y);
          vec4 agg = texture2D(uAggA, uvX) * sbW.x + texture2D(uAggA, uvY) * sbW.y + texture2D(uAggA, uvZ) * sbW.z;
          diffuseColor.rgb *= pow(agg.rgb, vec3(2.2)) * 1.3;
          // crevices between the pebbles
          tone *= mix(0.6, 1.0, smoothstep(0.0, 0.32, agg.a));
        #else
          float gr = sbNoise(sp * 34.0);
          float fleck = sbNoise(sp * 70.0 + 7.0);
          tone += (0.16 * (gr - 0.5) + 0.2 * (sbNoise(sp * 16.0) - 0.5)) * uGrain;
          tone *= 1.0 - 0.5 * uGrain * smoothstep(0.74, 0.9, fleck);
          tone += 0.1 * uGrain * smoothstep(0.82, 0.97, gr);
        #endif
        #ifdef SB_CRAG
          float cr = sbNoise(sp * 1.3) * 0.6 + sbNoise(sp * 3.1) * 0.3 + sbNoise(sp * 9.0) * 0.1;
          float ridge = 1.0 - abs(2.0 * cr - 1.0);
          tone *= 0.62 + 0.55 * ridge;
        #endif
        #ifdef SB_POLYP
          // fade the pits out where they get smaller than a pixel (no moire)
          float pitF = 1.0 - smoothstep(0.25, 0.8, fwidth(vCW.x * 140.0) + fwidth(vCW.y * 140.0));
          float pit = smoothstep(0.6, 0.78, sbNoise(vCW * 140.0)) * pitF;
          tone *= 1.0 - 0.3 * pit;
        #endif
        #ifdef SB_AO
          float occ = 1.0;
          for (int i = 0; i < 8; i++) {
            vec4 o = uAO[i];
            float d = max(length(vCW.xz - o.xy) - o.z, 0.0);
            occ *= 1.0 - o.w * exp(-d * d / 0.03);
          }
          tone *= occ;
        #endif
        #ifdef SB_FOOT
          tone *= mix(0.55, 1.0, smoothstep(0.0, 0.2, vCW.y - uFoot));
        #endif
        diffuseColor.rgb *= tone;
        // caustics: two samples a hair apart give the lines a chromatic fringe.
        // The pattern saturates near its own origin, hence the -250 offset
        // (as in the original shader)
        vec2 cp = vCW.xz * 4.6 + vCW.y * 0.6 - 250.0;
        float cA = caustic(cp, uTime * 0.8);
        float cB = caustic(cp + vec2(0.05, 0.03), uTime * 0.8);
        vec3 cc = pow(vec3(cB, cA, mix(cA, cB, 0.3)), vec3(1.3));
        // full strength on what faces up, still there on the sides
        float causK = smoothstep(-0.6, 0.6, sbN.y) * uCaustic;
        vec3 sbCaus = mix(vec3(1.0), vec3(0.25) + 4.0 * cc, min(causK, 1.0));`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
        #ifdef SB_AGG
          vec3 tX = texture2D(uAggN, uvX).xyz * 2.0 - 1.0;
          vec3 tY = texture2D(uAggN, uvY).xyz * 2.0 - 1.0;
          vec3 tZ = texture2D(uAggN, uvZ).xyz * 2.0 - 1.0;
          tX.xy *= uNormK; tY.xy *= uNormK; tZ.xy *= uNormK;
          tX.x *= sbS.x; tY.x *= sbS.y; tZ.x *= -sbS.z;
          // whiteout blend onto the surface normal
          tX = vec3(tX.xy + sbN.zy, abs(tX.z) * sbN.x);
          tY = vec3(tY.xy + sbN.xz, abs(tY.z) * sbN.y);
          tZ = vec3(tZ.xy + sbN.xy, abs(tZ.z) * sbN.z);
          vec3 wn = normalize(tX.zyx * sbW.x + tY.xzy * sbW.y + tZ.xyz * sbW.z);
          normal = normalize(mat3(viewMatrix) * wn);
        #endif
        float hB = sbNoise(vCW * uScale * 34.0) + 0.5 * sbNoise(vCW * uScale * 80.0);
        #ifdef SB_AGG
          // the baked pebbles carry the relief; the fine grain only adds sparkle
          hB *= 0.2;
        #endif
        #ifdef SB_CRAG
          hB = hB * 0.25 + cr * 6.0;
        #endif
        #ifdef SB_POLYP
          hB = hB * 0.3 - 1.4 * pit;
        #endif
        normal = sbBump(-vViewPosition, normal, vec2(dFdx(hB), dFdy(hB)) * uBumpK * 60.0, faceDirection);`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * (cc * 0.1 * causK + uSSS);`).replace(`#include <lights_fragment_begin>`,ue)},h}function G(e,t,n,r){return 1+n*(Math.sin(e.x*t+r)*Math.sin(e.y*t*1.3+r*1.7)*Math.sin(e.z*t*.9+r*2.3)+.5*Math.sin(e.x*t*2.7+r*3.1)*Math.sin(e.z*t*2.3+e.y*t*1.9))}function de(e,t,n=4){let r=N(new h(e,n)),i=r.attributes.position,a=new m;for(let e=0;e<i.count;e++){a.fromBufferAttribute(i,e);let n=a.clone().normalize();a.multiplyScalar(G(n,2.2,.12,t)*G(n,6.5,.03,t+4)),i.setXYZ(e,a.x,a.y,a.z)}return r.computeVertexNormals(),r}function fe(e,t,n,r=160,i=28){let a=e.computeFrenetFrames(r,!1),o=[],s=[],c=new m,l=new m;for(let s=0;s<=r;s++){let u=s/r;e.getPointAt(u,c);let d=a.normals[s],f=a.binormals[s];for(let e=0;e<=i;e++){let r=e/i*Math.PI*2,a=l.set(0,0,0).addScaledVector(d,Math.cos(r)).addScaledVector(f,Math.sin(r)),s=t(u)*G(new m(Math.cos(r)*1.3,u*9,Math.sin(r)*1.3),1.4,.13,n)*G(a.clone().add(c),9,.025,n+2);o.push(c.x+a.x*s,c.y+a.y*s,c.z+a.z*s)}}for(let e=0;e<r;e++)for(let t=0;t<i;t++){let n=e*(i+1)+t,r=n+i+1;s.push(n,r,n+1,r,r+1,n+1)}let d=new D;return d.setAttribute(`position`,new u(o,3)),d.setIndex(s),d.computeVertexNormals(),d}function pe({half:e,base:t,top:n,foot:r,crown:i,seed:a,tubular:o,radial:s}){return fe(new E([new m(-e-.25,t-.3,.05),new m(-e-.1,t+(n-t)*.3,0),new m(-e*.82,t+(n-t)*.72,-.03),new m(-e*.45,n-.04,0),new m(0,n,.02),new m(e*.45,n-.05,0),new m(e*.84,t+(n-t)*.7,.03),new m(e+.12,t+(n-t)*.28,0),new m(e+.28,t-.3,-.05)]),e=>i+(r-i)*(Math.abs(e-.5)*2)**3.2,a,o,s)}function me(e,t,n){let r=new y(t*.35,t,e,18,30);r.translate(0,e/2,0);let i=r.attributes.position,a=new m;for(let r=0;r<i.count;r++){a.fromBufferAttribute(i,r);let o=a.y/e,s=G(new m(a.x/t,o*5,a.z/t),1.8,.32,n)*G(new m(a.x/t,o*14,a.z/t),2.6,.12,n+1)*G(new m(a.x/t,o*30,a.z/t),3.4,.05,n+2)*(1+.07*Math.sin(o*e*7+n*3)+.04*Math.sin(o*e*17+n));i.setXYZ(r,a.x*s+Math.sin(n)*.12*o*e,a.y,a.z*s)}return r.computeVertexNormals(),r}function K(e){let t=[],n=new m(0,1,0),a=new i,o=new b,s=0,c=(i,l,u,d,f)=>{let p=new y(d*.78,d,u,8,2);p.translate(0,u/2,0),a.setFromUnitVectors(n,l),o.compose(i,a,new m(1,1,1)),p.applyMatrix4(o),t.push(p);let h=i.clone().addScaledVector(l,u);if(f===0){let e=new r(d*.82,8,6);e.translate(h.x,h.y,h.z),t.push(e);return}let g=2+ +(I(e+s++)>.3);for(let t=0;t<g;t++){let n=I(e+s++),r=I(e+s++),i=l.clone();i.x+=(n-.5)*1.3+(t-(g-1)/2)*.55,i.z+=(r-.5)*.7,i.y+=.35,i.normalize(),c(h,i,u*(.74+.15*r),d*.74,f-1)}};c(new m(0,0,0),new m(.05,1,0).normalize(),.08,.024,5);let l=F(t.map(e=>e.toNonIndexed()));return l.computeVertexNormals(),l}function he(e){let t=new f(1,1,64,18),n=t.attributes.position,r=[],i=new S(`#f6e4cc`),a=new S(`#c98a58`),o=new S;for(let t=0;t<n.count;t++){let s=n.getX(t)+.5,c=n.getY(t)+.5,l=(s-.5)*2.3,u=Math.cos(l*17),d=(.1+.9*c)*(1+.035*u*c),f=Math.sin(l)*d*e,p=Math.cos(l)*d*e,m=e*(.36*(1-d*d)*Math.cos(l*.75)**.6+.035*(.5+.5*u)*d);n.setXYZ(t,f,m,p),o.copy(i).lerp(a,.35+.35*(.5-.5*u)+.2*Math.sin(c*26)*c),r.push(o.r,o.g,o.b)}return t.setAttribute(`color`,new u(r,3)),t.computeVertexNormals(),t}function ge(e,{time:t,floor:n,plinthTop:r,mobile:i,renderer:a,texSize:o=1024}){let l=ce(a,o),u=.64,d=[[-1.62,n+.12,.05,.36,[1.25,.82,.9],2.1],[1.78,n+.17,-.42,.4,[1.3,.75,.85],5.4],[-2.25,n+.12,-.7,.3,[1,.9,1],8.2],[2.35,n+.12,.2,.28,[1.2,.7,1],3.3]],p=W(t,{color:`#e4c6a4`,bump:.003,caustic:1,roughness:.62,agg:l,texScale:1.7,normK:.35,ao:[[0,0,u,.5],...d.map(([e,,t,n,r])=>[e,t,n*r[0]*.8,.45]),[-1.22,.02,.08,.35],[1.12,.22,.1,.4]]}),m=W(t,{color:`#f1dcc2`,bump:.005,caustic:.9,agg:l,texScale:1.5,normK:.6,foot:n}),h=W(t,{color:`#f1dcc2`,bump:.005,caustic:.8,agg:l,texScale:1,normK:.7,foot:n+.14}),g=W(t,{color:`#8d6446`,grain:.3,bump:.02,caustic:.35,scale:.6,crag:!0}),_=W(t,{color:`#e3a674`,grain:.2,bump:.004,caustic:.55,scale:1.6,roughness:.72,polyps:!0,sss:.05}),v=(t,n,r,i,a,o=!0)=>{let s=new O(t,n);return s.position.set(r,i,a),s.receiveShadow=o,e.add(s),s},y=v(new f(40,40),p,0,n,0);y.rotation.x=-Math.PI/2;let b=v(new c([new s(0,n-.02),new s(.66,n-.02),new s(.65,n+.02),new s(u,r-.03),new s(.632,r-.008),new s(.61,r),new s(0,r)],96),m,0,0,0);b.castShadow=!0;for(let[e,t,r]of[[.07,-.78,.28],[.14,-1.06,2.6]]){let i=v(new T(9,e+.04,r),m,0,n+(e-.04)/2,t-r/2);i.castShadow=!1}let x=n+.14,w=i?[110,20]:[170,28],E=v(pe({half:1.62,base:x,top:-.32,foot:.55,crown:.2,seed:1.3,tubular:w[0],radial:w[1]}),h,0,0,-1.5);E.castShadow=!1;for(let[e,t,n,r,a,o]of d){let s=v(de(r,o,i?3:4),m,e,t,n);s.scale.set(...a),s.rotation.y=o}let D=v(K(17),_,-1.18,n-.01,.08);D.scale.setScalar(1.25),D.rotation.y=.5;let k=v(K(41),_,-1.32,n+.05,-.12);k.scale.setScalar(.85),k.rotation.y=2.1;let A=v(K(73),_,-1.05,n-.01,.3);A.scale.setScalar(.6),A.rotation.y=4;let j=v(he(.17),new C({vertexColors:!0,roughness:.3,clearcoat:1,clearcoatRoughness:.12,iridescence:1,iridescenceIOR:1.5,iridescenceThicknessRange:[250,650],sheen:.6,sheenColor:new S(`#ffe6c8`),sheenRoughness:.35,side:2}),1.12,n+.04,.22);j.rotation.set(.75,-.45,.08),j.castShadow=!0;for(let e=0;e<(i?10:16);e++){let t=(e%2?1:-1)*(.9+I(e+7)*3.4),r=-3.2-I(e+13)*6.5;v(me(1.2+I(e+29)*2.4,.3+I(e+31)*.45,e*1.7+.4),g,t,n-.1,r,!1)}v(pe({half:1.15,base:n,top:-1.05,foot:.4,crown:.2,seed:4.1,tubular:90,radial:16}),g,.25,0,-6.2,!1);for(let e=0;e<6;e++){let t=(I(e+90)-.5)*9;v(de(.9+I(e+95)*.8,e+20,2),g,t,n-.35,-3.6-I(e+99)*3,!1).scale.y=.7}}var q=new s(.6,1.6),_e=.38,J=.95,ve=.9,Y=-1.85,ye=-2.25,X=new m(.35,0,-.35),be=9,Z=6,xe=.05,Q=new S(`#8a603d`),$=.12;function Se(e,t,n={}){return new M({uniforms:e,vertexShader:`varying vec3 vW; varying vec2 vUv; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:t,fog:!1,...n})}var Ce=`uniform vec3 uDeep, uMid, uTop; varying vec3 vW; void main(){ vec3 d = normalize(vW - cameraPosition); vec3 c = mix(uDeep, uMid, smoothstep(-0.7, 0.05, d.y)); c = mix(c, uTop, smoothstep(0.05, 0.75, d.y)); gl_FragColor = vec4(c, 1.0); }`,we=()=>({uDeep:{value:new S(`#2d190d`)},uMid:{value:Q},uTop:{value:new S(`#efd2ad`)}}),Te=new m(0,.24,-1).normalize();function Ee(e){let n=new t;n.add(new O(new r(10,32,16),Se(we(),Ce,{side:1,depthWrite:!1})));let i=new O(new j(4,32),new A({color:new S(`#ffecd6`).multiplyScalar(1.6)}));i.position.set(0,6,-3),i.lookAt(0,0,0),n.add(i);let a=new P(e),o=a.fromScene(n,.02);return a.dispose(),o.texture}function De({isMobile:i,renderer:o,lowGpu:s}){let c=new t;c.background=Q.clone(),c.fog=new a(Q,$),c.environment=Ee(o),c.environmentIntensity=.42;let l={value:0},u=new O(new r(30,32,16),Se(we(),Ce,{side:1,depthWrite:!1}));c.add(u);let d=new O(new f(60,60),Se({uTime:l,uBright:{value:new S(`#f6dcbd`)},uFog:{value:Q},uDeep:{value:new S(`#4d2c16`)},uDensity:{value:$},uGlare:{value:Te}},`uniform float uTime; uniform vec3 uBright, uFog, uDeep, uGlare; uniform float uDensity; varying vec3 vW;
       ${B}
       void main(){
         vec3 d = normalize(vW - cameraPosition);
         vec2 q = vW.xz;
         float t = uTime;
         // wave slopes
         vec2 g = vec2(
           sin(q.x * 2.3 + q.y * 0.9 + t * 0.9) + 0.5 * sin(q.x * 5.1 - q.y * 3.7 + t * 1.4) + 0.25 * sin(q.x * 11.0 + q.y * 7.0 - t * 2.1),
           cos(q.y * 2.0 - q.x * 1.1 + t * 0.8) + 0.5 * cos(q.y * 4.7 + q.x * 3.3 - t * 1.2) + 0.25 * cos(q.y * 12.0 - q.x * 6.0 + t * 1.8));
         float c = caustic(q * 1.4 + g * 0.08 - 250.0, t * 0.6);
         float up = d.y + 0.06 * (g.x * d.x + g.y * d.z);
         float win = smoothstep(0.55, 0.85, up);
         vec3 mirror = mix(uDeep, uFog, 0.6) * (0.75 + 0.5 * c) + uBright * 0.45 * c * c;
         vec3 sky = uBright * (0.95 + 0.6 * c);
         vec3 col = mix(mirror, sky, win);
         float f = 1.0 - exp(-pow(uDensity * 0.95 * length(vW - cameraPosition), 2.0));
         col = mix(col, uFog, f);
         float gl = max(dot(normalize(d + vec3(g.x, 0.0, g.y) * 0.04), uGlare), 0.0);
         col += uBright * (pow(gl, 70.0) * (2.4 + 2.0 * c) + pow(gl, 14.0) * 0.35) * (1.0 - 0.5 * f);
         gl_FragColor = vec4(col, 1.0);
       }`,{side:2}));d.rotation.x=Math.PI/2,c.add(d),ge(c,{time:l,floor:ye,plinthTop:Y,mobile:i(),renderer:o,texSize:s?512:1024});let p=e=>new M({uniforms:{uTime:l,uSeed:{value:e},uColor:{value:new S(`#ffe9cf`)},uDensity:{value:$}},vertexShader:`uniform float uDensity; varying vec2 vUv; varying float vFade;
        void main(){
          vUv = uv;
          vec3 c = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          vec3 ax = (modelMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
          vec3 side = normalize(cross(normalize(ax), cameraPosition - c));
          float sx = length((modelMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
          vec3 w = c + side * position.x * sx + ax * position.y;
          float dist = length(w - cameraPosition);
          vFade = exp(-pow(uDensity * 0.7 * dist, 2.0));
          gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        }`,fragmentShader:`uniform float uTime; uniform float uSeed; uniform vec3 uColor; varying vec2 vUv; varying float vFade;
        void main(){
          float x = vUv.x * 2.0 - 1.0;
          float core = exp(-x * x * 3.5);
          float streak = 0.62 + 0.38 * sin(vUv.x * 9.0 + uSeed * 40.0 + uTime * 0.25) * sin(vUv.x * 23.0 - uTime * 0.4 + uSeed * 13.0);
          float along = smoothstep(0.45, 0.97, vUv.y);
          float pulse = 0.6 + 0.4 * sin(uTime * 0.5 + uSeed * 6.283);
          gl_FragColor = vec4(uColor * core * streak * along * pulse * vFade * 0.26, 1.0);
        }`,transparent:!0,depthWrite:!1,blending:2,side:2,fog:!1});for(let e=0;e<11;e++){let t=.3+I(e+40)*.7,n=new O(new f(t,5),p(I(e+60)));n.frustumCulled=!1;let r=-2.4+e*.48+I(e+70)*.3;n.position.set(r,-2.3,-.9-I(e+80)*3),n.rotation.z=r*.08,c.add(n)}let m=se(`ambient`,{count:i()?110:190,fog:Q,density:$,extra:{uFloor:{value:ye},uVents:{value:[new g(-1.2,0,-1.25,0),new g(1.22,0,-1.3,0),new g(-.45,0,-2.6,0),new g(1.55,0,-.1,0)]}}});c.add(m.mesh),c.add(new e(`#f6dcbd`,`#4a2c18`,1.05));let h=new n(`#ffe8d0`,2.5);h.position.set(.9,6,1.6),h.castShadow=!0,h.shadow.mapSize.set(1024,1024),Object.assign(h.shadow.camera,{left:-1.9,right:1.9,top:1.9,bottom:-1.9,near:2,far:10}),h.shadow.radius=6,h.shadow.blurSamples=12,c.add(h);let _=new n(`#ffdcbf`,.75);_.position.set(.6,1.2,4),c.add(_);let v=new n(`#ffd3a8`,1);return v.position.set(-2.5,1.5,-3),c.add(v),{scene:c,time:l,ambient:m,lights:{hemi:c.children.find(e=>e.isHemisphereLight),sun:h,fill:_,rim:v}}}function Oe(){return{yaw:0,zoom:0,focusY:-1.35,still:0,pan:0,offset:new m,scale:1,baseYaw:0,rest:0}}async function ke(e){let{scene:t,flowerRoot:n,bottle:r,backdrop:a,envMap:o,isMobile:s,view:c}=e,l=e.hover??0,u=[new ee(new m(0,1,0),0)];r.group.traverse(e=>{e.isMesh&&(e.material.clippingPlanes=u)});let f=ie({count:30,size:.006,speed:.75,envMap:o});t.add(f.mesh);let p=De(e),h=await e.makeProduct();h.setReveal(1),h.inner.position.y=0,p.scene.add(h.group);let g=new x(30,16/9,.05,100),_=Oe(),v={fog:Q.clone(),hemi:p.lights.hemi.color.clone(),hemiG:p.lights.hemi.groundColor.clone(),sun:p.lights.sun.color.clone(),fill:p.lights.fill.color.clone(),rim:p.lights.rim.color.clone()};function y(e,t){Q.copy(v.fog).lerp(e,.3*t),p.scene.fog.color.copy(Q),p.scene.background.copy(Q),p.lights.hemi.color.copy(v.hemi).lerp(e,.22*t),p.lights.hemi.groundColor.copy(v.hemiG).lerp(e,.3*t),p.lights.sun.color.copy(v.sun).lerp(e,.12*t),p.lights.fill.color.copy(v.fill).lerp(e,.25*t),p.lights.rim.color.copy(v.rim).lerp(e,.6*t)}let b=se(`burst`,{count:s()?170:280,fog:Q,density:$,extra:{uP:{value:0},uPImp:{value:1},uEntry:{value:X.clone()},uVel:{value:new m},uDive:{value:1},uDragH:{value:be},uDragV:{value:Z}}});p.scene.add(b.mesh);let S=se(`leak`,{count:s()?36:56,fog:Q,density:$,extra:{uEmit:{value:h.inner.matrixWorld},uLeak:{value:0}}});p.scene.add(S.mesh);let C=(e,t)=>e+J*t-(e+J+ve)*t*t,w=()=>n.position.y+.22+_e,T=()=>w()+J+ve,E=()=>(J+Math.sqrt(J*J+4*T()*w()))/(2*T()),D=new m,O=new m,k=new m,A=new d,j=.6,M=5;function te(){let e=E();j=.22+.5*e,D.set(q.x*e,0,q.y*e),O.copy(X).sub(D),k.set(q.x/.5,0,q.y/.5),M=-(J-2*T()*e)/.5,A.set(.55*e,.6+1.2*e,-1.05*re(e))}function ne(e,t,i,a){if(e<.22){let t=R(z(0,.22,Math.max(0,e)));i.set(0,n.position.y+r.inner.position.y+(_e-l)*t,0),a.set(0,.6*t,0);return}if(e<j){let t=z(.22,.72,e);i.set(q.x*t,C(w(),t),q.y*t),a.set(.55*t,.6+1.2*t,-1.05*re(t));return}let o=e-j,s=(1-Math.exp(-o*be))/be,c=(1-Math.exp(-o*Z))/Z;i.set(D.x+k.x*s,-M*c,D.z+k.z*s);let u=R(z(j+.12,2.6,e));i.x=L(i.x,-O.x,u),i.z=L(i.z,-O.z,u),i.y=L(i.y,Y,u);let d=1.6*c*Z,f=R(z(j+.04,2.45,e)),p=R(z(2.3,3,e));a.set(L(A.x+.25*d,0,f),A.y+.8*d+1.6*f+(.3*Math.sin(t*.25)*(1-_.still)+_.yaw)*p,L(A.z-.35*d,0,f))}let N=new m,P=new m,F=new d,I=new d,B=new i,ae=new m,oe=new m,V=new m,H=new m,U=new m;function ce(e,t,i){te(),ne(e,t,N,F),B.setFromEuler(F),ae.set(0,r.inner.position.y,0).applyQuaternion(B),r.group.position.copy(N).sub(ae).sub(n.position),r.group.rotation.copy(F),r.group.visible=r.group.visible&&e<j+.45,_.rest=R(z(2.3,3,e)),_.baseYaw=F.y-_.yaw*_.rest,h.group.position.copy(N).add(O).addScaledVector(_.offset,_.rest),h.group.rotation.copy(F),h.group.scale.setScalar(L(1,_.scale,_.rest)),h.group.visible=e>j-.02,h.group.updateMatrixWorld(!0);let o=(e-j)*3;f.update(D,o,1),a.uniforms.uSplash.value.set(D.x,D.z,Math.max(o,0),o>0&&o<9?1.7:0);let l=c.dist/4;ne(e-xe,t,P,I);let u=z(j-.12,j,e)*(1-z(j+.15,1.3,e)),d=(2.15+.6*z(j+.2,2,e))*l,m=s()?.05:.18;oe.set(P.x+m*l,P.y+L(.34,.06,u),P.z+d),V.copy(N),V.y+=.26;let v=R(z(.1,.5,e));i.pos.lerp(oe,v),i.look.lerp(V,v);let y=i.pos.y;p.time.value=t;let x=s(),C=R(z(2.1,2.95,e)),w=_.zoom,T=L(x?4.6:3.75,x?1.9:1.3,w);H.set(Math.sin(t*.11)*.04*(1-w),L(Y+(x?.55:.42),_.focusY+.05,w),T),U.set(0,L(Y+(x?.1:.42),_.focusY-(x?.12:0),w),0),H.y-=_.pan,U.y-=_.pan,g.position.copy(i.pos).add(O).lerp(H,C),g.lookAt(V.add(O).lerp(U,C)),i.pos.y<.03&&(i.pos.y=.03),b.uniforms.uTime.value=t,b.uniforms.uP.value=e,b.uniforms.uPImp.value=j,b.uniforms.uEntry.value.copy(X),b.uniforms.uVel.value.copy(k),b.uniforms.uDive.value=M,b.mesh.visible=e>j&&e<j+2.2,S.uniforms.uTime.value=t,S.uniforms.uLeak.value=z(j+.05,j+.25,e)*(1-z(2.35,2.7,e)),S.mesh.visible=S.uniforms.uLeak.value>0,p.ambient.uniforms.uTime.value=t;let E=z(.06,-.06,y);return{k:E<=0?0:E>=1?1:.5,line:-.03+1.1*R(E),glow:z(j+.15,j+.6,e)}}function le(e,t){g.aspect=e/t,g.updateProjectionMatrix()}return{length:3,mode:1,alt:{scene:p.scene,camera:g},showroom:{ctrl:_,deep:h,scene:p.scene,camera:g,plinthTop:Y,floor:ye,setMood:y},nav:[0,1.6,3],update:ce,resize:le}}export{ke as createChapters};