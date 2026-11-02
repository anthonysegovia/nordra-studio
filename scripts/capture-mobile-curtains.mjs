// Offline only. Draw the production ribbons on transparent black, with the commercial palettes.
import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
const output = 'public/nordra/v548/assets';
mkdirSync(output, { recursive: true });
const source = readFileSync('src/site/scripts/motion.js', 'utf8');
const palettes = [...source.matchAll(/cyan=vec3\(([^)]+)\),?\s*;?\s*blue=vec3\(([^)]+)\),?\s*;?\s*violet=vec3\(([^)]+)\)/g)]
  .map(match => match.slice(1).map(rgb => rgb.split(',').map(Number)));
if (palettes.length !== 7) throw new Error('Expected seven aurora palettes');
const vertexShader = readFileSync('src/site/landscape/curtain.vert', 'utf8');
const fragmentShader = readFileSync('src/site/landscape/curtain.frag', 'utf8')
  .replace('uniform float time', 'uniform vec3 lowColor, middleColor, highColor; uniform float time')
  .replace('mix(0.012,1.0,clearance)', '1.0') // commercial overlays have different copy placement
  .replace('gl_FragColor=vec4(emission,0.0);', `float alpha=clamp(max(max(emission.r,emission.g),emission.b),0.0,0.9);
    vec3 tint=mix(lowColor,middleColor,smoothstep(0.02,0.21,h));
    tint=mix(tint,highColor,smoothstep(0.16,0.48,h));
    gl_FragColor=vec4(tint*alpha,alpha);`);
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  // Serve only the two installed Three modules inside this offline browser.
  await page.route('http://capture.test/**', route => {
    const name = new URL(route.request().url()).pathname.slice(1);
    if (['three.module.js','three.core.js'].includes(name)) return route.fulfill({
      contentType:'text/javascript', body:readFileSync('node_modules/three/build/'+name)
    });
    return route.fulfill({contentType:'text/html',body:'<!doctype html><canvas></canvas>'});
  });
  await page.goto('http://capture.test/');
  const pngs = await page.evaluate(async ({vertexShader,fragmentShader,palettes}) => {
    const T = await import('/three.module.js');
    const renderer = new T.WebGLRenderer({canvas:document.querySelector('canvas'),alpha:true,antialias:true});
    renderer.setSize(840,546,false);
    renderer.setClearColor(0,0);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(36,840/546,0.5,1000);
    camera.position.set(0,4.2,44);camera.lookAt(0,41,-104);
    for (const seed of [1.3,4.1]) {
      const uniforms = Object.fromEntries(Object.entries({seed,time:60,dark:1,level:1,sweep:1.3,pulse:0,
        pulseCenter:0,eye:camera.position,lowColor:new T.Vector3(),middleColor:new T.Vector3(),highColor:new T.Vector3()
      }).map(([key,value])=>[key,{value}]));
      const material = new T.ShaderMaterial({vertexShader,fragmentShader,uniforms,side:T.DoubleSide,forceSinglePass:true,
        transparent:true,depthWrite:false,blending:T.CustomBlending,blendSrc:T.OneFactor,blendDst:T.OneFactor});
      const mesh = new T.Mesh(new T.PlaneGeometry(1,1,320,24),material);
      mesh.frustumCulled=false;scene.add(mesh);
    }
    return palettes.map(colors => {
      for (const mesh of scene.children) ['lowColor','middleColor','highColor'].forEach((key,i)=>
        mesh.material.uniforms[key].value.fromArray(colors[i]));
      renderer.render(scene,camera);
      return renderer.domElement.toDataURL('image/png').split(',')[1];
    });
  },{vertexShader,fragmentShader,palettes});
  for (const [index,png] of pngs.entries()) {
    const result = spawnSync('ffmpeg',['-y','-loglevel','error','-i','pipe:0','-frames:v','1','-c:v','libwebp',
      '-compression_level','6','-q:v','86',output+'/aurora-mobile-'+index+'.webp'],{input:Buffer.from(png,'base64')});
    if(result.status!==0) throw Error(String(result.stderr));
  }
} finally { await browser.close(); }