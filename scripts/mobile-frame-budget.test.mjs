import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mobileFrameBudget } from '../src/site/landscape/frame-budget.js';

test('one slow window reduces resolution; a second slow window selects the poster', () => {
  for (const recover of [false,true]) {
    const budget = mobileFrameBudget(), actions = [];
    for (let t = 0; t <= 2000; t += 40) actions.push(budget.observe(t));
    assert.deepEqual(actions.filter(Boolean), ['reduce']);
    const interval = recover ? 16 : 32;
    for (let t = 2040; t < 4200; t += interval) actions.push(budget.observe(t));
    assert.deepEqual(actions.filter(Boolean), ['reduce', recover ? 'keep' : 'poster']);
  }
});

test('p95 excludes an isolated stall and does not count a hidden interval', () => {
  const budget = mobileFrameBudget();
  budget.observe(0); budget.observe(1000); budget.reset();
  let t = 60000, actions = [];
  for (let i = 0; i < 135; i++) {
    actions.push(budget.observe(t));
    t += i === 8 ? 120 : 16;
  }
  assert.deepEqual(actions.filter(Boolean), ['keep']);
});
