import {buildSync} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {seasons} from '../src/data/invitationPricing.ts';
import {cover} from '../src/seasonal/order.mjs';

export function renderSeasonalPage(html) {
  if (!html.includes('{{seasonal:head}}')) return html;
  // Bundle the selector and its single source of dates; do not copy a calendar
  // into this renderer or into the HTML. The result is a small classic script.
  const code = buildSync({entryPoints:[fileURLToPath(new URL('../src/seasonal/prepaint.js',import.meta.url))],bundle:true,write:false,minify:true,format:'iife',platform:'browser',target:'es2020'}).outputFiles[0].text;
  const fallback = seasons[0];
  return html.replace('{{seasonal:head}}',code.replaceAll('</script','<\\/script'))
    .replaceAll('{{seasonal:fallback-demo}}',fallback.demo)
    .replaceAll('{{seasonal:fallback-label}}',fallback.label)
    .replaceAll('{{seasonal:fallback-cover}}',cover(fallback,780));
}
export function seasonalPagePlugin() {
  return {name:'nordra-seasonal-page',transformIndexHtml:{order:'pre',handler:renderSeasonalPage}};
}
