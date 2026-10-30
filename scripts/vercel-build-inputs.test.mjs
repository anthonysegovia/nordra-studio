import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildInputs, ignoredInputs } from './check-vercel-build-inputs.mjs';

test('Git semantics catch the unanchored scripts regression and respect anchored patterns', () => {
  const files = ['scripts/check.mjs', 'src/site/scripts/home.js', 'build/site-scripts.mjs'];
  assert.deepEqual(ignoredInputs('scripts/\n', files), files.slice(0, 2));
  assert.deepEqual(ignoredInputs('/scripts/\n', files), [files[0]]);
});

test('Git semantics support recursive patterns, exceptions and ignored parents', () => {
  const files = ['src/site/scripts/home.js', 'src/site/scripts/motion.js'];
  assert.deepEqual(ignoredInputs('**/*.js\n!src/site/scripts/home.js\n', files), [files[1]]);
  assert.deepEqual(ignoredInputs('src/\n!src/site/scripts/home.js\n', files), files);
});

test('Vercel includes the tracked build inputs and their local dependencies', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const inputs = buildInputs(root);
  for (const file of ['src/site/scripts/horizon-flow.js', 'build/site-scripts.mjs', 'src/data/invitationPricing.ts', 'index.html', 'vite.config.ts', 'package-lock.json', 'tsconfig.json']) assert.ok(inputs.includes(file), file);
  assert.deepEqual(ignoredInputs(readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8'), inputs), []);
});
