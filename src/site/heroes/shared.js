// Base 3D compartida por los heroes de Nordra: un solo motor, mismas reglas de movimiento,
// misma forma de pausar, de quedarse quieto y de colocar etiquetas sobre la escena.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
export { THREE };

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eo = x => 1 - Math.pow(1 - x, 3);
export const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const eob = (x, c = 1.5) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
export const bounce = x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; };
export const lerp = (a, b, k) => a + (b - a) * k;
// Resorte amortiguado: llega, se pasa un poco y se asienta.
export const spring = (x, k = 6.5, f = 10) => x <= 0 ? 0 : x >= 1.8 ? 1 : 1 - Math.exp(-k * x) * Math.cos(f * x);
// Visitas repetidas: entrada más corta.
export function seenBefore(key) { try { const v = sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); return v === "1"; } catch { return false; } }

// Quieto: movimiento reducido, ahorro de datos, conexión 2G o ?quieto en la URL.
export function stillMode() {
  const c = navigator.connection;
  return new URLSearchParams(location.search).has('quieto') || matchMedia('(prefers-reduced-motion: reduce)').matches || c?.saveData === true || /(^|-)2g$/.test(c?.effectiveType || '');
}

export function createStage(stage, { exposure = 1.05, fov = 30, camPos = [0, .6, 10], lookAt = [0, 0, 0] } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposure;
  renderer.localClippingEnabled = true;
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .04).texture;
  room.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(fov, 1, .1, 60);
  camera.position.set(...camPos); camera.lookAt(...lookAt);
  return { renderer, scene, camera };
}

// Proyecta un punto local de un objeto 3D a píxeles del escenario.
const v3 = new THREE.Vector3();
export function toStage(obj, local, camera, stage) {
  v3.copy(local); obj.localToWorld(v3); v3.project(camera);
  return { x: (v3.x * .5 + .5) * stage.clientWidth, y: (-v3.y * .5 + .5) * stage.clientHeight, behind: v3.z > 1 };
}
// Coloca una etiqueta HTML junto a un punto de la escena, sin salirse del escenario.
export function place(el, obj, local, camera, stage, dx = 0, dy = 0, align = 'left') {
  const p = toStage(obj, local, camera, stage), w = el.offsetWidth;
  let x = p.x + dx - (align === 'center' ? w / 2 : align === 'right' ? w : 0);
  x = Math.max(12, Math.min(stage.clientWidth - w - 12, x));
  const y = Math.max(8, Math.min(stage.clientHeight - el.offsetHeight - 8, p.y + dy));
  el.style.transform = `translate(${x}px,${y}px)`;
}
// Rectángulo en pantalla (coordenadas de la ventana) de un plano 3D.
export function screenRect(mesh, w, h, camera, stage) {
  const b = stage.getBoundingClientRect(); const pts = [[-w / 2, h / 2], [w / 2, h / 2], [-w / 2, -h / 2], [w / 2, -h / 2]].map(([x, y]) => toStage(mesh, new THREE.Vector3(x, y, 0), camera, stage));
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  return { left: b.left + Math.min(...xs), top: b.top + Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

// Reloj con pausa, repetición y modo quieto.
export function createClock({ still, finalTime = 30, speed = 1 }) {
  let t0 = performance.now(), started = false, paused = false, frozen = 0, offset = 0;
  return {
    get started() { return started; }, get paused() { return paused; },
    now() { if (!started) return offset; if (still) return finalTime; return offset + (paused ? frozen : (performance.now() - t0) / 1000) * speed; },
    set offset(v) { offset = v; },
    start(from = 0) { started = true; paused = false; offset = from; t0 = performance.now(); },
    toggle() { if (!paused) { frozen = (performance.now() - t0) / 1000; paused = true; } else { paused = false; t0 = performance.now() - frozen * 1000; } return paused; },
  };
}

// Inclinación con el cursor (escritorio) y giro con el dedo (táctil).
export function tiltControls(hero, stage, rot, { x = .22, y = .5, drag = 220, max = .7 } = {}) {
  hero.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const b = stage.getBoundingClientRect(); rot.ty = ((e.clientX - b.left) / b.width - .5) * y; rot.tx = ((e.clientY - b.top) / b.height - .5) * x; });
  hero.addEventListener('pointerleave', () => { rot.tx = rot.ty = 0; });
  let d = null, release = 0;
  stage.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; clearTimeout(release); d = { x: e.clientX, y: rot.ty }; });
  stage.addEventListener('pointermove', e => { if (d) rot.ty = clamp(d.y + (e.clientX - d.x) / drag, -max, max); });
  addEventListener('pointerup', () => { if (d) { d = null; release = setTimeout(() => { rot.ty = 0; }, 900); } });
  return () => { rot.x += (rot.tx - rot.x) * .06; rot.y += (rot.ty - rot.y) * .06; };
}

// La luz del fondo sigue al objeto: escribe --gx/--gy (en %) sobre el hero.
export function followGlow(hero, stage, obj, camera) {
  const p = toStage(obj, new THREE.Vector3(0, 0, 0), camera, stage);
  const hb = hero.getBoundingClientRect(), sb = stage.getBoundingClientRect();
  hero.style.setProperty('--gx', ((sb.left - hb.left + p.x) / hb.width * 100).toFixed(1) + '%');
  hero.style.setProperty('--gy', ((sb.top - hb.top + p.y) / hb.height * 100).toFixed(1) + '%');
}

// Viaje al bajar: una copia de la pantalla vuela desde el objeto 3D hasta su lugar en la sección siguiente.
export function scrollFlight({ hero, startEl = hero, ghost, target, fromRect, onState, onProgress, lag = 0 }) {
  if (stillMode()) return () => {};
  let state = -1;
  function update() {
    const tg = typeof target === 'function' ? target() : target, tb = tg.getBoundingClientRect();
    const sb = startEl.getBoundingClientRect(), start = sb.top + scrollY + sb.height * .5 - innerHeight * .3, end = Math.max(start + 200, tb.top + scrollY - innerHeight * .3);
    const raw = clamp((scrollY - start) / (end - start)); onProgress?.(raw);
    const p = clamp((raw - lag) / (1 - lag));
    const s = p <= 0 ? 0 : p >= 1 ? 2 : 1;
    if (s !== state) { state = s; ghost.style.visibility = s === 1 ? 'visible' : 'hidden'; tg.style.opacity = s === 2 ? 1 : 0; onState?.(s); }
    if (s === 1) {
      const a = fromRect(), k = eio(p);
      const L = lerp(a.left, tb.left, k), T = lerp(a.top, tb.top, k), W = lerp(a.width, tb.width, k), H = lerp(a.height, tb.height, k);
      ghost.style.transform = `translate(${L}px,${T}px)`; ghost.style.width = W + 'px'; ghost.style.height = H + 'px';
      ghost.style.borderRadius = lerp(6, 14, k) + 'px';
    }
  }
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
  return update;
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function dotTexture() {
  return canvasTexture(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(.25, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
}

// Textura de una captura larga, reducida si pasa del límite del GPU.
export function tallTexture(src, onReady, maxH = 4096) {
  const t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.userData.ratio = 1;
  const img = new Image(); img.onload = () => {
    const k = Math.min(1, maxH / img.height), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); t.image = c; t.userData.ratio = c.width / c.height; t.needsUpdate = true; onReady?.(t);
  }; img.src = src; return t;
}
export function softTexture() {
  return canvasTexture(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(10,25,35,.55)"); r.addColorStop(1, "rgba(10,25,35,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
}
