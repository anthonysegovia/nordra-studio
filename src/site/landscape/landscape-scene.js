/* Signature Nordra · Paisaje: the isotype as a real massif under an aurora, mirrored by a still lake. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Mesh, Group, PlaneGeometry, SphereGeometry, ExtrudeGeometry,
  ShaderMaterial, Vector3, Vector2, BackSide, Raycaster, Plane, CustomBlending, AddEquation, OneFactor, OneMinusSrcAlphaFactor,
  WebGLRenderTarget, OrthographicCamera, RedFormat, LinearFilter, RepeatWrapping,
} from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import isotypeSource from '../assets/isotipo.svg?raw';
import { landscapePolicy, advanceClock } from './state.js';
import { preparePrograms } from './prepare-programs.js';

const ISOTYPE = { width: 937, height: 358 };
const MOUNTAIN = { width: 40, z: -36, depth: 7, sink: 0.8 };
// Light reveals the place: aurora first, then the mountain, then the glacier band.
const TIMELINE = { aurora: [0, 2400], light: [500, 2600], glacier: [1700, 3100], dolly: [0, 3200] };
const SETTLED = 60000;

// Cache the original lattice, not an approximation of the finished clouds/relief.
// A 1024² R8 target covers signed coordinates used by the visible mountain and
// shore (1 MiB, no download). A smaller repeating lattice changes their pattern.
const NOISE_SIZE = 1024;
const noiseBakeFragment = /* glsl */`
  void main() {
    vec2 p = floor(gl_FragCoord.xy) - 512.0;
    float h = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
  }
`;

const noise = /* glsl */`
  uniform sampler2D noiseMap;
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return texture2D(noiseMap, (i + u + 512.5) / 1024.0).r;
  }
  float fbm(vec2 p) {
    float v = 0.5 * vnoise(p); p *= 2.03;
    v += 0.25 * vnoise(p); p *= 2.03;
    v += 0.125 * vnoise(p); p *= 2.03;
    return v + 0.0625 * vnoise(p);
  }
  // Aurora colour by altitude, kept within the Nordra palette: turquoise base, cyan, blue, violet tips.
  vec3 altitude(float v, float dark) {
    vec3 base = mix(vec3(0.10, 0.72, 0.62), vec3(0.22, 0.98, 0.72), dark);
    vec3 cyan = mix(vec3(0.10, 0.62, 0.80), vec3(0.20, 0.86, 0.95), dark);
    vec3 blue = mix(vec3(0.22, 0.40, 0.88), vec3(0.32, 0.50, 1.00), dark);
    vec3 violet = mix(vec3(0.52, 0.32, 0.86), vec3(0.62, 0.38, 0.98), dark);
    v = clamp(v, 0.0, 1.0);
    vec3 c = mix(base, cyan, smoothstep(0.05, 0.3, v));
    c = mix(c, blue, smoothstep(0.3, 0.62, v));
    return mix(c, violet, smoothstep(0.6, 1.0, v));
  }
`;

// Sky dome: direction-based, so the lake reflection sees a correct sky.
const skyVertex = /* glsl */`
  varying vec3 dir;
  void main() { vec4 p = modelMatrix * vec4(position, 1.0); dir = normalize(p.xyz - cameraPosition); gl_Position = projectionMatrix * viewMatrix * p; }
`;
const skyFragment = /* glsl */`
  uniform float dark, aurora, time, pixelAngle, textElevation;
  uniform vec3 sun, parhelion;
  varying vec3 dir;
  ${noise}
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  // One layer of round, soft stars: one candidate per cell on the sphere, jittered inside it.
  // Returns brightness in .x and a colour seed in .y.
  vec2 starLayer(vec3 d, float density, float keep, float sizePx, float minB, float maxB) {
    vec3 p = d * density;
    vec3 cell = floor(p);
    float h = hash3(cell);
    if (h < keep) return vec2(0.0);
    vec3 centre = cell + 0.2 + 0.6 * vec3(hash3(cell + 1.7), hash3(cell + 5.3), hash3(cell + 9.1));
    // The star lives on the sky sphere: project its point onto it before measuring the angle.
    float angle = length(d - normalize(centre));
    float radius = sizePx * pixelAngle;
    // Brightness follows a steep curve: most stars faint, a few bright.
    float b = mix(minB, maxB, pow(hash3(cell + 3.3), 5.0));
    float core = exp(-angle * angle / (radius * radius));
    return vec2(core * b, hash3(cell + 7.7));
  }
  vec3 starColour(float seed) {
    // Mostly blue-white; a few pale amber stars.
    return mix(vec3(0.78, 0.87, 1.0), vec3(1.0, 0.85, 0.66), smoothstep(0.86, 1.0, seed));
  }
  void main() {
    vec3 d = normalize(dir);
    float e = d.y;
    // Night: deep navy with a teal glow on the horizon. Arctic day: clear blue, paling towards the horizon.
    vec3 nightTop = vec3(0.012, 0.03, 0.07), nightMid = vec3(0.02, 0.07, 0.12), nightGlow = vec3(0.04, 0.20, 0.22);
    vec3 dayTop = vec3(0.60, 0.76, 0.94), dayMid = vec3(0.84, 0.91, 0.98), dayGlow = vec3(0.95, 0.96, 0.95);
    vec3 top = mix(dayTop, nightTop, dark), mid = mix(dayMid, nightMid, dark), glow = mix(dayGlow, nightGlow, dark);
    vec3 c = mix(mid, top, smoothstep(0.05, 0.55, e));
    c = mix(c, glow, (1.0 - smoothstep(-0.02, 0.16, e)) * mix(0.6, 0.75 + 0.25 * aurora, dark));

    // Arctic day: a low sun beside the mountain, a 22-degree ice halo with iridescent edges and a light pillar.
    float sa = acos(clamp(dot(d, sun), -1.0, 1.0));
    float disk = smoothstep(0.016, 0.011, sa);
    float bloom = exp(-sa * sa / 0.004) * 0.55 + exp(-sa * 6.0) * 0.2;
    // Cirrus: a thin, slow veil of high ice cloud. It is what makes a halo possible.
    vec2 cloud = d.xz / max(e, 0.04);
    float veil = fbm(vec2(cloud.x * 0.5 + time * 0.012, cloud.y * 2.2));
    float strands = fbm(vec2(cloud.x * 0.14 + time * 0.007, cloud.y * 6.0) + 4.0);
    float cirrus = smoothstep(0.48, 0.86, veil * 0.55 + strands * 0.6) * smoothstep(0.02, 0.14, e);
    float off = sa - 0.384;
    float ring = exp(-off * off / (0.013 * 0.013));
    // The halo frames the mountain: it fades where the copy sits and grows where the veil is thicker.
    ring *= (1.0 - smoothstep(textElevation - 0.04, textElevation + 0.03, e)) * (0.45 + 0.85 * smoothstep(0.35, 0.75, veil));
    // Parhelion (sun dog): a bright, coloured spot on the halo, level with the sun.
    float ap = acos(clamp(dot(d, parhelion), -1.0, 1.0));
    ring *= 1.0 + 2.8 * exp(-ap * ap / (0.03 * 0.03));
    vec3 ringColour = mix(vec3(1.0, 0.80, 0.60), vec3(0.32, 0.84, 0.95), smoothstep(-0.012, 0.0, off));
    ringColour = mix(ringColour, vec3(0.60, 0.46, 0.95), smoothstep(0.004, 0.018, off));
    vec3 sunFlat = normalize(vec3(sun.x, 0.0, sun.z) + 1e-5), dirFlat = normalize(vec3(d.x, 0.0, d.z) + 1e-5);
    float azimuth = acos(clamp(dot(sunFlat, dirFlat), -1.0, 1.0));
    float pillar = exp(-azimuth * azimuth / (0.006 * 0.006)) * exp(-abs(e - sun.y) / 0.10) * 0.35;
    // A low sun is warm: golden disk and pillar, so they read against the pale horizon.
    vec3 sunColour = vec3(1.0, 0.86, 0.62);
    vec3 daylight = sunColour * (bloom + pillar) + ringColour * ring * 0.34;
    float dayOn = (1.0 - dark) * aurora * smoothstep(-0.01, 0.03, e);
    vec3 cirrusColour = mix(vec3(1.0), vec3(1.0, 0.90, 0.76), exp(-sa * 3.0));
    c = mix(c, cirrusColour, cirrus * 0.42 * (1.0 - dark));
    c = mix(c, c * vec3(0.98, 0.93, 0.86), exp(-sa * 3.5) * 0.5 * dayOn);
    c += daylight * dayOn;
    c = mix(c, vec3(1.0, 0.95, 0.82), disk * dayOn);
    c = min(c, vec3(1.0));

    // Night stars: faint dust, scattered medium stars and a few bright ones with a halo.
    vec2 dust = starLayer(d, 260.0, 0.88, 0.75, 0.05, 0.22);
    vec2 medium = starLayer(d, 90.0, 0.90, 1.0, 0.25, 0.65);
    vec2 bright = starLayer(d, 30.0, 0.935, 1.35, 0.7, 1.35);
    vec2 halo = starLayer(d, 30.0, 0.935, 4.5, 0.05, 0.16);
    vec3 stars = starColour(dust.y) * dust.x + starColour(medium.y) * medium.x
      + starColour(bright.y) * (bright.x + halo.x * step(0.001, bright.x + halo.x));
    // Haze swallows stars near the horizon; where the aurora shines, faint stars fade.
    float extinction = smoothstep(0.02, 0.22, e);
    float auroraVeil = 1.0 - 0.6 * aurora * smoothstep(0.06, 0.18, e) * (1.0 - smoothstep(0.42, 0.7, e));
    c += stars * extinction * auroraVeil * dark;

    gl_FragColor = vec4(c, 1.0);
  }
`;

// Aurora band: a tall ribbon that folds in depth; rays rise from a crisp lower edge.
const bandVertex = /* glsl */`
  uniform float time, seed, curve, altitudeBase, height, bandLength, bandDistance, wind;
  varying vec2 vUv; varying float vV;
  void main() {
    vUv = uv;
    float u = uv.x;
    float v = uv.y * 1.18 - 0.18; // below 0: soft glow under the lower edge
    vV = v;
    float x = (u - 0.5) * bandLength;
    float z = -bandDistance - curve * sin(3.14159 * u) + 7.0 * sin(u * 9.0 + seed + time * 0.07) + 3.5 * sin(u * 23.0 - time * 0.11 + seed);
    x += wind * 4.0 * sin(u * 6.0 + time * 0.3);
    float y = altitudeBase + 2.2 * sin(u * 17.0 + seed - time * 0.09) + max(v, -0.2) * height;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(x, y, z, 1.0);
  }
`;
const bandFragment = /* glsl */`
  uniform float time, seed, dark, level, sweep, strength;
  varying vec2 vUv; varying float vV;
  ${noise}
  void main() {
    float u = vUv.x, v = vV;
    // Soft rays of different heights drifting slowly along the band.
    float r = fbm(vec2(u * 46.0 + seed + time * 0.035, time * 0.025));
    float rays = smoothstep(0.32, 0.78, r);
    float reach = v / mix(0.42, 1.1, rays);
    float curtain = smoothstep(0.0, 0.035, v) * exp(-max(reach, 0.0) * 2.4) * (0.22 + 0.95 * rays);
    float glow = exp(-abs(v) * 9.0) * 0.18 + exp(-max(v, 0.0) * 1.2) * 0.04;
    float ends = smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
    // Real bands are patchy: bright knots and quiet stretches drift along the arc.
    float patches = 0.25 + 0.75 * smoothstep(0.32, 0.72, fbm(vec2(u * 5.0 + seed, time * 0.02)));
    // Intro: the band lights from one end to the other.
    float on = smoothstep(sweep, sweep - 0.25, 1.0 - u) * level;
    float breathe = 0.86 + 0.14 * sin(time * 0.55 + seed);
    // The tall tips reach the copy area: soften them there, so the sky itself can stay clear and starry.
    float upper = 1.0 - 0.65 * smoothstep(0.4, 0.95, v);
    float intensity = (curtain + glow) * ends * patches * on * breathe * strength * upper;
    vec3 c = altitude(reach * 0.95 + 0.04, dark);
    // Auroras only exist at night: by day the bands are gone.
    float a = clamp(intensity * 0.8 * dark, 0.0, 1.0);
    gl_FragColor = vec4(c * a, a);
  }
`;

// Distant range: a pale, low silhouette far behind the lake, softened by atmospheric haze.
const rangeVertex = /* glsl */`
  uniform float time;
  varying float vH; varying float vU;
  ${noise}
  void main() {
    float u = uv.x;
    float ridge = 0.55 * fbm(vec2(u * 9.0, 3.1)) + 0.45 * abs(sin(u * 23.0 + 1.3)) * fbm(vec2(u * 30.0, 7.7));
    float height = 3.0 + 13.0 * ridge;
    vH = uv.y; vU = u;
    vec3 p = vec3((u - 0.5) * 1500.0, uv.y * height - 1.5, -340.0 - 40.0 * sin(u * 3.1));
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;
const rangeFragment = /* glsl */`
  uniform float dark;
  varying float vH; varying float vU;
  ${noise}
  void main() {
    vec3 day = mix(vec3(0.70, 0.78, 0.88), vec3(0.86, 0.91, 0.97), smoothstep(0.0, 1.0, vH));
    day = mix(day, vec3(0.93, 0.95, 0.98), smoothstep(0.7, 0.95, vH) * smoothstep(0.4, 0.7, fbm(vec2(vU * 60.0, vH * 3.0))));
    vec3 night = mix(vec3(0.018, 0.04, 0.07), vec3(0.03, 0.075, 0.10), vH);
    gl_FragColor = vec4(mix(day, night, dark), 1.0);
  }
`;

const mountainVertex = /* glsl */`
  varying vec3 world; varying vec3 vNormal;
  void main() { vec4 p = modelMatrix * vec4(position, 1.0); world = p.xyz; vNormal = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * p; }
`;
const mountainFragment = /* glsl */`
  uniform float dark, light, glacier, time, peak, glacierBand;
  uniform vec3 sun;
  varying vec3 world; varying vec3 vNormal;
  ${noise}
  void main() {
    vec3 n = normalize(vNormal);
    float h = clamp(world.y / peak, 0.0, 1.0);
    // Rock: dark navy with subtle strata; the aurora lights faces that look up and back.
    vec3 rock = mix(vec3(0.07, 0.11, 0.17), vec3(0.025, 0.045, 0.08), dark);
    float strata = 0.86 + 0.22 * fbm(world.xy * vec2(0.5, 1.6) + world.z * 0.1);
    vec3 auroraTint = altitude(0.15 + 0.3 * (1.0 - h), dark);
    float skyward = clamp(n.y * 0.7 + 0.35 - n.z * 0.35, 0.0, 1.0);
    vec3 c = rock * strata;
    c += auroraTint * skyward * light * mix(0.18, 0.42, dark) * (0.6 + 0.4 * h);
    // The front face catches a soft wash of aurora light near the summit.
    c += auroraTint * pow(h, 2.2) * light * mix(0.10, 0.20, dark);
    // Glacier: the isotype chevron becomes a band of snow and ice that reflects the aurora.
    vec3 ice = mix(vec3(0.82, 0.90, 0.96), vec3(0.55, 0.78, 0.88), dark);
    // Ice catches the aurora mostly near the top and fades into shadow lower down.
    float iceLight = mix(0.35, 1.0, pow(h, 1.4));
    vec3 glacierLit = ice * mix(0.62, 0.16, dark) + auroraTint * mix(0.25, 0.62, dark) * iceLight;
    glacierLit *= 0.86 + 0.24 * fbm(world.xy * vec2(1.2, 3.0));
    c = mix(c, mix(rock * 1.2, glacierLit, glacier), glacierBand);

    // Arctic day. Relief: a ridge field drawn from noise gives slopes a fake normal, so the low sun
    // warms the faces that turn towards it and leaves cool blue shadows on the others.
    vec2 rp = world.xy * vec2(0.32, 0.75);
    float r0 = fbm(rp), rx = fbm(rp + vec2(0.06, 0.0)) - r0, ry = fbm(rp + vec2(0.0, 0.06)) - r0;
    vec3 relief = normalize(vec3(-rx * 9.0, -ry * 9.0, 1.0));
    float sunSide = smoothstep(-8.0, 8.0, world.x * sign(sun.x));
    float facing = clamp(dot(relief, normalize(vec3(sun.x, 0.35, 0.4))) * 0.8 + sunSide * 0.5 - 0.15, 0.0, 1.0);
    // Snowfields settle on gentler ground and higher up; rock shows on steep ribs.
    float snow = smoothstep(0.40, 0.68, r0 + h * 0.36 + relief.y * 0.10) * smoothstep(0.02, 0.30, h);
    snow = max(snow, smoothstep(0.25, 0.6, n.y) * smoothstep(0.25, 0.7, h));
    vec3 warmSnow = vec3(1.0, 0.91, 0.80), coolSnow = vec3(0.60, 0.70, 0.86);
    vec3 warmRock = vec3(0.52, 0.47, 0.48), coolRock = vec3(0.34, 0.41, 0.52);
    vec3 dayRock = mix(mix(coolRock, warmRock, facing) * strata, mix(coolSnow, warmSnow, facing), snow * light);
    // Glacier: blue-white ice with fine crevasses; brand colour only in the glints and edges.
    float crevasse = 1.0 - 0.35 * smoothstep(0.03, 0.0, abs(fbm(world.xy * vec2(0.28, 1.5)) - 0.5));
    vec3 dayIce = mix(vec3(0.66, 0.78, 0.90), vec3(0.92, 0.96, 1.0), smoothstep(0.1, 0.9, h)) * crevasse;
    dayIce *= mix(0.86, 1.06, facing);
    float hue = fract(world.x * 0.03 + world.y * 0.05 + 0.1 * sin(time * 0.2));
    float glint = smoothstep(0.62, 0.78, fbm(world.xy * vec2(0.35, 0.9) + vec2(time * 0.03, 0.0))) * (0.3 + facing);
    float edge = pow(1.0 - abs(n.z), 3.0) * 0.35 * smoothstep(0.3, 0.9, h);
    dayIce = mix(dayIce, dayIce * 0.7 + altitude(hue, 0.7) * 0.5, clamp(glint * 0.45 + edge, 0.0, 0.6));
    vec3 dayGlacier = mix(vec3(0.74, 0.80, 0.88), dayIce, glacier);
    vec3 day = mix(dayRock, dayGlacier, glacierBand);
    c = mix(day, c, dark);

    // Haze at the foot of the mountain, the colour of the horizon glow.
    vec3 haze = mix(vec3(0.90, 0.94, 0.97), vec3(0.05, 0.18, 0.21), dark);
    c = mix(c, haze, (1.0 - smoothstep(-0.6, 4.0, world.y)) * mix(0.55, 0.65, dark));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// Still lake: reflection with a slow ripple, darker near the shore.
const RIPPLES = 8;
const waterShader = {
  name: 'NordraLake',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, time: { value: 0 }, dark: { value: 0 }, ripples: { value: null }, shoreZ: { value: 10 } },
  vertexShader: /* glsl */`
    uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 world;
    void main() { vUv = textureMatrix * vec4(position, 1.0); world = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float time, dark, shoreZ; uniform vec3 ripples[${RIPPLES}];
    varying vec4 vUv; varying vec3 world;
    ${noise}
    void main() {
      vec2 ripple = vec2(fbm(world.xz * vec2(0.08, 0.4) + vec2(0.0, time * 0.06)), fbm(world.xz * vec2(0.08, 0.4) + 9.0 - vec2(0.0, time * 0.05))) - 0.5;
      // Touched water: slow concentric rings that bend the reflection and fade in a few seconds.
      vec2 rings = vec2(0.0); float crest = 0.0;
      for (int k = 0; k < ${RIPPLES}; k++) {
        vec2 rel = world.xz - ripples[k].xy;
        float age = time - ripples[k].z;
        float front = length(rel) - age * 4.0;
        float wave = sin(front * 2.2) * exp(-front * front * 0.06) * exp(-age * 1.1) * step(0.0, age);
        rings += normalize(rel + 1e-4) * wave;
        crest += max(wave, 0.0);
      }
      vec4 coords = vUv;
      coords.xy += (ripple * vec2(0.6, 0.25) * 0.04 + rings * 0.03) * vUv.w;
      vec3 reflection = texture2DProj(tDiffuse, coords).rgb;
      vec3 deep = mix(vec3(0.70, 0.78, 0.86), vec3(0.01, 0.025, 0.05), dark);
      float far = smoothstep(-10.0, -60.0, world.z);
      vec3 c = mix(deep, reflection, mix(0.62, 0.86, far));
      c += mix(vec3(0.95, 0.98, 1.0), altitude(0.1, dark), dark) * min(crest, 1.0) * mix(0.05, 0.08, dark);
      // Ice floes drifting in the middle distance: they do not reflect.
      float floeField = fbm(world.xz * vec2(0.10, 0.30) + vec2(3.0 + time * 0.004, 1.0));
      float floe = smoothstep(0.655, 0.675, floeField) * smoothstep(-110.0, -40.0, world.z) * (1.0 - smoothstep(shoreZ - 16.0, shoreZ - 6.0, world.z));
      vec3 floeColour = mix(vec3(0.88, 0.93, 0.98), vec3(0.06, 0.09, 0.14), dark) * (0.9 + 0.15 * fbm(world.xz * 0.6));
      c = mix(c, floeColour, floe);
      // Snowy shore in the foreground, with an irregular edge.
      float shoreEdge = shoreZ + 3.0 * (fbm(vec2(world.x * 0.07, 2.0)) - 0.5) * 2.0;
      float shore = smoothstep(shoreEdge - 0.6, shoreEdge + 0.6, world.z);
      vec3 snow = mix(vec3(0.92, 0.95, 0.99), vec3(0.05, 0.08, 0.13), dark) * (0.88 + 0.16 * fbm(world.xz * vec2(0.3, 0.9)));
      c = mix(c, snow, shore);
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

function profile() {
  const constrained = navigator.connection?.saveData === true ||
    (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  if (constrained) return { name: 'constrained', dpr: 1.25, pixels: 1300000, fps: 30, reflection: 0, bandSegments: 160 };
  if (matchMedia('(max-width:700px)').matches) return { name: 'mobile', dpr: 1.5, pixels: 1500000, fps: 30, reflection: 0.35, bandSegments: 200 };
  return { name: 'desktop', dpr: 2, pixels: 4200000, fps: 60, reflection: 0.5, bandSegments: 320 };
}

const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10));
const phase = (elapsed, [from, to]) => ease((elapsed - from) / (to - from));

export async function createLandscapeScene(stage, { reduced = false, paused = false, dark: initialDark = false, context, getState, onFallback, onReady } = {}) {
  const quality = profile();
  const renderer = new WebGLRenderer({ canvas: context?.canvas, context, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  stage.append(canvas);

  const scene = new Scene();
  const noiseTarget = new WebGLRenderTarget(NOISE_SIZE, NOISE_SIZE, { format: RedFormat, minFilter: LinearFilter, magFilter: LinearFilter, wrapS: RepeatWrapping, wrapT: RepeatWrapping, depthBuffer: false });
  const noiseMap = { value: noiseTarget.texture };
  async function bakeNoise(cancelled) {
    const quad = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }', fragmentShader: noiseBakeFragment,
    }));
    quad.frustumCulled = false;
    const camera = new OrthographicCamera();
    try {
      await renderer.compileAsync(quad, camera);
      if (cancelled()) return;
      renderer.setRenderTarget(noiseTarget); renderer.render(quad, camera);
    } finally { renderer.setRenderTarget(null); quad.geometry.dispose(); quad.material.dispose(); }
  }
  let cleanup = () => { scene.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); }); noiseTarget.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); };
  async function yieldSetup() {
    // Let input/paint run between construction and individual shader programs.
    if (globalThis.scheduler?.yield) await globalThis.scheduler.yield();
    else await new Promise(resolve => setTimeout(resolve, 0));
    if (getState?.().disposed) throw new Error('Landscape left during preparation');
  }
  try {
  await yieldSetup();
  const camera = new PerspectiveCamera(36, 1, 0.5, 1200);
  const time = { value: 0 }, dark = { value: 0 }, sun = { value: new Vector3(0.3, 0.06, -1).normalize() };

  const sky = new Mesh(new SphereGeometry(900, 48, 24), new ShaderMaterial({
    vertexShader: skyVertex, fragmentShader: skyFragment, side: BackSide, depthWrite: false,
    uniforms: { time, dark, aurora: { value: 0 }, pixelAngle: { value: 0.001 }, sun, parhelion: { value: new Vector3(0, 0.1, -1) }, textElevation: { value: 0.3 } },
  }));
  sky.renderOrder = -10;
  scene.add(sky);

  // Two aurora bands at different distances; the far one is fainter and higher.
  const bands = [
    { seed: 1.3, distance: 120, curve: 30, altitudeBase: 15, height: 60, length: 300, strength: 1.0 },
    { seed: 4.1, distance: 190, curve: 45, altitudeBase: 26, height: 70, length: 420, strength: 0.55 },
  ].map(config => {
    const material = new ShaderMaterial({
      vertexShader: bandVertex, fragmentShader: bandFragment, transparent: true, depthWrite: false,
      blending: CustomBlending, blendEquation: AddEquation, blendSrc: OneFactor, blendDst: OneFactor,
      uniforms: {
        time, dark, wind: { value: 0 }, level: { value: 0 }, sweep: { value: 0 },
        seed: { value: config.seed }, curve: { value: config.curve }, altitudeBase: { value: config.altitudeBase },
        height: { value: config.height }, bandLength: { value: config.length }, bandDistance: { value: config.distance },
        strength: { value: config.strength },
      },
    });
    const mesh = new Mesh(new PlaneGeometry(1, 1, quality.bandSegments, 24), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = -5;
    scene.add(mesh);
    return mesh;
  });

  await yieldSetup();
  // The exact isotype, extruded into a massif. Its chevron becomes the glacier band.
  const mountain = new Group();
  const light = { value: 0 }, glacier = { value: 0 };
  const scale = MOUNTAIN.width / ISOTYPE.width;
  const peakHeight = ISOTYPE.height * scale;
  for (const path of new SVGLoader().parse(isotypeSource).paths) {
    const isGlacier = path.userData?.node?.id === 'chevron';
    const geometry = new ExtrudeGeometry(SVGLoader.createShapes(path), {
      depth: MOUNTAIN.depth / scale, bevelEnabled: true,
      bevelThickness: 18, bevelSize: 10, bevelSegments: 3, curveSegments: quality.name === 'desktop' ? 28 : 14,
    });
    const mesh = new Mesh(geometry, new ShaderMaterial({
      vertexShader: mountainVertex, fragmentShader: mountainFragment,
      uniforms: { time, dark, light, glacier, sun, peak: { value: peakHeight }, glacierBand: { value: isGlacier ? 1 : 0 } },
    }));
    mountain.add(mesh);
    // Keep cleanup ownership even if navigation cancels the next task.
    if (!mountain.parent) scene.add(mountain);
    await yieldSetup();
  }
  mountain.scale.set(scale, -scale, scale);
  mountain.position.set(-MOUNTAIN.width / 2, peakHeight - MOUNTAIN.sink, MOUNTAIN.z - MOUNTAIN.depth);
  scene.add(mountain);

  const range = new Mesh(new PlaneGeometry(1, 1, 240, 1), new ShaderMaterial({
    vertexShader: rangeVertex, fragmentShader: rangeFragment, uniforms: { time, dark },
  }));
  range.frustumCulled = false;
  scene.add(range);

  // Lake: a real reflection where the device can afford it; otherwise a calm gradient.
  let water;
  const ripples = { value: Array.from({ length: RIPPLES }, () => new Vector3(0, -1e4, -100)) };
  const shoreZ = { value: 10 };
  const waterGeometry = new PlaneGeometry(900, 900);
  if (quality.reflection > 0) {
    water = new Reflector(waterGeometry, { clipBias: 0.003, textureWidth: 512, textureHeight: 512, shader: waterShader, multisample: 0 });
    water.material.uniforms.time = time;
    water.material.uniforms.ripples = ripples;
    water.material.uniforms.shoreZ = shoreZ;
    water.material.uniforms.dark = dark;
  } else {
    water = new Mesh(waterGeometry, new ShaderMaterial({
      uniforms: { dark },
      vertexShader: 'varying vec3 world; void main(){ world=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(world,1.0); }',
      fragmentShader: 'uniform float dark; varying vec3 world; void main(){ float far=smoothstep(-10.0,-120.0,world.z); vec3 near=mix(vec3(0.72,0.80,0.88),vec3(0.01,0.03,0.05),dark); vec3 horizon=mix(vec3(0.93,0.88,0.90),vec3(0.04,0.15,0.17),dark); gl_FragColor=vec4(mix(near,horizon,far),1.0); }',
    }));
  }
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0, -300);
  scene.add(water);
  scene.traverse(object => { if (object.material?.uniforms) object.material.uniforms.noiseMap = noiseMap; });


  let width = 1, height = 1, raf = 0, lastFrame = 0, disposed = false, lost = false, ready = false;
  let bufferWidth = 0, bufferHeight = 0, bufferRatio = 0;
  let preparation = 0;
  let shaderFailed = false, targetDark = initialDark ? 1 : 0;
  let current = { visible: true, hidden: document.hidden, paused, reduced, dark: initialDark };
  const clock = { elapsed: reduced || paused ? SETTLED : 0, last: null };
  let scrollProgress = 0, rippleIndex = 0, lastRipple = { x: 1e4, z: 1e4, t: 0 };
  const raycaster = new Raycaster(), lakePlane = new Plane(new Vector3(0, 1, 0), 0), pointer = new Vector2(), hit = new Vector3();
  const rest = { position: new Vector3(), target: new Vector3() };
  mountain.updateMatrixWorld(true);
  const summitPoint = new Vector3(0, -Infinity, 0), vertex = new Vector3();
  mountain.traverse(object => {
    const positions = object.geometry?.attributes.position;
    if (!positions) return;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (vertex.y > summitPoint.y) summitPoint.copy(vertex);
    }
  });
  const summitCandidates = [];
  mountain.traverse(object => {
    const positions = object.geometry?.attributes.position;
    if (!positions) return;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (vertex.y >= summitPoint.y - 1) summitCandidates.push(vertex.clone());
    }
  });
  const policy = () => landscapePolicy({ ...current, ready, disposed, failed: lost || shaderFailed });
  // Three normally logs shader errors; treat them as a recoverable static fallback instead.
  renderer.debug.onShaderError = () => { shaderFailed = true; };
  dark.value = targetDark;
  // Frame the mountain: width as a share of the viewport, summit just below the buttons.
  function frame() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    let ratio = Math.min(window.devicePixelRatio || 1, quality.dpr);
    ratio = Math.min(ratio, Math.sqrt(quality.pixels / (width * height)));
    if (width !== bufferWidth || height !== bufferHeight || ratio !== bufferRatio) {
      renderer.setDrawingBufferSize(width, height, ratio);
      bufferWidth = width; bufferHeight = height; bufferRatio = ratio;
    }
    camera.aspect = width / height;
    const mobile = width <= 700;
    camera.fov = mobile ? 46 : 34;
    camera.updateProjectionMatrix();
    // Star size is set in device pixels, so stars stay crisp and round at any resolution.
    sky.material.uniforms.pixelAngle.value = (camera.fov * Math.PI / 180) / (height * ratio);
    if (water.getRenderTarget) {
      const size = Math.max(256, Math.round(Math.max(width, height) * ratio * quality.reflection));
      water.getRenderTarget().setSize(size, Math.round(size * height / width));
    }
    const buttons = stage.parentElement.querySelector('.horizon-actions').getBoundingClientRect();
    const summitTop = (buttons.bottom - rect.top + 56) / height; // 0 = top
    // Smaller share and a higher eye leave a real lake to touch below the mountain.
    const share = mobile ? 0.95 : 0.48;
    const leftEdge = new Vector3(-MOUNTAIN.width / 2, 0, MOUNTAIN.z), rightEdge = new Vector3(MOUNTAIN.width / 2, 0, MOUNTAIN.z);
    let distance = 60, lift = 9;
    for (let i = 0; i < 8; i++) {
      rest.position.set(0, 4.2, MOUNTAIN.z + distance);
      rest.target.set(0, lift, MOUNTAIN.z);
      camera.position.copy(rest.position); camera.lookAt(rest.target); camera.updateMatrixWorld();
      const l = leftEdge.clone().project(camera), r = rightEdge.clone().project(camera);
      distance *= ((r.x - l.x) / 2) / share;
      const summitY = Math.max(...summitCandidates.map(point => point.clone().project(camera).y));
      const wanted = 1 - summitTop * 2; // NDC y
      lift += (summitY - wanted) * distance * Math.tan(camera.fov * Math.PI / 360);
    }

    // The low arctic sun sits upper left of the mountain, so its halo and sun dog frame the summit.
    const horizon = new Vector3(0, 0, -800).project(camera).y;
    const skyDirection = (x, y) => { raycaster.setFromCamera(new Vector2(x, y), camera); return raycaster.ray.direction.clone().normalize(); };
    sun.value.copy(skyDirection(mobile ? -0.56 : -0.66, horizon + (mobile ? 0.30 : 0.44)));
    // The sun dog sits on the halo, level with the sun, 22 degrees towards the mountain.
    sky.material.uniforms.parhelion.value.copy(sun.value).applyAxisAngle(new Vector3(0, 1, 0), -0.384);
    // Halo fades above the buttons, so it never crosses the copy.
    const copyBottom = 1 - 2 * (buttons.bottom - rect.top) / height;
    sky.material.uniforms.textElevation.value = skyDirection(0, copyBottom).y;
    // Snowy shore along the bottom edge of the view.
    raycaster.setFromCamera(new Vector2(0, -0.96), camera);
    if (raycaster.ray.intersectPlane(lakePlane, hit)) shoreZ.value = hit.z - (mobile ? 4 : 6);
    place(clock.elapsed);
    render();
  }


  // No pointer parallax. A small scroll flight only while motion is enabled.
  function place(elapsed = SETTLED) {
    const dolly = current.reduced ? 0 : 1 - phase(elapsed, TIMELINE.dolly);
    camera.position.copy(rest.position);
    camera.position.z += dolly * 8 - scrollProgress * 3;
    camera.position.y += dolly * 1.2 + scrollProgress * 0.35;
    camera.lookAt(rest.target.x, rest.target.y + scrollProgress * 0.25, rest.target.z);
  }
  function setPhases(elapsed) {
    const aurora = phase(elapsed, TIMELINE.aurora);
    for (const band of bands) { band.material.uniforms.level.value = Math.min(1, aurora * 1.4); band.material.uniforms.sweep.value = aurora * 1.3; }
    sky.material.uniforms.aurora.value = aurora;
    light.value = phase(elapsed, TIMELINE.light);
    glacier.value = phase(elapsed, TIMELINE.glacier);
  }
  function render() {
    if (!policy().render) return;
    try {
      renderer.render(scene, camera);
      if (shaderFailed) throw Error('Shader compilation failed');
    } catch { fail(); }
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    advanceClock(clock, 0, false);
  }
  function tick(now) {
    raf = 0;
    if (!policy().animate) { advanceClock(clock, now, false); return; }
    const interval = 1000 / quality.fps;
    if (lastFrame && now - lastFrame < interval - 1) { raf = requestAnimationFrame(tick); return; }
    const delta = lastFrame ? Math.min(80, now - lastFrame) : interval;
    lastFrame = now;
    const elapsed = advanceClock(clock, now, true);
    time.value = elapsed / 1000;
    dark.value += (targetDark - dark.value) * (1 - Math.exp(-delta / 180));
    if (Math.abs(targetDark - dark.value) < .001) dark.value = targetDark;
    setPhases(elapsed); place(elapsed); render();
    if (!disposed) raf = requestAnimationFrame(tick);
  }
  function sync() {
    stop();
    if (!policy().render) return;
    if (current.reduced) { clock.elapsed = SETTLED; time.value = SETTLED / 1000; scrollProgress = 0; setPhases(SETTLED); place(); }
    if (current.reduced || current.paused) dark.value = targetDark;
    render();
    if (policy().animate) raf = requestAnimationFrame(tick);
  }
  function setState(next) {
    current = { ...current, ...next };
    targetDark = landscapePolicy(current).theme;
    sync();
  }
  // The hit must be in the visible lake, below the massif, away from all copy and controls.
  function touchLake(event, force = false) {
    if (!policy().animate || !water.getRenderTarget) return;
    if (event.target.closest?.('a,button,input,select,textarea,p,h1,h2,h3,.horizon-actions,.site-header,nav')) return;
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(lakePlane, hit) || hit.z < MOUNTAIN.z || hit.z > shoreZ.value - 1) return;
    const now = clock.elapsed;
    if (!force && Math.hypot(hit.x - lastRipple.x, hit.z - lastRipple.z) < 3 && now - lastRipple.t < 140) return;
    if (!force && now - lastRipple.t < 90) return;
    lastRipple = { x: hit.x, z: hit.z, t: now };
    ripples.value[rippleIndex].set(hit.x, hit.z, time.value);
    rippleIndex = (rippleIndex + 1) % RIPPLES;
  }
  const onPointerMove = event => touchLake(event);
  const onPointerDown = event => touchLake(event, true);
  function onScroll() {
    if (!policy().animate) return;
    scrollProgress = Math.max(0, Math.min(1, -stage.getBoundingClientRect().top / Math.max(1, height)));
  }
  function fail() { stop(); onFallback?.(); dispose(); }
  function onLost(event) { event.preventDefault(); lost = true; preparation++; stop(); onFallback?.(); }
  async function prepare() {
    const generation = ++preparation;
    const cancelled = () => disposed || lost || generation !== preparation;
    try {
      await bakeNoise(cancelled);
      if (cancelled()) return;
      if (shaderFailed) { fail(); return; }
      // Reflector renders into a linear target; the canvas uses the renderer's
      // output colour space. Three keys those as distinct programs, even for
      // custom shaders. Preparing just the canvas leaves the entire reflected
      // scene to compile synchronously inside the first render.
      const completed = await preparePrograms(renderer, camera, scene, [sky, ...bands, ...mountain.children, range, water], {
        reflection: water.getRenderTarget?.(), water, yieldTask: yieldSetup, cancelled,
      });
      if (!completed) return;
      await yieldSetup();
      if (cancelled()) return;
      if (shaderFailed) { fail(); return; }
      ready = true;
      if (getState) current = { ...current, ...getState() };
      if (current.disposed) { dispose(); return; }
      targetDark = landscapePolicy(current).theme;
      sync();
      if (disposed) return;
      stage.classList.add('has-scene'); stage.dataset.renderer = 'landscape-3d'; stage.dataset.quality = quality.name;
      onReady?.();
    } catch { if (!cancelled()) fail(); }
  }
  function onRestored() { lost = false; ready = false; shaderFailed = false; prepare(); }
  const resize = new ResizeObserver(frame);
  resize.observe(stage);
  // Font swaps can move the buttons without changing the hero's outer dimensions.
  resize.observe(stage.parentElement.querySelector('.horizon-title'));
  resize.observe(stage.parentElement.querySelector('.horizon-actions'));
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerdown', onPointerDown, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  function dispose() {
    if (disposed) return;
    disposed = true; stop(); resize.disconnect();
    removeEventListener('pointermove', onPointerMove); removeEventListener('pointerdown', onPointerDown); removeEventListener('scroll', onScroll);
    canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
    scene.traverse(object => { object.geometry?.dispose(); object.material?.dispose(); });
    water.getRenderTarget?.().dispose(); noiseTarget.dispose(); renderer.dispose(); renderer.forceContextLoss();
    canvas.remove(); stage.classList.remove('has-scene'); stage.dataset.renderer = 'static';
  }
  cleanup = dispose;
  frame(); time.value = clock.elapsed / 1000; setPhases(clock.elapsed); place(clock.elapsed);
  await prepare();
  return { setState, dispose };
  } catch (error) { cleanup(); throw error; }
}
