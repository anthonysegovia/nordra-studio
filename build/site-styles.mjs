import { posix } from 'node:path';

const pages = new Set(['index.html', 'en/index.html', 'estudio.html', 'negocios.html', 'invitaciones.html', 'bodas.html', 'cumpleanos.html', 'eventos.html', 'temporada.html']);

// Consolidate the final links, not source imports: shared chunks can change
// where Vite puts a rule in the cascade. Keep their emitted order byte for byte.
/** @returns {import('vite').Plugin} */
export function siteStyles() {
  const replacements = new Map(), consumers = new Map();
  return {
    name: 'nordra-ordered-site-styles',
    apply: 'build',
    enforce: 'post',
    config() {
      return { experimental: { renderBuiltUrl(file, context) {
        if (context.hostType !== 'js' || !file.endsWith('.css')) return;
        const owners = consumers.get(context.hostId) || [];
        const targets = owners.map(page => replacements.get(page)?.get(file) || file);
        if (!targets.some(target => target !== file)) return;
        // A shared JS host must mean the same URL in every consuming document.
        // Never substitute a commercial sheet into a private React page.
        if (new Set(targets).size !== 1) throw new Error(`${context.hostId}: ambiguous stylesheet consumers for ${file}`);
        return `/${targets[0]}`;
      } } };
    },
    generateBundle: {
      // enforce:post runs after Vite's HTML emission, but before its import
      // analysis. That analysis calls renderBuiltUrl for dynamic CSS preloads.
      handler(_options, bundle) {
        replacements.clear(); consumers.clear();
        for (const [page, asset] of Object.entries(bundle)) {
          if (asset.type !== 'asset' || !page.endsWith('.html')) continue;
          const visited = new Set();
          function visit(file) {
            const chunk = bundle[file];
            if (!chunk || chunk.type !== 'chunk' || visited.has(file)) return;
            visited.add(file);
            if (!consumers.has(file)) consumers.set(file, []);
            consumers.get(file).push(page);
            [...chunk.imports, ...chunk.dynamicImports].forEach(visit);
          }
          for (const match of String(asset.source).matchAll(/<script\b[^>]*src="([^"]+)"/g)) visit(match[1].replace(/^\//, ''));
        }
        for (const page of pages) {
          const html = bundle[page];
          if (!html || html.type !== 'asset') continue;
          const source = String(html.source);
          const links = [...source.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)];
          if (links.length < 2) continue;
          const files = links.map(([tag]) => {
            const href = /href="([^"]+)"/.exec(tag)?.[1];
            const file = href?.replace(/^\//, '');
            if (!file || !bundle[file] || bundle[file].type !== 'asset' || /\b(?:media|disabled|title)=/.test(tag)) {
              this.error(`${page}: expected unconditional local stylesheet: ${tag}`);
            }
            return file;
          });
          // All Vite CSS assets live together; retaining this directory preserves
          // relative url() references without rewriting CSS or changing assets.
          const directory = posix.dirname(files[0]);
          if (files.some(file => posix.dirname(file) !== directory)) {
            this.error(`${page}: stylesheets must share an asset directory`);
          }
          const css = files.map(file => String(bundle[file].source)).join('\n');
          if (/@(?:import|charset)\b/i.test(css)) this.error(`${page}: cannot concatenate CSS with @import or @charset`);
          const reference = this.emitFile({ type: 'asset', name: `${posix.basename(page, '.html')}-styles.css`, source: css });
          const fileName = this.getFileName(reference);
          if (posix.dirname(fileName) !== directory) this.error(`${page}: combined stylesheet moved asset directory`);
          replacements.set(page, new Map(files.map(file => [file, fileName])));
          let first = true;
          html.source = source.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, tag => {
            if (!first) return '';
            first = false;
            return tag.replace(/href="[^"]+"/, `href="/${fileName}"`);
          });
        }
      },
    },
  };
}
