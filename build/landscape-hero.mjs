// One poster and stage for the page heroes that share the home landscape.
const asset = (name, theme, format) => `/nordra/v552/assets/landscape-${name}-${theme}-${format}.webp`;
const data = (name, format) => `data-light="${asset(name, 'light', format)}" data-dark="${asset(name, 'dark', format)}"`;
const sizes = { mobile: [780, 1552], tablet: [820, 1086], compact: [1440, 806], desktop: [1920, 986], wide: [2560, 986] };
const box = format => `width="${sizes[format][0]}" height="${sizes[format][1]}"`;

// Runs before the first paint of the hero: the early body script has already set the theme.
const script = `<script>(()=>{const p=document.currentScript.parentElement.querySelector('.landscape-poster'),c=p.querySelector('picture'),i=c.querySelector('img'),s=c.querySelectorAll('source');const u=(n,k)=>n.dataset[k],o=k=>u([...s].find(x=>matchMedia(x.media).matches)||i,k);function t(){const k=document.body.classList.contains('dark')?'dark':'light';if(p.dataset.theme===k)return;if(p.dataset.theme)i.fetchPriority='low';s.forEach(x=>x.srcset=u(x,k));i.src=u(i,k);p.dataset.theme=k}t();addEventListener('nordra-theme-prepare',e=>{const k=e.detail.dark?'dark':'light',n=new Image;n.src=o(k);e.detail.waitUntil(n.decode().catch(()=>{}))});new MutationObserver(t).observe(document.body,{attributes:true,attributeFilter:['class']});addEventListener('nordra-theme',t);window.NordraLandscapePoster={phase:'final',final(){},started(){}}})()</script>`;

export function landscapeHero(html) {
  return html.replace(/\{\{landscape:([a-z]+):(right|left|center)\}\}/, (_, page, side) => {
    const sources = [['(max-width:700px)', 'page', 'mobile'], ['(max-width:999px)', 'page', 'tablet'], ['(max-width:1600px)', page, 'compact'], ['(min-width:2200px)', page, 'wide']];
    const tags = sources.map(([media, name, format]) => `<source media="${media}" ${box(format)} ${data(name, format)}>`).join('');
    const still = asset(page, 'light', 'desktop');
    return `<div class="landscape-poster" aria-hidden="true"><picture>${tags}<img ${box('desktop')} alt="" fetchpriority="high" ${data(page, 'desktop')}></picture><noscript><img src="${still}" alt="" ${box('desktop')}></noscript></div><div class="horizon-landscape" data-composition="${side}" aria-hidden="true"></div>${script}`;
  });
}
