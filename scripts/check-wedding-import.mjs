import test from 'node:test';
import assert from 'node:assert/strict';
import { readGuestCsv, normalizedKind, reviewImport } from '../src/lib/weddingImport.ts';
const row=(id,name,kind='',companion='')=>({id,name,kind,companion,row:2,included:true});
test('CSV supports BOM, semicolons, quoted commas, escaped quotes and CRLF',()=>{
  assert.deepEqual(readGuestCsv('\uFEFFTipo;Nombre;Acompañante\r\nPareja;"Ana, María";"Luis ""Lucho"""\r\n'),[['Tipo','Nombre','Acompañante'],['Pareja','Ana, María','Luis "Lucho"']]);
  assert.throws(()=>readGuestCsv('Name\n"Unclosed'),/invalid_csv/);
});
test('kind inference preserves individual, couple and unnamed companion places',()=>{
  assert.equal(normalizedKind('',''),'individual');assert.equal(normalizedKind('','Marta'),'couple');assert.equal(normalizedKind('+1',''),'plusOne');assert.equal(normalizedKind('plusOne',''),'plusOne');assert.equal(normalizedKind('Familia',''),null);
});
test('preview flags normalized duplicates, missing partners and invalid names, excluding unchecked rows',()=>{
  const rows=[row('1','Ána Prueba'),row('2','Luis Prueba','couple'),row('3','Marta Prueba','plusOne'),{...row('4','Ana Prueba'),included:false}];
  const result=reviewImport(rows,['ana prueba'],1);assert.equal(result.errors['1'],'duplicate_name');assert.equal(result.errors['2'],'invalid_name');assert.equal(result.errors['3'],undefined);assert.equal(result.errors['4'],undefined);assert.equal(result.people,5);
});
test('300 person limit includes unnamed plus ones and existing guests',()=>{
  assert.equal(reviewImport([row('1','Ana Prueba','+1')],[],299).overLimit,true);
  assert.equal(reviewImport([row('1','Ana Prueba','+1')],[],298).overLimit,false);
});
