import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier === './weddingCapacity' && context.parentURL?.endsWith('/src/lib/weddingImport.ts') ? './weddingCapacity.ts' : specifier, context);
} });
const { readGuestCsv, normalizedKind, reviewImport } = await import('../src/lib/weddingImport.ts');
const client = await import('../src/lib/weddingCapacity.ts');
const server = await import('../server/wedding-capacity.js');
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
test('lists above 300 people import without a guest limit',()=>{
  const rows=Array.from({length:400},(_,i)=>row(String(i),`Persona ${i}`,'pareja',`Pareja ${i}`));
  const result=reviewImport(rows,[],300);
  assert.equal(result.people,800);assert.equal(result.overLimit,false);assert.deepEqual(result.errors,{});
  const csv='Tipo,Nombre,Acompañante\n'+Array.from({length:1000},(_,i)=>`+1,Invitado ${i},`).join('\n');
  assert.equal(readGuestCsv(csv).length,1001);
  assert.throws(()=>readGuestCsv(csv+'\n+1,Invitado extra,'),/import_too_many/);
});
test('the technical capacity counts unnamed plus ones and existing guests, matching the server',()=>{
  assert.equal(client.maxEventPeople,server.maxEventPeople);assert.equal(client.maxImportRows,server.maxImportRows);
  assert.equal(reviewImport([row('1','Ana Prueba','+1')],[],server.maxEventPeople-1).overLimit,true);
  assert.equal(reviewImport([row('1','Ana Prueba','+1')],[],server.maxEventPeople-2).overLimit,false);
});
