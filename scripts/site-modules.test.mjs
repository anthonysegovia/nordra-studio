import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { isolateSiteScript, siteScripts } from '../build/site-scripts.mjs';
import { bundledOrder, assertNoLegacySiteAssets } from './check-site-bundles.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('legacy asset guard rejects old JS/CSS URLs but permits retained resources', () => {
  for (const html of [
    '<script src="/nordra/v541/journey.js?v=552"></script>',
    "<link href='/nordra/v544/home.css' rel='stylesheet'>",
    '<SCRIPT defer SRC=nordra/v544/horizon-flow.js></SCRIPT>',
    '<link rel="preload" as="script" href="https://example.invalid/nordra/v541/motion.js">',
  ]) assert.throws(() => assertNoLegacySiteAssets(html, 'fixture'), /retired public script or style/);
  assert.doesNotThrow(() => assertNoLegacySiteAssets('<script src="/assets/home-hash.js"></script><link href="/assets/home-hash.css"><link rel="preload" href="/nordra/v541/assets/manrope-latin.woff2"><img src="/nordra/v544/assets/horizon-light.webp"><iframe src="/nordra/v541/bruma-motion.html"></iframe>', 'fixture'));
});
test('bundle inspection detects initialization reordered by a shared chunk', () => {
  const files = new Map([
    [resolve(root, 'entry.js'), 'import "./shared.js"; console.error("[Nordra site] middle.js failed to initialize");'],
    [resolve(root, 'shared.js'), 'console.error("[Nordra site] first.js failed to initialize"); console.error("[Nordra site] last.js failed to initialize");'],
  ]);
  const order = bundledOrder([resolve(root, 'entry.js')], file => files.get(file));
  assert.deepEqual(order, ['first', 'last', 'middle']);
  assert.notDeepEqual(order, ['first', 'middle', 'last']);
});
const pages = {
  "cumpleanos": {
    "entry": "birthdays",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "experience",
      "theme-transition",
      "organic-images",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "eventos": {
    "entry": "events",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "experience",
      "theme-transition",
      "organic-images",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "bodas": {
    "entry": "weddings",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "invitation-preview",
      "experience",
      "theme-transition",
      "living-images",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "temporada": {
    "entry": "seasonal",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "seasonal-flow",
      "theme-transition",
      "living-images",
      "organic-images",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "invitaciones": {
    "entry": "invitations",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "theme-transition",
      "organic-images",
      "invitation-showcase",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "negocios": {
    "entry": "business",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "business-motion",
      "theme-transition",
      "living-images",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  },
  "index": {
    "entry": "home",
    "scripts": [
      "journey",
      "scroll-motion",
      "theme-transition",
      "interface-icons",
      "home",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "home",
      "contact"
    ],
    "inline": 4
  },
  "estudio": {
    "entry": "estudio",
    "scripts": [
      "journey",
      "scroll-travel",
      "mobile-aurora",
      "motion",
      "scroll-motion",
      "theme-transition",
      "nordra-materials",
      "nordra-theatre",
      "interface-icons",
      "page-navigation"
    ],
    "styles": [
      "scene",
      "nordra-theatre",
      "contact"
    ],
    "inline": 3
  }
};
const scripts = [...new Set(Object.values(pages).flatMap(page => page.scripts))];
const read = file => readFileSync(resolve(root, file), 'utf8');

for (const [page, expected] of Object.entries(pages)) test(`${page}: original script/style order and only compiled dependencies`, () => {
  const entry = read(`src/site/entries/${expected.entry}.js`);
  assert.deepEqual([...entry.matchAll(/import '\.\.\/scripts\/(.+)\.js(?:\?entry=([a-z]+))?';/g)].map(m => m[1]), expected.scripts);
  if(page !== 'estudio') assert.equal([...entry.matchAll(/\?entry=([a-z]+)/g)].filter(m => m[1] === expected.entry).length, expected.scripts.length);
  assert.doesNotMatch(entry, /import.*\.css/);
  const html = read(`${page}.html`), head = html.split('</head>')[0];
  assert.deepEqual([...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]), expected.styles.map(name => `/src/site/styles/${name}.css${page === "index" ? "?entry=home" : ""}`));
  assert.equal((html.match(/<script>([\s\S]*?)<\/script>/g) || []).length, expected.inline);
  assert.ok(html.includes(`<script type="module" src="/src/site/entries/${expected.entry}.js"></script>`));
  assertNoLegacySiteAssets(html, page);
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

test('site scripts resolve all identifiers and contain no strict-mode-sensitive this/with/eval', () => {
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
