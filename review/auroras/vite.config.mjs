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
      .replace('vertexShader: bandVertex,', 'side: 2, forceSinglePass: true, vertexShader: bandVertex,')
      .replace('time, dark, pulse, pulseCenter, wind:', 'variant: window.curtainMode, time, dark, pulse, pulseCenter, wind:')
      .replace('renderer.render(scene, camera);', 'if (window.measureLandscape) window.measureLandscape(renderer, () => renderer.render(scene, camera)); else renderer.render(scene, camera);');
  }
}] });
