import {buildSync} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {seasons} from '../src/data/invitationPricing.ts';
import {chapterId, cover} from '../src/seasonal/order.mjs';

function renderCollection() {
  const tabs = seasons.map(season => {
    const id = chapterId(season.id);
    return `<button type="button" role="tab" id="tab-${id}" aria-controls="${id}" aria-selected="false"><span>${season.name}</span><small data-season-return hidden></small></button>`;
  }).join('');
  const panels = seasons.map(season => {
    const id = chapterId(season.id);
    const cards = season.designs.map(design => {
      const url = design.demo ?? season.demo;
      const image = design.cover ?? cover(season,780);
      const responsive = design.cover ? '' : ` srcset="${cover(season,390)} 390w, ${image} 780w" sizes="(max-width:700px) 80vw, (max-width:1150px) 30vw, 390px"`;
      const message = encodeURIComponent(`Hola, Nordra. Me gustaría la invitación de temporada ${design.name}.`);
      const snow = season.id === 'posadas';
      return `<article class="seasonal-demo">
        <div class="seasonal-cover${snow ? ' living-snow' : ''}"${snow ? ' data-living="snow"' : ''}><img src="${image}"${responsive} width="390" height="844" loading="lazy" alt="">${snow ? '<div class="snow-layer" aria-hidden="true"></div>' : ''}</div>
        <div class="seasonal-demo-copy"><h3>${design.name}</h3><p>${design.description}</p>
        <div class="design-actions"><a href="${url}" target="_blank" rel="noopener">Ver diseño <span aria-hidden="true">↗</span></a><a href="https://wa.me/528129022231?text=${message}" target="_blank" rel="noopener" data-analytics-whatsapp="seasonal_design" data-analytics-label="${design.name}">Lo quiero</a></div></div>
      </article>`;
    }).join('');
    return `<section class="seasonal-chapter" id="${id}" aria-labelledby="title-${id}">
      <header><h3 id="title-${id}">${season.name}</h3><p>${season.caption}</p></header>
      <div class="seasonal-demo-grid">${cards}</div></section>`;
  }).join('');
  return `<div class="seasonal-tabs" role="tablist" aria-label="Temporada" hidden>${tabs}</div>${panels}`;
}

export function renderSeasonalPage(html) {
  if (!html.includes('{{seasonal:head}}')) return html;
  // Bundle the selector and its single source of dates; do not copy a calendar
  // into this renderer or into the HTML. The result is a small classic script.
  const code = buildSync({entryPoints:[fileURLToPath(new URL('../src/seasonal/prepaint.js',import.meta.url))],bundle:true,write:false,minify:true,format:'iife',platform:'browser',target:'es2020'}).outputFiles[0].text;
  const fallback = seasons.find(season => season.id === 'posadas');
  return html.replace('{{seasonal:head}}',code.replaceAll('</script','<\\/script'))
    .replace('{{seasonal:collection}}',renderCollection())
    .replaceAll('{{seasonal:fallback-demo}}',fallback.demo)
    .replaceAll('{{seasonal:fallback-label}}',fallback.label)
    .replaceAll('{{seasonal:fallback-cover}}',cover(fallback,780));
}
export function seasonalPagePlugin() {
  return {name:'nordra-seasonal-page',transformIndexHtml:{order:'pre',handler:renderSeasonalPage}};
}
