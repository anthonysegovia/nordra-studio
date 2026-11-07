import {initialStyle,staticProfile} from './state.js';
import {loadFonts} from './fonts.js';
import {idleTask} from './work.js';
if(matchMedia('(max-width:700px), (pointer:coarse)').matches){
 const field=document.createElement('div');
 field.className='aurora-field';field.setAttribute('aria-hidden','true');
 document.querySelector('#bs-hero .wall').append(field);
 window.NordraMobileAurora.create(field,2);
}
const loaders={neon:()=>import('./styles/neon.js'),caja:()=>import('./styles/caja.js'),bar:()=>import('./styles/bar.js'),xv:()=>import('./styles/xv.js'),espacio:()=>import('./styles/espacio.js')};
const cache=new Map();
async function loadStyle(style){if(!cache.has(style))cache.set(style,loaders[style]().then(async module=>{if(style!=='neon')await import('./worlds.css');await loadFonts(module.fonts);return module;}));return cache.get(style);}
const style=initialStyle(location.search),staticMode=staticProfile(navigator);
document.body.dataset.world=style;if(staticMode)document.body.dataset.signStatic='true';
// First paint belongs to the server-rendered heading, not a canvas or image.
requestAnimationFrame(()=>requestAnimationFrame(async()=>{
 await document.fonts.ready;
 const {mountSign}=await idleTask(()=>import('./sign-runtime.js'));
 await mountSign({initialStyle:style,staticMode,loadStyle});
}));
