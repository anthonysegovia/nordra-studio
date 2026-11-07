/** Cap mobile candidates without understating the rendered sizes or changing desktop artwork. */
export function performanceImages() {
 return {name:'nordra-performance-images',transformIndexHtml:{order:'pre',handler(html,ctx){
  if(!/(?:index|invitaciones|bodas|cumpleanos|eventos)\.html$/.test(ctx.filename)||!html.includes('dataset.scene'))return html;
  return html.replace(/<img\b[^>]*\bsrcset="([^"]+)"[^>]*>/g,(img,set)=>{
   if(!/\d+w/.test(set))return img;
   const limit=/width="100"/.test(img)?200:800;
   const candidates=set.split(',').map(value=>value.trim()).filter(value=>Number(value.match(/(\d+)w$/)?.[1])<=limit);
   if(!candidates.length||candidates.length===set.split(',').length)return img;
   const sizes=img.match(/\bsizes="([^"]+)"/)?.[1]||'100vw';
   return `<picture style="display:contents"><source media="(max-width:700px), (pointer:coarse)" srcset="${candidates.join(', ')}" sizes="${sizes}">${img}</picture>`;
  });
 }}};
}
