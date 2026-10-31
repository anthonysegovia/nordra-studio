import test from 'node:test';
import assert from 'node:assert/strict';
import {landscapePrototype,comparisonMode} from '../src/site/landscape/prototype-options.js';
test('prototype switches are independent, allowlisted and off without a parameter',()=>{
 assert.deepEqual(landscapePrototype().features,[]);
 assert.deepEqual(landscapePrototype('?paisaje=todo').features,['a','b','c','d','e','f']);
 assert.deepEqual(landscapePrototype('?paisaje=f,b,b,other,A').features,['a','b','f']);
 for(const feature of ['a','b','c','d','e','f'])assert.deepEqual(landscapePrototype(`?paisaje=${feature}`).features,[feature]);
 assert.equal(landscapePrototype('?paisaje=todo&entrada=true').comparison,false);
});
test('only the comparison parent can repeat the entrance without a session change',()=>{
 const frame=pathname=>({ownerDocument:{location:{pathname}},dataset:{landscapeMode:'entry'}});
 assert.equal(comparisonMode(frame('/')), '');
 assert.equal(comparisonMode(null), '');
 const mode=comparisonMode(frame('/prototipos/paisaje-v2.html'));
 assert.equal(landscapePrototype('',mode).entrance,true);
 assert.equal(landscapePrototype('','final').comparison,true);
 assert.equal(landscapePrototype('','anything').comparison,false);
});
