import test from 'node:test';
import assert from 'node:assert/strict';
import { mountainChoice } from '../src/site/landscape/mountain-options.js';
test('daylight study accepts only the three explicit choices; all other URLs retain the release', () => {
  for (const value of [undefined, '', '?theme=light', '?montana=0', '?montana=4', '?montana=01', '?montana=1,2', '?montana=NaN']) assert.equal(mountainChoice(value), 0);
  for (const value of [1, 2, 3]) assert.equal(mountainChoice(`?theme=light&montana=${value}`), value);
});
