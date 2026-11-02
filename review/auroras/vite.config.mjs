import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
const shader = name => readFileSync(new URL(name, import.meta.url), 'utf8');
// This configuration is used only by the review server. The public entry never imports the lab.
export default defineConfig({ cacheDir: 'review/auroras/.cache', plugins: [{
  name: 'review-curtains', enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/site/landscape/landscape-scene.js')) return;
    const begin = code.indexOf('const bandVertex'), end = code.indexOf('// Distant range:', begin);
    if (begin < 0 || end < 0) throw Error('Landscape shader anchors changed');
    return (code.slice(0,begin) + 'const bandVertex = ' + JSON.stringify(shader('ribbon.vert')) +
      '; const bandFragment = ' + JSON.stringify(shader('ribbon.frag')) + ';\n' + code.slice(end))
      .replace('renderer.debug.onShaderError = () => { shaderFailed = true; };', 'renderer.debug.onShaderError = (gl, program, vs, fs) => { console.error(gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs)); shaderFailed = true; };').replace('vertexShader: bandVertex,', 'side: 2, forceSinglePass: true, vertexShader: bandVertex,')
      .replace('time, dark, pulse, pulseCenter, wind:', 'variant: window.curtainMode, time, dark, pulse, pulseCenter, wind:')
      .replace('vec3 stars = starColour', 'float polarGlow = exp(-pow((d.y - 0.26 - 0.04*sin(5.0*d.x+time*0.075))/0.11,2.0)); c += vec3(0.008,0.032,0.029)*polarGlow*aurora*dark; vec3 stars = starColour')
      .replace('float far = 1.0 - smoothstep', 'if(dark > 0.0){ vec2 blur = vec2(0.002 + abs(ripple.x)*0.006,0.004); reflection = 0.80*(0.5*reflection + 0.25*(texture2D(tDiffuse,uv+blur).rgb + texture2D(tDiffuse,uv-blur).rgb)); } float far = 1.0 - smoothstep')
      .replace('pulse.value = activity.pulse;', 'window.reviewPulse = pulse.value = activity.pulse;')
      .replace('renderer.render(scene, camera);', 'if (window.measureLandscape) window.measureLandscape(renderer, () => renderer.render(scene, camera)); else renderer.render(scene, camera);');
  }
}] });
