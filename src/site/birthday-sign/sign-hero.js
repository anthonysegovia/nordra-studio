import {initialStyle,staticProfile} from './state.js';
import {loadFonts} from './fonts.js';
const loaders={neon:()=>import('./styles/neon.js'),caja:()=>import('./styles/caja.js'),bar:()=>import('./styles/bar.js'),xv:()=>import('./styles/xv.js'),espacio:()=>import('./styles/espacio.js')};
const cache=new Map();
async function loadStyle(style){if(!cache.has(style))cache.set(style,loaders[style]().then(async module=>{await loadFonts(module.fonts);return module;}));return cache.get(style);}
const style=initialStyle(location.search),staticMode=staticProfile(navigator);
document.body.dataset.world=style;if(staticMode)document.body.dataset.signStatic='true';
// First paint belongs to the server-rendered heading, not a canvas or image.
requestAnimationFrame(()=>requestAnimationFrame(()=>import('./sign-runtime.js').then(({mountSign})=>mountSign({initialStyle:style,staticMode,loadStyle}))));
