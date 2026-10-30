import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { isolateSiteScript, siteScripts } from '../build/site-scripts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const scripts = ['journey', 'scroll-travel', 'mobile-aurora', 'motion', 'scroll-motion', 'theme-transition', 'nordra-materials', 'nordra-theatre', 'interface-icons', 'page-navigation'];
const read = file => readFileSync(resolve(root, file), 'utf8');

test('site copies stay byte-identical to the public sources during the migration', () => {
  for (const name of scripts) assert.deepEqual(readFileSync(resolve(root, `src/site/scripts/${name}.js`)), readFileSync(resolve(root, `public/nordra/v541/${name}.js`)), name);
  for (const [name, version] of [['scene', 'v541'], ['nordra-theatre', 'v541'], ['contact', 'v544']]) assert.deepEqual(readFileSync(resolve(root, `src/site/styles/${name}.css`)), readFileSync(resolve(root, `public/nordra/${version}/${name}.css`)), name);
});

test('entry preserves script order and the head owns the styles in their original order', () => {
  const entry = read('src/site/entries/estudio.js');
  assert.deepEqual([...entry.matchAll(/import '\.\.\/scripts\/(.+)\.js';/g)].map(m => m[1]), scripts);
  assert.doesNotMatch(entry, /import.*\.css/);
  const html = read('estudio.html'), head = html.split('</head>')[0];
  assert.deepEqual([...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]), ['scene', 'nordra-theatre', 'contact'].map(name => `/src/site/styles/${name}.css`));
  assert.equal((html.match(/<script>([\s\S]*?)<\/script>/g) || []).length, 3);
  assert.match(html, /<script type="module" src="\/src\/site\/entries\/estudio.js"><\/script>/);
  assert.doesNotMatch(html, /<script src="\/nordra\//);
});

test('a synchronous failure is logged once and does not stop the following module', () => {
  const errors = [], context = { window: {}, console: { error: (...args) => errors.push(args) } };
  const modules = [
    isolateSiteScript('window.order = ["first"]; throw new Error("fixture failure");', 'first.js'),
    isolateSiteScript('window.order.push("second"); window.NordraMobileAurora = {create: true};', 'second.js'),
    isolateSiteScript('window.order.push("third"); window.shared = window.NordraMobileAurora.create;', 'third.js'),
  ];
  runInNewContext('"use strict";\n' + modules.join('\n'), context);
  assert.equal(JSON.stringify(context.window.order), '["first","second","third"]');
  assert.equal(context.window.shared, true); assert.equal(errors.length, 1);
  assert.match(errors[0][0], /first\.js/); assert.equal(errors[0][1].message, 'fixture failure');
});

test('isolation only transforms copied JS, leaving public scripts, entries and styles alone', () => {
  const plugin = siteScripts(); plugin.configResolved({ root });
  for (const file of ['public/nordra/v541/motion.js', 'src/site/entries/estudio.js', 'src/site/styles/scene.css']) assert.equal(plugin.transform('fixture', resolve(root, file)), undefined);
  const result = plugin.transform('throw new Error("fixture")', resolve(root, 'src/site/scripts/motion.js'));
  assert.match(result.code, /^try \{/); assert.match(result.code, /motion\.js failed to initialize/);
  assert.doesNotMatch(result.code, /\beval\(|new Function\(/);
});

function analyze(files) {
  const options = { allowJs: true, checkJs: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, types: [], lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], skipLibCheck: true };
  const host = ts.createCompilerHost(options), original = host.getSourceFile.bind(host);
  const normalize = file => file.replaceAll('\\', '/');
  const sources = new Map(files.map(([name, source]) => [normalize(resolve(root, name)), source]));
  host.getSourceFile = (file, languageVersion, onError) => sources.has(normalize(file))
    ? ts.createSourceFile(file, `"use strict";\n${sources.get(normalize(file))}\nexport {};`, languageVersion, true, ts.ScriptKind.JS)
    : original(file, languageVersion, onError);
  const program = ts.createProgram([...sources.keys()], options, host);
  // Like no-undef: use TypeScript's scope resolver and DOM globals, excluding
  // unrelated type inference errors in these deliberately untyped JS copies.
  const strictOrUndefined = new Set([1100, 1101, 1102, 1121, 1210, 1215, 1250, 1251, 2304, 2552]);
  return [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics().filter(d => strictOrUndefined.has(d.code))]
    .map(d => `${d.file?.fileName}:${d.start} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
}

test('copied scripts resolve all identifiers and contain no strict-mode-sensitive this/with/eval', () => {
  const files = scripts.map(name => [`src/site/scripts/${name}.js`, read(`src/site/scripts/${name}.js`)]);
  assert.deepEqual(analyze(files), []);
  for (const [file, source] of files) {
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    function visit(node) {
      assert.notEqual(node.kind, ts.SyntaxKind.ThisKeyword, file);
      assert.notEqual(node.kind, ts.SyntaxKind.WithStatement, file);
      if (ts.isCallExpression(node)) assert.notEqual(node.expression.getText(ast), 'eval', file);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});

test('the static scope check detects an undeclared assignment and read in its fixture', () => {
  const errors = analyze([['src/site/scripts/scope-fixture.js', 'unboundFixture = 1; console.log(otherUnboundFixture);']]);
  assert.ok(errors.some(e => e.includes('unboundFixture')), errors.join('\n'));
  assert.ok(errors.some(e => e.includes('otherUnboundFixture')), errors.join('\n'));
});
