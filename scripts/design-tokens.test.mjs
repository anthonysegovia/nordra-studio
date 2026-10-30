import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import postcss from 'postcss';

// Use the CSS parser already installed by Vite; no browser or new dependency.
const styles = new URL('../src/site/styles/', import.meta.url);
const read = name => readFileSync(new URL(name, styles), 'utf8');
const reference = JSON.parse(readFileSync(new URL('./fixtures/design-tokens.json', import.meta.url), 'utf8'));
const roles = ['--bg', '--ink', '--muted', '--line', '--accent'];

function roleBlocks(css) {
  const blocks = [];
  postcss.parse(css).walkRules(rule => {
    const declarations = rule.nodes.filter(node => node.type === 'decl' && roles.includes(node.prop))
      .map(node => ({ property: node.prop, value: node.value, important: !!node.important }));
    if (!declarations.length) return;
    const ancestors = [];
    for (let parent = rule.parent; parent.type !== 'root'; parent = parent.parent) {
      assert.equal(parent.type, 'atrule', 'Role rules must not acquire implicit nested selectors');
      ancestors.unshift({ name: parent.name, params: parent.params });
    }
    blocks.push({ selector: rule.selector, ancestors, declarations });
  });
  return blocks;
}

function assertWarmWedding(blocks) {
  for (const selector of ['body[data-scene=bodas]', 'body[data-scene=bodas].dark']) {
    const block = blocks.find(block => block.selector === selector);
    assert.ok(block, `Missing explicit wedding palette: ${selector}`);
    assert.deepEqual(block.declarations.map(d => d.property).sort(), [...roles].sort());
  }
  const wedding = blocks.filter(block => /data-scene\s*=\s*["']?bodas|theme-wedding/.test(block.selector));
  for (const block of wedding) for (const { property, value } of block.declarations) {
    assert.match(value, /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i, `Bodas: explicit warm/neutral color required for ${property}`);
    const hex = value.slice(1);
    const rgb = hex.length <= 4 ? [...hex.slice(0, 3)].map(c => parseInt(c + c, 16)) : [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
    // Independent of the editable snapshot: the approved ivory/warm neutrals
    // have R >= G >= B. Blue, cyan and violet must not enter the wedding roles.
    assert.ok(rgb[0] >= rgb[1] && rgb[1] >= rgb[2], `Bodas must retain warm neutrals (AGENTS.md): ${block.selector} ${property}: ${value}`);
  }
}

function checkTokens(css, expected = reference.blocks) {
  const blocks = roleBlocks(css);
  assert.deepEqual(blocks, expected, 'Role selectors, order, conditions and values must match the reviewed reference');
  assertWarmWedding(blocks);
}

test('color roles match the palettes extracted from e186741, including order and inheritance', () => {
  assert.deepEqual(reference.roles, roles);
  checkTokens(read('tokens.css'));
  const root = postcss.parse(read('tokens.css'));
  root.walkDecls(declaration => assert.ok(roles.includes(declaration.prop), 'tokens.css contains color roles only'));
});

test('only the documented mobile contrast overrides remain outside tokens.css', () => {
  const retained = readdirSync(styles).filter(name => name.endsWith('.css') && name !== 'tokens.css')
    .sort().flatMap(file => roleBlocks(read(file)).map(block => ({ file, ...block })));
  assert.deepEqual(retained, reference.retained);
  assertWarmWedding([...roleBlocks(read('tokens.css')), ...retained]);
});

test('scene imports the tokens before its existing CSS without adding HTML stylesheets', () => {
  const first = postcss.parse(read('scene.css')).nodes.find(node => node.type !== 'comment');
  assert.equal(first.type, 'atrule');
  assert.equal(first.name, 'import');
  assert.match(first.params, /^["']\.\/tokens\.css["']$/);
  for (const page of ['index', 'estudio', 'negocios', 'invitaciones', 'bodas', 'cumpleanos', 'eventos', 'temporada']) {
    const html = readFileSync(new URL(`../${page}.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /(?:href|src)=["'][^"']*tokens\.css/, page);
  }
});

test('the reference rejects a changed role value', () => {
  const css = read('tokens.css').replace('--bg: #f6f9fc;', '--bg: #ffffff;');
  assert.notEqual(css, read('tokens.css'));
  assert.throws(() => checkTokens(css), /reviewed reference/);
});

test('wedding blue/violet is rejected even if the reference is updated to match', () => {
  const original = read('tokens.css');
  for (const color of ['#081420', '#4845bb']) {
    const css = original.replace('--bg: #fcfaf6;', `--bg: ${color};`);
    assert.notEqual(css, original);
    const updatedReference = roleBlocks(css);
    assert.throws(() => checkTokens(css, updatedReference), /Bodas must retain warm neutrals/);
  }
});
