import{Un as e,a as t,f as n,o as r,wn as i,wt as a}from"./three.core-BnyATOTM.js";var o=matchMedia(`(prefers-reduced-motion: reduce)`),s=`
attribute vec4 aSeed;
uniform float uU;
uniform float uWave;
uniform vec3 uOrigin;
uniform float uPx;
varying float vA;
varying float vAge;
void main() {
  float birth = aSeed.x * 0.7;
  float a = (uU - birth) / 0.6;
  vAge = a;
  if (a <= 0.0 || a >= 1.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vA = 0.0;
    return;
  }
  float e = 1.0 - pow(1.0 - a, 2.2); // fast out of the nozzle, then drifting
  float ang = aSeed.y * 6.2832 + uWave * a * (1.8 + aSeed.w * 1.4);
  float rad = 0.004 + e * (0.024 + aSeed.z * 0.055);
  vec3 p = uOrigin;
  p.y += e * ((0.24 + aSeed.w * 0.25) * (0.65 + 0.35 * uWave));
  p.x += cos(ang) * rad;
  p.z += sin(ang) * rad;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = 0.038 + e * (0.072 + aSeed.z * 0.065);
  gl_PointSize = clamp(size * uPx / -mv.z, 1.0, 60.0);
  vA = smoothstep(0.0, 0.08, a) * (1.0 - smoothstep(0.35, 1.0, a)) * (0.45 + 0.55 * aSeed.w);
}`,c=`
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uStrength;
varying float vA;
varying float vAge;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r2 = dot(d, d) * 4.0;
  float g = exp(-r2 * 4.0) * (1.0 - smoothstep(0.7, 1.0, r2));
  vec3 c = mix(uColA, uColB, smoothstep(0.0, 0.7, vAge));
  float a = g * vA * uStrength;
  if (a < 0.003) discard;
  gl_FragColor = vec4(c, a);
}`,l=e=>{let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)};function u({count:u=260}={}){let d=new r,f=new Float32Array(u*4);for(let e=0;e<f.length;e++)f[e]=l(e*1.91+4.3);d.setAttribute(`position`,new t(new Float32Array(u*3),3)),d.setAttribute(`aSeed`,new t(f,4));let p=new i({uniforms:{uU:{value:0},uWave:{value:1},uOrigin:{value:new e},uPx:{value:1},uStrength:{value:.65},uColA:{value:new n(`#d6b089`)},uColB:{value:new n(`#fff6ea`)}},vertexShader:s,fragmentShader:c,transparent:!0,depthWrite:!1}),m=new a(d,p);m.frustumCulled=!1,m.renderOrder=3,m.visible=!1;function h(e,t){let n=e*1.3/(o.matches?1.2:2.7);m.visible=n>0&&n<1.3,m.visible&&(p.uniforms.uWave.value=+!o.matches,p.uniforms.uU.value=n,t.getWorldPosition(p.uniforms.uOrigin.value))}return{mesh:m,update:h,uniforms:p.uniforms}}export{u as t};