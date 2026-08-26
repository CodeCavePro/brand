/* Ask the INSTALLED package the questions a consumer asks first.
 *
 *   node docs/tools/smoke-tarball.mjs <path-to-installed-package-root>
 *
 * where the argument is the directory `npm i <tarball>` produced — normally
 * `<somewhere>/node_modules/@codecavepro/brand`. Exit 0 when every assertion
 * below holds; exit 1, naming what failed, when one does not.
 *
 * Why this is not part of `npm run check`: check reads the TREE that produced
 * the tarball, and every interesting failure here is a difference between that
 * tree and the tarball. `files: ["dist"]` decides what ships, `exports` decides
 * what resolves, and npm picks LICENSE and README up by name — none of those
 * three are visible to a check that walks `dist/` in place. A package can be
 * completely correct on disk and broken for everyone who installs it.
 *
 * This was RELEASING.md step 3: five shell one-liners a human pasted, one of
 * which was 900 characters of inlined JavaScript. It is a script now because
 * the release runs in CI, and because the last of those one-liners had already
 * drifted from the build once — see assertReferencesResolve() below.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');

const root = path.resolve(process.argv[2] ?? '');
if (!process.argv[2] || !fs.existsSync(path.join(root, 'package.json'))) {
  console.error('No installed package at', root || '(no path given)');
  console.error('');
  console.error('Usage:');
  console.error('  node docs/tools/smoke-tarball.mjs <dir>/node_modules/@codecavepro/brand');
  console.error('');
  console.error('Nothing was verified.');
  process.exit(1);
}

const failures = [];
const passed = [];

function ok(what) {
  passed.push(what);
}

function fail(what, detail) {
  failures.push(detail ? `${what}\n      ${detail}` : what);
}

/* ---------------------------------------------------------------------- */

/**
 * npm picks LICENSE and README up from the package root BY NAME. `files:
 * ["dist"]` neither includes nor excludes them, which is why this is worth
 * asking: the tarball shipped no licence text at all for several versions
 * while package.json claimed "Unlicense". The licence is a build-time copy of
 * the repo's root LICENSE, so a missing one also means the build did not run.
 */
function assertRootFilesPresent() {
  for (const name of ['LICENSE', 'README.md', 'package.json']) {
    if (fs.existsSync(path.join(root, name))) ok(`${name} is in the tarball`);
    else fail(`${name} is MISSING from the tarball`, name === 'LICENSE' ? 'a missing LICENSE also means the build did not run — stop' : '');
  }
}

/**
 * The typed module resolves through `exports`, and has content rather than
 * being an empty barrel. An empty barrel is the specific failure worth naming:
 * `export * from './tokens/colors.js'` over a file that compiled to nothing
 * resolves perfectly and hands the consumer an object with no keys.
 */
async function assertModuleResolves() {
  const entry = path.join(root, 'dist', 'index.js');
  if (!fs.existsSync(entry)) {
    fail('dist/index.js is missing', 'the "." export points at nothing');
    return;
  }
  let mod;
  try {
    mod = await import(pathToFileURL(entry).href);
  } catch (err) {
    fail('dist/index.js does not import', String(err && err.message));
    return;
  }
  const names = Object.keys(mod);
  if (!names.length) {
    fail('dist/index.js resolves but exports nothing', 'an empty barrel — the token modules compiled to nothing');
    return;
  }
  const action = mod.color?.action;
  if (typeof action === 'string' && /^#[0-9a-f]{3,8}$/i.test(action)) {
    ok(`the typed module resolves — ${names.length} export(s), color.action = ${action}`);
  } else {
    fail('color.action is not a hex value', `got ${JSON.stringify(action)}`);
  }
}

/**
 * The package's central promise: the file a buildless consumer links by URL is
 * the same bytes as the origin in docs/. `npm run check` asserts this of the
 * tree; this asks it of what actually installed.
 */
function assertCssIdentical() {
  const origin = path.join(docs, 'colors_and_type.css');
  const installed = path.join(root, 'dist', 'colors_and_type.css');
  if (!fs.existsSync(installed)) {
    fail('dist/colors_and_type.css is missing', 'the "./css" export points at nothing');
    return;
  }
  if (fs.readFileSync(installed).equals(fs.readFileSync(origin))) {
    ok('dist/colors_and_type.css is byte-identical to docs/colors_and_type.css');
  } else {
    fail('dist/colors_and_type.css DIFFERS from docs/colors_and_type.css', 'the buildless URL and the origin have diverged');
  }
}

/**
 * Every subpath export resolves to a file that exists. A wildcard export maps a
 * shape rather than a file, so `./components/*` is satisfied by the pattern and
 * says nothing about whether any component is in there.
 */
function assertExportsResolve() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const targets = [];
  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    const files = typeof value === 'string' ? [value] : Object.values(value);
    for (const f of files) targets.push([subpath, f]);
  }
  for (const [subpath, target] of targets) {
    if (target.includes('*')) {
      /* A wildcard names a directory, not a file. Ask whether that directory
       * exists and holds anything — `./components/*` over an empty dist/src/
       * resolves as a pattern and fails only in the consumer's bundler. */
      const dir = path.join(root, path.dirname(target.split('*')[0] + 'x'));
      const shown = path.relative(root, dir).split(path.sep).join('/');
      if (fs.existsSync(dir) && fs.readdirSync(dir).length) ok(`${subpath} -> ${shown}/ exists and is not empty`);
      else fail(`${subpath} resolves into ${target}, which is missing or empty`);
      continue;
    }
    if (fs.existsSync(path.join(root, target))) ok(`${subpath} -> ${target}`);
    else fail(`${subpath} -> ${target}, which the tarball does not carry`);
  }
}

/**
 * Every relative import and url() in the shipped source resolves inside the
 * installed package.
 *
 * The captures flatten the site's src/components/ level away while their
 * imports still climb through it, so the package ships at the site's depth to
 * keep those resolving. The storybook cannot catch a regression here:
 * build-storybook.mjs re-roots escaping imports with a resolver plugin, and a
 * consumer's import has no such plugin.
 *
 * The two patterns and NOT_A_FILE mirror referencesOf() in
 * packages/brand/scripts/build.mjs — KEEP THEM IN STEP. They were not in step
 * once: this check read only `from "..."`, reported that everything resolved
 * over a 1.6.0 tarball whose Checkbox.vue reached a checked-icon.svg that was
 * not in it, and the bug shipped (CCWEB2-370). A background-image is a
 * reference like any other. The build asks this of the tree that built the
 * tarball; this asks it of the tarball, which is why both exist.
 */
const NOT_A_FILE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function referencesOf(src) {
  const found = [];
  for (const m of src.matchAll(/from\s*["']((?:\.|@helpers\/)[^"']*)["']/g)) found.push(m[1]);
  for (const m of src.matchAll(/^\s*import\s+["']((?:\.|@helpers\/)[^"']*)["']/gm)) found.push(m[1]);
  for (const m of src.matchAll(/\burl\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]*))\s*\)/g)) {
    const target = m[1] ?? m[2] ?? m[3];
    if (target && !NOT_A_FILE.test(target)) found.push(target);
  }
  return found;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function assertReferencesResolve() {
  const src = path.join(root, 'dist', 'src');
  if (!fs.existsSync(src)) {
    fail('dist/src/ is missing', 'no components shipped — every ./components/* import would fail');
    return;
  }
  const files = walk(src);
  const dangling = [];
  let count = 0;
  for (const file of files) {
    if (!/\.(?:vue|ts|js|css|svg)$/.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const spec of referencesOf(text)) {
      count += 1;
      /* An unrewritten alias is its own bug and would report as a dangling
       * path it never had, so name it as what it is. */
      if (spec.startsWith('@helpers/')) {
        dangling.push(`${path.relative(root, file).split(path.sep).join('/')} still imports through @helpers`);
        continue;
      }
      const joined = path.resolve(path.dirname(file), spec);
      if (![joined, `${joined}.ts`, `${joined}.vue`].some((c) => fs.existsSync(c))) {
        dangling.push(`${path.relative(root, file).split(path.sep).join('/')} -> ${spec}`);
      }
    }
  }
  if (dangling.length) {
    fail(`${dangling.length} reference(s) in dist/src/ lead nowhere`, dangling.join('\n      '));
  } else {
    ok(`${count} reference(s) across ${files.length} shipped file(s) resolve inside the package`);
  }
}

/* ---------------------------------------------------------------------- */

assertRootFilesPresent();
await assertModuleResolves();
assertCssIdentical();
assertExportsResolve();
assertReferencesResolve();

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (failures.length) {
  console.error(`${manifest.name}@${manifest.version} — the installed package is BROKEN:`);
  console.error('');
  for (const f of failures) console.error(`  x ${f}`);
  console.error('');
  console.error(`${passed.length} other assertion(s) passed. Do not publish this.`);
  process.exit(1);
}

console.log(`${manifest.name}@${manifest.version} installs and holds together — ${passed.length} assertion(s):`);
for (const p of passed) console.log(`  - ${p}`);
