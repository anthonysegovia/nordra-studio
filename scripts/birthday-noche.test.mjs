import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
const read=file=>readFileSync(file,'utf8');

test('Sofía and the birthday hero use real responsive images with descriptive alternatives',()=>{
  for(const [path,selector] of [['invitaciones/sofia-25/index.html','solo-'],['cumpleanos.html','sofia-portada-']]){
    const images=read(path).match(/<img\b[^>]+>/g).filter(tag=>tag.includes('/birthday-noche/'+selector));
    assert.ok(images.length);
    for(const image of images){
      assert.match(image,/alt="[^"]*globo[^"]+"/i);
      const set=image.match(/srcset="([^"]+)"/)[1].split(', ');
      assert.ok(set.length>=2);
      for(const item of set)assert.ok(existsSync('public'+item.split(' ')[0]));
    }
  }
  const conexion=read('invitaciones/conexion-27/index.html');
  assert.ok(conexion.includes('/src/celebrations/invitation.css'));
  assert.doesNotMatch(conexion,/sofia\.css|birthday-noche/);
  assert.doesNotMatch(read('src/celebrations/invitation.css'),/NocheSerif|birthday-noche/);
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
