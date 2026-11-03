import assert from 'node:assert/strict';
import test from 'node:test';
import { reminderUrl } from '../src/lib/panelExperience.ts';

const link = 'https://example.test/invitacion#personal=abc&persona=1';
for (const [kind, names, es, en] of [
  ['individual',['Clara Ponce'],'Hola, Clara. Nos encantaría saber si podrás acompañarnos. Aquí está tu invitación:', 'Hi, Clara.'],
  ['couple',['Daniel Moreno','Isabel García'],'Hola, Daniel e Isabel. Nos encantaría saber si podrán acompañarnos. Aquí está su invitación:', 'Hi, Daniel and Isabel.'],
  ['plusOne',['Lucía Herrera',''],'Hola, Lucía. Nos encantaría saber si podrán acompañarnos. Aquí está su invitación:', 'Hi, Lucía.'],
  ['plusOne',['Valeria Castro','Fernando Ortiz'],'Hola, Valeria y Fernando. Nos encantaría saber si podrán acompañarnos. Aquí está su invitación:', 'Hi, Valeria and Fernando.'],
]) test('personal reminder for '+kind+' / '+names.join(' '),()=>{
  const invitation={kind,people:names.map(name=>({name})),link};
  for(const [english,message] of [[false,es],[true,en+" We'd love to know if you can join us. Here's your invitation:"]]){
    const url=new URL(reminderUrl(invitation,english));
    assert.equal(url.origin,'https://wa.me');
    assert.equal(url.searchParams.get('text'),message+' '+link);
  }
  assert.equal(reminderUrl({...invitation,link:''},false),'');
});
