// «¿Qué celebras?»: las ocasiones como tarjetas en un carrusel WebGL.
// La tarjeta central queda plana y las vecinas se abren como puertas y se curvan
// hacia la cámara. Sin WebGL o con movimiento reducido se conserva la cuadrícula.

const CARD_W = 1;
const CARD_H = 1.25;
const CAMERA_Z = 3.2;
const SEGMENTS = 72;
const TEXTURE_W = 800;
const TEXTURE_H = 1000;
const OFF_STAGE = 1.6;
const AUTOPLAY_MS = 4600;

const english = document.documentElement.lang === 'en';
const IMG = '/artwork/celebras-objetos/';

const CARDS = {
  'inv-bodas': { src: `${IMG}bodas-1024.webp`, focus: 0.5 },
  'inv-birthday-noche': { src: `${IMG}cumple-1024.webp`, focus: 0.5 },
  'inv-eventos': { src: `${IMG}eventos-1024.webp`, focus: 0.5 },
  'inv-temporada': { src: `${IMG}temporada-1024.webp`, focus: 0.5 },
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const smooth = (edge0, edge1, value) => {
  const k = clamp((value - edge0) / (edge1 - edge0));
  return k * k * (3 - 2 * k);
};
const wrap = (value, size) => ((value % size) + size) % size;

// Curva en la que descansan las vecinas: nace detrás de la tarjeta central, se abre
// y regresa hacia la cámara por el costado.
const CURVE = [[-1.12, -1.7], [-2.1, -1.85], [-0.75, 1.4], [-2, 2.55]];
const curveTable = (() => {
  const points = [];
  const lengths = [0];
  for (let i = 0; i <= 240; i += 1) {
    const t = i / 240;
    const m = 1 - t;
    const weights = [m * m * m, 3 * m * m * t, 3 * m * t * t, t * t * t];
    points.push([0, 1].map((axis) => weights.reduce((sum, w, k) => sum + w * CURVE[k][axis], 0)));
    if (i) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return { points, lengths, total: lengths[240] };
})();

function pointOnCurve(arc, out) {
  const { points, lengths, total } = curveTable;
  if (arc >= total) {
    const extra = arc - total;
    out[0] = CURVE[3][0] - extra * 0.97;
    out[1] = CURVE[3][1] + Math.min(0.4, extra * 0.12);
    return out;
  }
  let low = 0;
  let high = lengths.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (lengths[middle] <= arc) low = middle; else high = middle;
  }
  const f = (Math.max(arc, 0) - lengths[low]) / ((lengths[high] - lengths[low]) || 1);
  out[0] = lerp(points[low][0], points[high][0], f);
  out[1] = lerp(points[low][1], points[high][1], f);
  return out;
}

// La imagen conserva su tamaño cerca de la bisagra y después se estira en estelas.
const KEEP = 0.42;
const arcFor = (p) => (p <= KEEP ? p : p + 9 * (p - KEEP) ** 2);
const stretchFor = (p) => (p <= KEEP ? 1 : 1 + 18 * (p - KEEP));

const scratch = [0, 0];
function foldedPoint(t, u, out) {
  if (t >= 1) {
    const p = u + 3.6 * (t - 1) ** 1.25;
    pointOnCurve(arcFor(p), out);
    out[2] = stretchFor(p) - 1;
    return out;
  }
  const opened = t < 0.5 ? t * 1.03 : 0.515 + 0.485 * smooth(0.5, 0.82, t);
  const angle = Math.PI * opened;
  const hingeX = lerp(-0.5, CURVE[0][0], 1 - (1 - t) ** 2.4);
  const hingeZ = CURVE[0][1] * t ** 0.95;
  const curl = smooth(0.5, 0.85, t);
  pointOnCurve(arcFor(u), scratch);
  out[0] = hingeX + u * Math.cos(angle) + (scratch[0] - (CURVE[0][0] - u)) * curl;
  out[1] = hingeZ + u * Math.sin(angle) + (scratch[1] - CURVE[0][1]) * curl;
  out[2] = (stretchFor(u) - 1) * curl;
  return out;
}

function cardPoint(slot, u, out) {
  if (slot <= 0) return foldedPoint(-slot, u, out);
  foldedPoint(slot, 1 - u, out);
  out[0] = -out[0];
  return out;
}

function shortestOffset(index, position, size) {
  const offset = wrap(index - position, size);
  return offset >= size / 2 ? offset - size : offset;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function paintPhoto(context, card, image) {
  const W = TEXTURE_W;
  const H = TEXTURE_H;
  const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
  const drawnW = image.naturalWidth * scale;
  const drawnH = image.naturalHeight * scale;
  context.drawImage(image, clamp(W / 2 - drawnW * card.focus, W - drawnW, 0), (H - drawnH) / 2, drawnW, drawnH);
}

const CARD_VERTEX = `
  attribute float smear;
  varying vec2 vUv;
  varying float vSmear;
  void main() {
    vUv = uv;
    vSmear = smear;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const CARD_FRAGMENT = `
  uniform sampler2D map;
  varying vec2 vUv;
  varying float vSmear;
  void main() {
    vec2 size = vec2(${CARD_W.toFixed(2)}, ${CARD_H.toFixed(2)});
    vec2 corner = abs(vUv * size - size * 0.5) - size * 0.5 + 0.04;
    float distanceToEdge = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - 0.04;
    float alpha = clamp(0.5 - distanceToEdge / max(fwidth(distanceToEdge), 1e-5), 0.0, 1.0);
    if (alpha <= 0.0) discard;
    vec3 color = vec3(0.0);
    float spread = vSmear * 0.012;
    for (int i = 0; i < 7; i++) {
      color += texture2D(map, vec2(clamp(vUv.x + (float(i) / 6.0 - 0.5) * spread, 0.0, 1.0), vUv.y)).rgb;
    }
    gl_FragColor = vec4(color / 7.0, alpha);
  }`;

// Filo de color en los costados: cada canal se desplaza una distancia distinta.
const EDGE_FRAGMENT = `
  uniform sampler2D frame;
  uniform vec2 resolution;
  uniform float strength;
  varying vec2 vUv;
  void main() {
    vec2 fromCentre = vUv - 0.5;
    float side = smoothstep(0.34, 1.0, abs(fromCentre.x) * 2.0);
    vec2 step = normalize(fromCentre * resolution + 1e-4) * strength * side * side / resolution;
    vec3 light = vec3(0.0), covered = vec3(0.0), total = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float t = float(i) / 11.0;
      vec3 weight = max(vec3(1.0 - abs(t - 1.0) * 1.9, 1.0 - abs(t - 0.5) * 2.4, 1.0 - t * 1.9), 0.0) + 0.02;
      vec4 sampled = texture2D(frame, vUv - step * t);
      light += sampled.rgb * weight;
      covered += sampled.a * weight;
      total += weight;
    }
    covered /= total;
    gl_FragColor = vec4(light / total, max(max(covered.r, covered.g), covered.b));
  }`;

const EDGE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`;

async function startCarousel(section, stage, items, ui) {
  const THREE = await import('three');
  const images = await Promise.all(items.map(({ card }) => loadImage(card.src)));

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  camera.position.z = CAMERA_Z;
  const narrow = matchMedia('(max-width:860px)').matches;
  const frame = new THREE.WebGLRenderTarget(1, 1, { samples: narrow ? 2 : 4 });

  const edgeMaterial = new THREE.ShaderMaterial({
    uniforms: { frame: { value: frame.texture }, resolution: { value: new THREE.Vector2(1, 1) }, strength: { value: 1 } },
    vertexShader: EDGE_VERTEX,
    fragmentShader: EDGE_FRAGMENT,
    depthTest: false,
    depthWrite: false,
  });
  const edgeScene = new THREE.Scene();
  const triangle = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const edgeMesh = new THREE.Mesh(triangle, edgeMaterial);
  edgeMesh.frustumCulled = false;
  edgeScene.add(edgeMesh);
  const edgeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const meshes = items.map(({ card }, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_W;
    canvas.height = TEXTURE_H;
    paintPhoto(canvas.getContext('2d'), card, images[index]);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = anisotropy;

    const columns = SEGMENTS + 1;
    const uv = new Float32Array(columns * 4);
    const indices = [];
    for (let i = 0; i < columns; i += 1) {
      uv.set([i / SEGMENTS, 1, i / SEGMENTS, 0], i * 4);
      if (i < SEGMENTS) indices.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(columns * 6), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geometry.setAttribute('smear', new THREE.BufferAttribute(new Float32Array(columns * 2), 1).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(indices);

    const material = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture } },
      vertexShader: CARD_VERTEX,
      fragmentShader: CARD_FRAGMENT,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  });

  const motion = { position: -0.9, velocity: 0, target: 0, dragging: false };
  const size = items.length;
  let cardPx = 300;
  let slotPx = 375;
  let raf = 0;
  let last = 0;
  let onScreen = false;
  let touched = false;
  let hovered = false;

  const point = [0, 0, 0];
  function shape(mesh, slot) {
    const position = mesh.geometry.attributes.position;
    const smear = mesh.geometry.attributes.smear;
    for (let i = 0; i <= SEGMENTS; i += 1) {
      cardPoint(slot, i / SEGMENTS, point);
      position.array.set([point[0], CARD_H / 2, point[1], point[0], -CARD_H / 2, point[1]], i * 6);
      smear.array[i * 2] = point[2];
      smear.array[i * 2 + 1] = point[2];
    }
    position.needsUpdate = true;
    smear.needsUpdate = true;
  }

  function render() {
    meshes.forEach((mesh, index) => {
      const slot = shortestOffset(index, motion.position, size);
      mesh.visible = Math.abs(slot) < OFF_STAGE;
      if (mesh.visible) {
        shape(mesh, slot);
        mesh.renderOrder = -Math.round(Math.abs(slot) * 100);
      }
    });
    renderer.setRenderTarget(frame);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(edgeScene, edgeCamera);
  }

  function tick(now) {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    if (!motion.dragging) {
      // Resorte con amortiguación crítica: estable a cualquier cuadro por segundo.
      const omega = 9.5;
      const offset = motion.position - motion.target;
      const decay = Math.exp(-omega * dt);
      const carry = motion.velocity + omega * offset;
      motion.position = motion.target + (offset + carry * dt) * decay;
      motion.velocity = (motion.velocity - omega * carry * dt) * decay;
      if (Math.abs(motion.position - motion.target) < 1e-4 && Math.abs(motion.velocity) < 1e-3) {
        motion.position = motion.target;
        motion.velocity = 0;
      }
    }
    render();
    const moving = motion.dragging || motion.position !== motion.target;
    if (moving && onScreen) raf = requestAnimationFrame(tick);
    else last = 0;
  }
  const wake = () => {
    if (!raf && onScreen) raf = requestAnimationFrame(tick);
  };

  function activeIndex() {
    return wrap(Math.round(motion.target), size);
  }
  function syncActive() {
    const active = activeIndex();
    items.forEach(({ element }, index) => element.toggleAttribute('data-on', index === active));
    ui.tabs.forEach((tab, index) => tab.setAttribute('aria-pressed', String(index === active)));
  }
  function go(delta) {
    motion.target = Math.round(motion.target) + delta;
    syncActive();
    wake();
  }
  function userGo(delta) {
    touched = true;
    go(delta);
  }

  function resize() {
    const W = Math.max(1, stage.clientWidth);
    const H = Math.max(1, stage.clientHeight);
    cardPx = Math.min(W * (W / H < 1.15 ? 0.52 : 0.36), H * 0.54);
    slotPx = cardPx * 1.25;
    const ratio = Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = (2 * Math.atan(H / 2 / cardPx / CAMERA_Z) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    frame.setSize(Math.round(W * ratio), Math.round(H * ratio));
    edgeMaterial.uniforms.resolution.value.set(Math.round(W * ratio), Math.round(H * ratio));
    edgeMaterial.uniforms.strength.value = Math.min(W, cardPx / 0.36) * (narrow ? 0.011 : 0.022) * ratio;
    if (onScreen) render();
  }
  new ResizeObserver(resize).observe(stage);

  // Arrastrar de lado recorre; el scroll vertical sigue siendo de la página.
  let drag = null;
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    stage.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, startX: event.clientX, from: motion.position, lastX: event.clientX, lastT: performance.now(), speed: 0, moved: false };
    motion.dragging = true;
    motion.velocity = 0;
    stage.toggleAttribute('data-dragging', true);
    wake();
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const now = performance.now();
    drag.speed = drag.speed * 0.7 + (-(event.clientX - drag.lastX) / slotPx / (Math.max(now - drag.lastT, 1) / 1000)) * 0.3;
    drag.lastX = event.clientX;
    drag.lastT = now;
    if (Math.abs(event.clientX - drag.startX) > 8) drag.moved = true;
    motion.position = drag.from - (event.clientX - drag.startX) / slotPx;
    wake();
  });
  const release = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const finished = drag;
    drag = null;
    motion.dragging = false;
    stage.removeAttribute('data-dragging');
    if (finished.moved) {
      const speed = performance.now() - finished.lastT > 120 ? 0 : finished.speed;
      touched = true;
      motion.velocity = speed;
      motion.target = Math.round(motion.position + clamp(speed * 0.12, -0.6, 0.6));
      syncActive();
      wake();
    } else if (event.type === 'pointerup') {
      const bounds = stage.getBoundingClientRect();
      const fromCentre = event.clientX - bounds.left - bounds.width / 2;
      if (Math.abs(fromCentre) <= cardPx / 2) items[activeIndex()].link.click();
      else userGo(Math.sign(fromCentre));
    }
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerenter', () => { hovered = true; });
  stage.addEventListener('pointerleave', () => { hovered = false; });
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') userGo(1);
    else if (event.key === 'ArrowLeft') userGo(-1);
    else if (event.key === 'Enter') items[activeIndex()].link.click();
    else return;
    event.preventDefault();
  });
  ui.tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => userGo(shortestOffset(index, Math.round(motion.target), size)));
  });

  // Avanza solo mientras se ve; deja de hacerlo en cuanto la persona interviene.
  setInterval(() => {
    if (!touched && onScreen && !hovered && !motion.dragging && !document.hidden) go(1);
  }, AUTOPLAY_MS);

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) wake();
  }, { threshold: 0.15 }).observe(stage);

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    meshes.forEach((mesh) => { mesh.material.uniforms.map.value.needsUpdate = true; });
    wake();
  });

  syncActive();
  resize();
  section.setAttribute('data-fold-ready', '');
  render();
}

function init() {
  const section = document.getElementById('tipos-invitacion');
  const list = section?.querySelector('.inv-occasions');
  if (!section || !list) return;
  const connection = navigator.connection;
  const quiet = new URLSearchParams(location.search).has('quieto')
    || matchMedia('(prefers-reduced-motion: reduce)').matches
    || connection?.saveData === true;
  if (quiet) return;

  const items = [...list.children]
    .map((element) => ({ element, card: CARDS[element.className], link: element.querySelector('.inv-cover') }))
    .filter((item) => item.card && item.link);
  if (items.length !== list.children.length) return;

  const stage = document.createElement('div');
  stage.className = 'inv-fold-stage';
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-roledescription', english ? 'carousel' : 'carrusel');
  stage.setAttribute('aria-label', english ? 'Occasions. Use the arrow keys to move and Enter to open.' : 'Ocasiones. Usa las flechas para moverte y Enter para abrir.');

  const nav = document.createElement('div');
  nav.className = 'inv-fold-tabs';
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', english ? 'Choose an occasion' : 'Elige una ocasión');
  const tabs = items.map(({ link }) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.textContent = link.querySelector('.inv-cover-name').firstChild.textContent.trim();
    nav.append(tab);
    return tab;
  });

  section.setAttribute('data-fold', '');
  items.forEach(({ element }) => element.setAttribute('data-fold-item', ''));
  items[0].element.setAttribute('data-on', '');
  tabs.forEach((tab, index) => tab.setAttribute('aria-pressed', String(index === 0)));
  list.before(stage, nav);

  const undo = () => {
    section.removeAttribute('data-fold');
    items.forEach(({ element }) => element.removeAttribute('data-fold-item'));
    stage.remove();
    nav.remove();
  };
  const loader = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    loader.disconnect();
    startCarousel(section, stage, items, { tabs }).catch(undo);
  }, { rootMargin: '900px 0px' });
  loader.observe(stage);
}

init();
