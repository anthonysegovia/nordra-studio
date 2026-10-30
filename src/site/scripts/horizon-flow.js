/* Procedural translucent 3D ribbons; the approved image is only a static fallback. */
(() => {
  const host = document.querySelector('.horizon-hero .horizon-light');
  if (!host) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const mobile = matchMedia('(max-width:700px)');
  const constrained = navigator.connection?.saveData === true ||
    (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  const canvas = document.createElement('canvas');
  canvas.className = 'horizon-flow'; canvas.setAttribute('aria-hidden', 'true');
  let gl, program, buffer, indices, uniforms, count;
  let raf = 0, last = 0, elapsed = 0, visible = false, ready = false, disposed = false;
  let pixelRatio = 1, resolutionScale = 1, slowFrames = 0;
  const paused = () => reduce.matches || document.body.dataset.journeyMotion === 'paused' || document.hidden || !visible;
  const profile = () => constrained ? { dpr: 1.5, pixels: 1500000, fps: 30 } :
    mobile.matches ? { dpr: 2, pixels: 2000000, fps: 30 } : { dpr: 2, pixels: 4200000, fps: 60 };
  const vertex = `precision highp float;
    attribute vec2 position;
    uniform float time, band, halo;
    varying vec2 uv;
    varying vec3 normal;
    varying float depth;
    vec3 surface(vec2 p) {
      float x = (p.x * 2.0 - 1.0) * 1.18;
      float v = p.y * 2.0 - 1.0;
      float phase = band * 1.9;
      float clock = time * (0.34 + band * 0.032);
      float spread = 0.24 + 0.76 * (x * x / 1.3924);
      float arc = -0.40 + 0.58 * (1.0 - cos(x * 2.45));
      arc += spread * (0.34 * sin(x * 3.1 + phase + clock) + (band - 1.0) * 0.12);
      arc += 0.035 * sin(clock * 0.8 + phase);
      float twist = 0.56 * sin(x * 3.4 + phase - clock * 0.7);
      float width = (0.11 + 0.12 * spread) * (1.0 + 0.16 * sin(x * 4.0 + phase + clock));
      width *= mix(1.0, 2.7, halo);
      float y = arc + v * width * cos(twist);
      float z = (band - 1.0) * 0.48 + 0.06 * sin(x * 2.8 + phase + clock);
      z += v * width * sin(twist) + (1.0 - v * v) * 0.075;
      return vec3(x, y, z);
    }
    void main() {
      uv = position;
      vec3 p = surface(position);
      vec3 dx = surface(position + vec2(0.001, 0.0)) - surface(position - vec2(0.001, 0.0));
      vec3 dy = surface(position + vec2(0.0, 0.001)) - surface(position - vec2(0.0, 0.001));
      normal = normalize(cross(dx, dy)); depth = p.z;
      gl_Position = vec4(p.xy, -p.z * 0.3, 1.0 - p.z * 0.13);
    }`;
  const fragment = `precision highp float;
    uniform float band, halo, dark, edgeSoftness;
    varying vec2 uv;
    varying vec3 normal;
    varying float depth;
    void main() {
      float v = uv.y * 2.0 - 1.0;
      float edge = 1.0 - smoothstep(0.80, 1.0, abs(v));
      float body = (0.25 + 0.75 * exp(-v * v * 1.8)) * edge;
      vec3 n = normalize(normal);
      float diffuse = max(dot(n, normalize(vec3(-0.3, 0.65, 1.0))), 0.0);
      float pearl = pow(max(dot(n, normalize(vec3(0.15, 0.38, 1.0))), 0.0), 20.0);
      float ridgeDistance = (v - 0.77) / max(0.055, edgeSoftness);
      float ridge = exp(-ridgeDistance * ridgeDistance);
      float hue = 0.5 + 0.5 * sin(uv.x * 5.4 + band * 1.9 + n.y * 0.9);
      vec3 cyan = mix(vec3(0.16, 0.75, 0.88), vec3(0.24, 0.85, 0.94), dark);
      vec3 blue = mix(vec3(0.30, 0.49, 0.91), vec3(0.36, 0.57, 0.96), dark);
      vec3 violet = mix(vec3(0.64, 0.48, 0.89), vec3(0.65, 0.52, 0.95), dark);
      vec3 color = mix(cyan, blue, smoothstep(0.15, 0.65, hue));
      color = mix(color, violet, smoothstep(0.55, 1.0, hue) * 0.72);
      color *= 0.83 + diffuse * 0.17;
      color = mix(color, vec3(0.91, 0.98, 1.0), pearl * 0.34 + ridge * 0.60);
      float alpha = body * (0.29 + diffuse * 0.12 + pearl * 0.13) + ridge * edge * 0.30;
      alpha *= mix(0.83, 1.0, dark) * (0.90 + depth * 0.08);
      if (halo > 0.5) {
        alpha = exp(-v * v * 4.5) * edge * mix(0.065, 0.10, dark);
        color = mix(cyan, blue, hue);
      }
      // Sub-pixel dithering prevents visible steps in the colour gradients.
      float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
      color = clamp(color + dither / 255.0, 0.0, 1.0);
      gl_FragColor = vec4(color * alpha, alpha);
    }`;
  function stop() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  function draw() {
    if (!ready || disposed) return;
    gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(uniforms.time, elapsed);
    const dark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
    gl.uniform1f(uniforms.dark, dark ? 1 : 0);
    gl.uniform1f(uniforms.edgeSoftness, 1.5 / Math.max(1, canvas.height * 0.15));
    // Back to front: the surface z ranges remain separate as the ribbons move.
    for (const halo of [1, 0]) {
      gl.uniform1f(uniforms.halo, halo);
      for (let band = 0; band < 3; band++) {
        gl.uniform1f(uniforms.band, band);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
      }
    }
    canvas.dataset.elapsed = elapsed.toFixed(3); canvas.dataset.theme = dark ? 'dark' : 'light';
  }
  function resize() {
    if (!ready || disposed) return;
    const quality = profile(), width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    pixelRatio = window.devicePixelRatio || 1;
    const limit = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const scale = Math.min(pixelRatio, quality.dpr, Math.sqrt(quality.pixels / (width * height)), limit / width, limit / height) * resolutionScale;
    const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }
    canvas.dataset.quality = w + 'x' + h; canvas.dataset.targetFps = String(quality.fps); draw();
  }
  function tick(now) {
    raf = 0;
    if (paused() || !ready || disposed) return;
    const interval = 1000 / profile().fps, delta = last ? now - last : interval;
    if (!last || delta >= interval - 0.8) {
      elapsed += Math.min(delta / 1000, 0.08); last = now;
      slowFrames = delta > interval * 1.8 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 90 && resolutionScale > 0.75) {
        resolutionScale = Math.max(0.75, resolutionScale - 0.125); slowFrames = 0; resize();
      }
      if (pixelRatio !== (window.devicePixelRatio || 1)) resize();
      draw();
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    stop(); canvas.dataset.motion = paused() ? 'paused' : 'playing';
    if (ready) { draw(); if (!paused()) raf = requestAnimationFrame(tick); }
  }
  function release() {
    if (!gl || gl.isContextLost()) return;
    gl.deleteBuffer(buffer); gl.deleteBuffer(indices); gl.deleteProgram(program);
  }
  function fallback() {
    stop(); ready = false; host.classList.remove('has-flow'); host.dataset.renderer = 'image';
    canvas.remove(); release();
  }
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(result); gl.deleteShader(result); throw Error(message);
    }
    return result;
  }
  function initialize() {
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false, powerPreference: 'low-power' });
      if (!gl) throw Error('WebGL unavailable');
      const v = shader(gl.VERTEX_SHADER, vertex), f = shader(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram(); gl.attachShader(program, v); gl.attachShader(program, f); gl.linkProgram(program);
      gl.deleteShader(v); gl.deleteShader(f);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const columns = constrained ? 128 : 224, rows = 24, points = [], triangles = [];
      for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) points.push(x / columns, y / rows);
      for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
        const a = y * (columns + 1) + x, b = a + columns + 1;
        triangles.push(a, a + 1, b, b, a + 1, b + 1);
      }
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
      indices = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangles), gl.STATIC_DRAW);
      count = triangles.length;
      const attribute = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['time', 'band', 'halo', 'dark', 'edgeSoftness'].map(key => [key, gl.getUniformLocation(program, key)]));
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);
      ready = true; resize(); host.append(canvas); host.classList.add('has-flow'); host.dataset.renderer = 'ribbons-3d'; sync();
    } catch (error) { console.warn('Aurora: using static fallback.', error); fallback(); }
  }
  const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  const size = new ResizeObserver(resize), state = new MutationObserver(sync);
  view.observe(host); size.observe(host);
  state.observe(document.body, { attributes: true, attributeFilter: ['data-journey-motion', 'class'] });
  state.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync); mobile.addEventListener('change', resize);
  addEventListener('resize', resize); addEventListener('nordra-theme', sync);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
  canvas.addEventListener('webglcontextrestored', () => { if (!disposed) initialize(); });
  // Reduced motion gets the same shaded geometry, rendered once without a loop.
  initialize();
  addEventListener('pageshow', sync);
  addEventListener('pagehide', event => {
    stop(); if (event.persisted) return;
    disposed = true; view.disconnect(); size.disconnect(); state.disconnect(); release();
    document.removeEventListener('visibilitychange', sync);
    reduce.removeEventListener('change', sync); mobile.removeEventListener('change', resize);
    removeEventListener('resize', resize); removeEventListener('nordra-theme', sync); removeEventListener('pageshow', sync);
  });
})();
