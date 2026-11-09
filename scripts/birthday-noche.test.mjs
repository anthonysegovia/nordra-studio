import assert from 'node:assert/strict';
import test from 'node:test';
import {renderInvitation} from '../src/celebrations/caja-de-regalo/template.mjs';
import {readFileSync,existsSync} from 'node:fs';
const read=file=>readFileSync(file,'utf8');

test('Camila and the birthday hero use real responsive images with descriptive alternatives',()=>{
  for(const [path,selector] of [['invitaciones/camila-30/index.html','/birthday-caja/cerrada-'],['cumpleanos.html','/birthday-noche/camila-portada-']]){
    const images=renderInvitation(read(path)).match(/<img\b[^>]+>/g).filter(tag=>tag.includes(selector));
    assert.ok(images.length);
    for(const image of images){
      if(path.startsWith('invitaciones/')){assert.match(image,/alt=""/);assert.ok(images.length===1);assert.ok(renderInvitation(read(path)).includes('cerrada-360.webp'));continue}
      assert.match(image,/alt="[^"]*caja[^"]+"/i);
      const set=image.match(/srcset="([^"]+)"/)[1].split(', ');
      assert.ok(set.length>=2);
      for(const item of set)assert.ok(existsSync('public'+item.split(' ')[0]));
    }
  }
  const conexion=read('invitaciones/conexion-27/index.html');
  assert.ok(conexion.includes('/src/celebrations/gafete/invitation.css'));
  assert.doesNotMatch(conexion,/camila\.css|birthday-noche/);
  assert.doesNotMatch(read('src/celebrations/invitation.css'),/NocheSora|birthday-noche/);
});

function luminance(hex){
 const rgb=hex.match(/\w\w/g).map(value=>parseInt(value,16)/255)
   .map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
 return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
test('birthday body, secondary text and interactive accents meet AA in each palette',()=>{
 const css=read('src/site/styles/tokens.css');
 for(const suffix of ['','.dark']){
   const block=css.split('body[data-scene=cumpleanos]'+suffix+' {')[1].split('}')[0];
   const value=role=>luminance(block.match(new RegExp('--'+role+': #(\\w{6});'))[1]);
   for(const role of ['ink','muted','accent']){
     const a=value(role),b=value('bg');
     assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,suffix+' '+role);
   }
 }
});

test('the birthday identity uses local Sora and every customer-facing birthday entry names Camila',()=>{
 const fonts=read('src/styles/noche-fonts.css');
 assert.match(fonts,/Sora-latin\.woff2/);assert.doesNotMatch(fonts,/cormorant|liga/i);
 for(const file of ['cumpleanos.html','invitaciones/camila-30/index.html','public/invitaciones/camila-30/fecha.ics','src/i18n/cumpleanos.en.json','src/i18n/invitaciones.en.json','src/lib/occasionPanels.ts','src/data/invitationOccasions.ts','server/sample-occasions.js']){
   const value=renderInvitation(read(file));assert.match(value,/Camila/,file);assert.doesNotMatch(value,/\bsof[ií]a\b/i,file);
 }
});
test('birthday RSVP states meet AA on their badge backgrounds in both themes',()=>{
 const css=read('src/styles/birthday-panel.css');
 for(const section of css.split('html[data-theme=dark] :is(.wedding-workspace,.wedding-operations-dialog)[data-occasion=birthday] ').slice(0,2)){
   const value=name=>luminance(section.match(new RegExp('--o-'+name+':#([0-9a-f]{6})'))[1]);
   for(const [text,bg] of [['yes','yes-bg'],['wait','wait-bg'],['no','no-bg']]){
     const a=value(text),b=value(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,text);
   }
 }
});
