import { basename, resolve } from 'node:path';

// Classic script tags isolate synchronous initialization failures. Preserve that
// boundary when Vite places their side effects in a shared ES module bundle.
// Keep the copied sources unchanged, including nordra-theatre.js.
export function isolateSiteScript(source, name) {
  return `try {\n${source}\n} catch (error) {\n  console.error(${JSON.stringify(`[Nordra site] ${name} failed to initialize`)}, error);\n}\n`;
}

/** @returns {import('vite').Plugin} */
export function siteScripts() {
  let directory;
  return {
    name: 'nordra-site-script-isolation',
    enforce: 'pre',
    configResolved(config) {
      directory = resolve(config.root, 'src/site/scripts').replaceAll('\\', '/') + '/';
    },
    transform(source, id) {
      const file = id.split('?')[0].replaceAll('\\', '/');
      if (!file.startsWith(directory) || !file.endsWith('.js')) return;
      return { code: isolateSiteScript(source, basename(file)), map: null };
    },
  };
}
