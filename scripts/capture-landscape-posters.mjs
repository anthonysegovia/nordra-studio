// Offline capture only: no capture flag or hook is shipped in the scene.
// Serve a production build, then run with --tools pointing at an existing
// package.json whose environment already provides Playwright. FFmpeg must be on PATH.
// Example: node scripts/capture-landscape-posters.mjs --url http://127.0.0.1:5197
//   --tools "E:/Nordra Studio/Revision saneamiento/2026-10-29/package.json"
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const { values } = parseArgs({ options: {
  url: { type: 'string', default: 'http://127.0.0.1:5197' },
  build: { type: 'string', default: 'dist' },
  tools: { type: 'string' },
  chrome: { type: 'string', default: 'C:/Program Files/Google/Chrome/Application/chrome.exe' },
  output: { type: 'string', default: 'public/nordra/v544/assets' },
  evidence: { type: 'string', default: 'review/retrato-paisaje' },
} });
const require = createRequire(values.tools ? path.resolve(values.tools) : import.meta.url);
const { chromium } = require('playwright');
const sceneFile = fs.readdirSync(path.join(values.build, 'assets')).find(file => /^landscape-scene-.*\.js$/.test(file));
assert.ok(sceneFile, 'Build the site first');
fs.mkdirSync(values.output, { recursive: true }); fs.mkdirSync(values.evidence, { recursive: true });
const browser = await chromium.launch({ executablePath: values.chrome, headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader'] });
const records = [];
try {
  const viewports = { compact: { width: 1440, height: 900 }, desktop: { width: 1920, height: 900 }, wide: { width: 2560, height: 1080 }, mobile: { width: 390, height: 844 } };
  for (const format of Object.keys(viewports)) for (const theme of ['light', 'dark']) {
    const mobile = format === 'mobile';
    const context = await browser.newContext({ viewport: viewports[format], deviceScaleFactor: mobile ? 2 : 1 });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    });
    const page = await context.newPage();
    // Keep the actual layout and fonts, but invoke the scene alone in its existing
    // paused/final state. This also works when the normal loader keeps a poster.
    await page.route(url => url.pathname === '/', async route => {
      const response = await route.fetch();
      const body = (await response.text())
        .replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
      await route.fulfill({ response, body });
    });
    await page.route('**/assets/landscape-scene-*.js', async route => {
      const response = await route.fetch(); let body = await response.text();
      const match = body.match(/(\w+)=(\w+)\.domElement;\1\.setAttribute\("aria-hidden","true"\)/);
      assert.ok(match, 'Renderer capture anchor changed; inspect the new build');
      body = body.replace(match[0], `${match[1]}=${match[2]}.domElement;{const original=${match[2]}.render;${match[2]}.render=function(scene,camera){if(scene.isScene&&camera.isPerspectiveCamera&&camera.position.y>0)window.posterCapture={scene,camera,renderer:this};return original.call(this,scene,camera)}};${match[1]}.setAttribute("aria-hidden","true")`);
      // Capture at the requested 2× resolution; only this intercepted response
      // lifts the mobile DPR cap. The production source/build remain untouched.
      if (mobile) { assert.match(body, /name:"mobile",dpr:1\.5/); body = body.replace(/name:"mobile",dpr:1\.5/, 'name:"mobile",dpr:2'); }
      await route.fulfill({ response, body });
    });
    await page.goto(`${values.url}/?theme=${theme}&motion=paused`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async ({ file, dark }) => {
      const { createLandscapeScene } = await import(`/assets/${file}`);
      await createLandscapeScene(document.querySelector('.horizon-landscape'), { paused: true, dark });
    }, { file: sceneFile, dark: theme === 'dark' });
    await page.waitForFunction(() => document.querySelector('.horizon-landscape').classList.contains('has-scene'));
    const capture = await page.evaluate(() => {
      const { renderer, scene, camera } = window.posterCapture;
      renderer.render(scene, camera);
      const png = renderer.domElement.toDataURL('image/png');
      const rect = renderer.domElement.getBoundingClientRect();
      const point = camera.position.clone();
      const y = v => (1 - v.clone().project(camera).y) * rect.height / 2;
      const mountain = scene.children.find(object => object.isGroup);
      let summitY = Infinity, frontZ = -Infinity;
      mountain.traverse(object => {
        const positions = object.geometry?.attributes.position;
        if (positions) for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
          summitY = Math.min(summitY, y(point));
          frontZ = Math.max(frontZ, point.z);
        }
      });
      const sun = scene.children.find(object => object.material?.uniforms.parhelion).material.uniforms.sun.value.clone().multiplyScalar(800).add(camera.position);
      const baseY = y(point.set(0, 0, frontZ));
      return { png, canvas: { width: rect.width, height: rect.height }, summitY, baseY, massifHeight: baseY - summitY,
        horizonY: y(point.set(0, 0, -800)), sunX: (sun.clone().project(camera).x + 1) * rect.width / 2,
        sunY: y(sun), camera: camera.position.toArray() };
    });
    const name = `landscape-poster-${theme}-${format}`;
    const png = Buffer.from(capture.png.split(',')[1], 'base64'); delete capture.png;
    const rawPath = path.join(values.evidence, `${name}.png`);
    fs.writeFileSync(rawPath, png);
    const webpPath = path.join(values.output, `${name}.webp`);
    let quality;
    for (quality of [92, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45]) {
      const encoded = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rawPath, '-frames:v', '1', '-c:v', 'libwebp', '-compression_level', '6', '-q:v', String(quality), webpPath], { windowsHide: true, encoding: 'utf8' });
      assert.equal(encoded.status, 0, encoded.stderr || 'FFmpeg failed');
      if (fs.statSync(webpPath).size <= (mobile ? 65000 : 120000)) break;
    }
    const bytes = fs.readFileSync(webpPath);
    assert.ok(bytes.length <= 120000, `${name} exceeds 120 KB`);
    records.push({ file: webpPath, width: png.readUInt32BE(16), height: png.readUInt32BE(20), bytes: bytes.length,
      quality, sha256: createHash('sha256').update(bytes).digest('hex'), ...capture });
    console.log(records.at(-1));
    await context.close();
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(values.evidence, 'poster-generation.json'), JSON.stringify({ sceneFile, records }, null, 2));
