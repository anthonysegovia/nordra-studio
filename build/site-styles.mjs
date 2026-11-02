import { posix } from 'node:path';

const pages = new Set(['index.html', 'estudio.html', 'negocios.html', 'invitaciones.html', 'bodas.html', 'cumpleanos.html', 'eventos.html', 'temporada.html']);

// Consolidate the final links, not source imports: shared chunks can change
// where Vite puts a rule in the cascade. Keep their emitted order byte for byte.
/** @returns {import('vite').Plugin} */
export function siteStyles() {
  return {
    name: 'nordra-ordered-site-styles',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
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
