import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ask Git itself: anchored paths, directory patterns, ** and negations must
// behave exactly like gitignore, not like a home-grown glob approximation.
export function ignoredInputs(patterns, paths) {
  const temporary = mkdtempSync(resolve(tmpdir(), 'nordra-vercel-ignore-'));
  try {
    execFileSync('git', ['init', '-q', temporary]);
    writeFileSync(resolve(temporary, '.gitignore'), patterns);
    writeFileSync(resolve(temporary, 'empty-global-ignore'), '');
    const result = spawnSync('git', ['-c', `core.excludesFile=${resolve(temporary, 'empty-global-ignore')}`, '-C', temporary, 'check-ignore', '--no-index', '-z', '--stdin'], {
      input: paths.join('\0') + '\0', encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (![0, 1].includes(result.status)) throw new Error(result.stderr);
    return result.stdout.split('\0').filter(Boolean);
  } finally {
    // Only remove the unique temporary directory created by this function.
    rmSync(temporary, { recursive: true, force: true });
  }
}

export function buildInputs(root) {
  const files = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  // A conservative superset: all source, build helpers, public resources and
  // HTML, including lazy imports. This does not rely on current tree-shaking.
  const inputs = new Set(files.filter(file => /^(src\/|build\/|public\/)|(^|\/)(package[^/]*\.json|tsconfig[^/]*\.json|vite\.config\.[^/]+|postcss\.config\.[^/]+|tailwind\.config\.[^/]+)$/.test(file)
    || (file.endsWith('.html') && !file.startsWith('scripts/'))));
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css', '/index.ts', '/index.tsx', '/index.js'];
  for (const file of inputs) {
    if (!/\.(?:[cm]?[jt]sx?|css|html|json)$/.test(file)) continue;
    const text = readFileSync(resolve(root, file), 'utf8');
    // Include local imports/references outside the normal source directories.
    // Bare package imports are supplied by package-lock.json + npm install.
    for (const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*|(?:src|href)\s*=\s*|@import\s*|url\(\s*)["']([^"']+)["']/g)) {
      const specifier = match[1].split(/[?#]/)[0];
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
      const bases = specifier.startsWith('/') ? [resolve(root, '.' + specifier), resolve(root, 'public', '.' + specifier)] : [resolve(root, dirname(file), specifier)];
      for (const base of bases) for (const extension of extensions) {
        const candidate = base + extension;
        const local = relative(root, candidate);
        if (local.startsWith('..' + sep) || isAbsolute(local)) continue;
        const normalized = local.split(sep).join('/');
        if (files.includes(normalized) && existsSync(candidate)) inputs.add(normalized);
      }
    }
  }
  return [...inputs].sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
  const inputs = buildInputs(root);
  const ignored = ignoredInputs(readFileSync(resolve(root, '.vercelignore'), 'utf8'), inputs);
  console.log(JSON.stringify({ checked: inputs.length, ignored, inputs }, null, 2));
  if (ignored.length) process.exitCode = 1;
}
