/**
 * Build @codecavepro/brand.
 *
 * The package is a PURE DERIVATIVE of docs/. Nothing here is authored — every
 * byte is copied or compiled from a file under docs/, which stays the single
 * origin. That is deliberate: two editable copies of a palette is exactly the
 * failure this package exists to end, and it would be absurd to introduce a
 * second one on the way there.
 *
 * The CSS is copied byte-for-byte rather than transformed, so that
 *
 *     node_modules/@codecavepro/brand/dist/colors_and_type.css
 *
 * and the buildless URL
 *
 *     https://brand.codecave.pro/colors_and_type.css
 *
 * are the same file. (docs/CNAME is the canonical host; the GitHub Pages
 * default, codecavepro.github.io/brand, serves the same tree.) `--check`
 * asserts exactly that and emits nothing, which is what CI runs.
 *
 * NOTE ON FONTS: the package ships no font binaries — a licensing question,
 * see CCWEB2-318 — so both stylesheets 404 on their faces until a consumer
 * supplies the files. Tokens and the type scale are unaffected. The two do NOT
 * want them in the same place, because fonts.css is written to be dropped into
 * a project on its own and its URLs are relative to the `fonts/` directory it
 * normally lives in:
 *
 *     dist/colors_and_type.css  ->  url("./fonts/Satoshi-*.woff2")  ->  dist/fonts/
 *     dist/fonts.css            ->  url("./Satoshi-*.woff2")        ->  dist/
 *
 * Flattening docs/fonts/fonts.css to dist/fonts.css is what splits them. This
 * is documented in the package README's font table; if the copy layout ever
 * changes, that table changes with it.
 *
 * dist/tokens.css is the one output that is neither copied nor compiled: it is
 * EXTRACTED from colors_and_type.css. See extractRoot() for why the package
 * ships the palette twice over — once whole, once as values only.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '..');
const repo = path.resolve(pkg, '../..');

const docs = (...p) => path.join(repo, 'docs', ...p);
const out = (...p) => path.join(pkg, 'dist', ...p);
const tmp = (...p) => path.join(pkg, '.tmp', ...p);

const checkOnly = process.argv.includes('--check');

/** Files copied verbatim: [source, destination-inside-dist]. */
const VERBATIM = [
  [docs('colors_and_type.css'), 'colors_and_type.css'],
  [docs('fonts', 'fonts.css'), 'fonts.css'],
];

/**
 * Copied verbatim to the PACKAGE ROOT rather than into dist/, because npm picks
 * these two up by name and only from there — `files: ["dist"]` neither includes
 * nor excludes them. `npm pack --dry-run` shipped 16 files with no licence text
 * at all until this existed: package.json said "Unlicense" and the tarball
 * proved nothing.
 *
 * The root LICENSE is the origin, exactly as docs/ is for the CSS. Copying it
 * keeps the package a pure derivative — a second licence file to edit is the
 * same failure as a second palette, and a worse one to get wrong.
 */
const ROOT_VERBATIM = [[path.join(repo, 'LICENSE'), 'LICENSE']];

/** Every verbatim copy, as [source, absolute-destination]. */
const COPIES = [
  ...VERBATIM.map(([src, dest]) => [src, out(dest), `dist/${dest}`]),
  ...ROOT_VERBATIM.map(([src, dest]) => [src, path.join(pkg, dest), dest]),
];

/**
 * The tokens-only stylesheet, EXTRACTED from colors_and_type.css rather than
 * written. It is the `:root` block and nothing else.
 *
 * WHY IT EXISTS. `./css` is the whole design system: six @font-face rules, the
 * tokens, base rules for html/body/h1-h6/a, two layout primitives and ~60
 * component classes. That is right for a page that wants CODECAVE's look
 * wholesale, and wrong for an app that already has its own base styles — for
 * codecave.pro, importing it would restyle every heading and link on the
 * production site, which is a design change wearing a dependency-update
 * costume. `./tokens.css` is the half that inverts the direction of truth
 * without touching a pixel: the site keeps its own base layer and stops
 * keeping its own copy of the palette.
 *
 * WHY EXTRACTED AND NOT WRITTEN. A hand-maintained token file would be a
 * second home for the values whose whole point is having one. Extraction keeps
 * the package a pure derivative; `--check` re-extracts and compares, so the
 * two cannot drift.
 *
 * The block is located structurally — `:root {` alone on a line, closed by `}`
 * in column 0 — and anything ambiguous is a hard failure rather than a guess.
 * Silently shipping half a palette is the failure mode worth being loud about.
 */
function extractRoot(src) {
  const css = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
  const rel = path.relative(repo, src).split(path.sep).join('/');

  const opens = [...css.matchAll(/^:root\s*\{[ \t]*$/gm)];
  if (opens.length !== 1) {
    throw new Error(
      `${rel}: expected exactly one \`:root {\` block, found ${opens.length}.\n` +
        'dist/tokens.css is extracted from it — see scripts/build.mjs.',
    );
  }

  const from = opens[0].index;
  const close = css.indexOf('\n}\n', from);
  if (close === -1) throw new Error(`${rel}: the :root block is never closed in column 0.`);
  /* +2 takes the closing brace; the newline after it is added rather than
   * sliced, so the file ends the same way whether or not the origin does. */
  const block = css.slice(from, close + 2) + '\n';

  /* A block that declares nothing is a rename or a refactor that got this far
   * unnoticed; ship it and consumers get a stylesheet of comments. */
  const declarations = (block.match(/^\s+--[\w-]+\s*:/gm) ?? []).length;
  if (declarations < 50) {
    throw new Error(`${rel}: the :root block declares only ${declarations} custom properties.`);
  }

  const header = [
    '/* ==========================================================================',
    ' * CODECAVE design tokens — @codecavepro/brand/tokens.css',
    ' * --------------------------------------------------------------------------',
    ` * GENERATED from ${rel} — do not edit.`,
    ' *',
    ' * The custom properties and nothing else: no @font-face, no rules for html,',
    ' * body, headings or links, no layout primitives, no components. Import this',
    " * into an app that already has a base layer of its own and wants CODECAVE's",
    ' * values; import "@codecavepro/brand/css" to get the design system whole.',
    ' *',
    ' * Fonts are a separate concern here by design: --font-sans names Satoshi and',
    " * supplying the faces is the consuming app's job.",
    ' * ======================================================================== */',
    '',
    '',
  ].join('\n');

  return header + block;
}

/* extractRoot() throws on anything it will not guess about, which is the point
 * — but a raw stack trace reads as "the build script is broken" when what
 * actually happened is that docs/ changed shape. Report it the way every other
 * failure here is reported, and say which file could not be produced. */
function derive(produce, dest) {
  try {
    return produce();
  } catch (err) {
    console.error(`build failed — dist/${dest} cannot be derived from docs/:`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
}

/** Files derived from a docs/ source, as [produce, destination-inside-dist]. */
const DERIVED = [[() => extractRoot(docs('colors_and_type.css')), 'tokens.css']];

/** Token modules compiled to JS + .d.ts, in the order they are re-exported. */
const TOKENS = ['colors', 'layout', 'typography'];

const problems = [];

for (const [src] of COPIES) {
  if (!fs.existsSync(src)) problems.push(`missing source: ${path.relative(repo, src)}`);
}
for (const name of TOKENS) {
  const src = docs('tokens', `${name}.ts`);
  if (!fs.existsSync(src)) problems.push(`missing source: ${path.relative(repo, src)}`);
}
if (problems.length) {
  console.error('build failed — the package cannot be built from docs/:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

if (checkOnly) {
  // Assert that what is already in dist/ still matches docs/. Anything else is
  // drift between the package and its origin, which is the one thing this
  // arrangement must never allow.
  let drifted = 0;
  for (const [src, target, label] of COPIES) {
    if (!fs.existsSync(target)) {
      console.error(`  not built: ${label}`);
      drifted++;
      continue;
    }
    if (!fs.readFileSync(src).equals(fs.readFileSync(target))) {
      console.error(`  drifted: ${label} differs from ${path.relative(repo, src)}`);
      drifted++;
    }
  }
  // A derived file cannot be compared against its source, so it is re-derived
  // and compared against what was derived last time. Same guarantee, one step
  // longer: dist/ is still provably a function of docs/ and of nothing else.
  for (const [produce, dest] of DERIVED) {
    const target = out(dest);
    if (!fs.existsSync(target)) {
      console.error(`  not built: dist/${dest}`);
      drifted++;
      continue;
    }
    if (fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== derive(produce, dest)) {
      console.error(`  drifted: dist/${dest} is not what its origin extracts to now`);
      drifted++;
    }
  }

  if (drifted) {
    console.error(`\n${drifted} file(s) out of sync. Run: npm run build -w @codecavepro/brand`);
    process.exit(1);
  }
  console.log(
    `@codecavepro/brand: ${COPIES.length} file(s) match their origin byte-for-byte, ` +
      `${DERIVED.length} re-derive unchanged.`,
  );
  process.exit(0);
}

fs.rmSync(out(), { recursive: true, force: true });
fs.rmSync(tmp(), { recursive: true, force: true });
fs.mkdirSync(out(), { recursive: true });
fs.mkdirSync(tmp('tokens'), { recursive: true });

for (const [src, target] of COPIES) {
  fs.copyFileSync(src, target);
}

for (const [produce, dest] of DERIVED) {
  fs.writeFileSync(out(dest), derive(produce, dest));
}

for (const name of TOKENS) {
  fs.copyFileSync(docs('tokens', `${name}.ts`), tmp('tokens', `${name}.ts`));
}

// The barrel is generated rather than committed so that adding a token module
// is a one-line change here and not a file nobody remembers to update.
fs.writeFileSync(
  tmp('index.ts'),
  [
    '// GENERATED by packages/brand/scripts/build.mjs — do not edit.',
    '// Origin: docs/tokens/*.ts',
    ...TOKENS.map((n) => `export * from './tokens/${n}.js';`),
    '',
  ].join('\n'),
);

// Invoke tsc's JS entry point with the running node rather than the .bin shim:
// on Windows the shim is tsc.cmd, and node refuses to spawn .cmd without a
// shell. Going straight to the script sidesteps that and needs no shell at all.
const tsc = path.join(repo, 'node_modules', 'typescript', 'bin', 'tsc');
if (!fs.existsSync(tsc)) {
  console.error(`build failed — typescript is not installed (${path.relative(repo, tsc)}).`);
  console.error('Run: npm install');
  process.exit(1);
}

const result = spawnSync(process.execPath, [tsc, '--project', path.join(pkg, 'tsconfig.json')], {
  stdio: 'inherit',
  cwd: pkg,
});
if (result.error) {
  console.error(`build failed — could not run tsc: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);

fs.rmSync(tmp(), { recursive: true, force: true });

/* ---- the README's example values must be real -----------------------------
 * README.md is the one authored file here, because npm renders it as the
 * package page and there is nowhere else for that page to come from. Its usage
 * example quotes actual token values — which is a second home for those values,
 * the precise failure this package exists to end.
 *
 * So they are asserted rather than trusted. Any line in the README shaped
 *
 *     group.key;   // 'value'
 *     group.key;   // { a: 'x', b: 'y' }
 *
 * is checked against the module just compiled. A palette change that leaves the
 * README behind fails the build, and since `prepack` runs this, it cannot be
 * published stale. Comments that are prose rather than a literal are ignored,
 * so the example can still explain itself.
 */
const readme = path.join(pkg, 'README.md');
if (fs.existsSync(readme)) {
  const mod = await import(new URL(`file://${out('index.js').replace(/\\/g, '/')}`));
  const canonical = (s) => s.replace(/\s+/g, '').replace(/"/g, "'");
  const literal = (v) =>
    typeof v === 'string' || typeof v === 'number'
      ? `'${v}'`
      : `{${Object.entries(v).map(([k, vv]) => `${k}:'${vv}'`).join(',')}}`;

  const stale = [];
  let asserted = 0;
  const re = /^\s*(\w+)\.(\w+);\s*\/\/\s*(.+?)\s*$/gm;
  for (const [, group, key, comment] of fs.readFileSync(readme, 'utf8').matchAll(re)) {
    if (!/^['{]/.test(comment)) continue;   // prose, not a claim
    asserted++;
    const actual = mod[group]?.[key];
    if (actual === undefined) {
      stale.push(`${group}.${key} — no such export`);
    } else if (canonical(literal(actual)) !== canonical(comment)) {
      stale.push(`${group}.${key} — README says ${comment}, module has ${literal(actual)}`);
    }
  }

  if (stale.length) {
    console.error('build failed — README.md quotes values the module does not have:');
    for (const s of stale) console.error(`  ${s}`);
    process.exit(1);
  }
  /* The tokens-only section quotes how many properties it carries, which is a
   * fact about dist/tokens.css living in a second file — the same shape of
   * problem as the example values above, so it gets the same treatment. */
  const claim = /(\d+)\s+properties on `:root`/.exec(fs.readFileSync(readme, 'utf8'));
  if (claim) {
    const real = (fs.readFileSync(out('tokens.css'), 'utf8').match(/^\s+--[\w-]+\s*:/gm) ?? []).length;
    if (Number(claim[1]) !== real) {
      console.error(
        `build failed — README.md says ${claim[1]} properties on :root; ` +
          `dist/tokens.css declares ${real}.`,
      );
      process.exit(1);
    }
    asserted++;
  }

  console.log(`@codecavepro/brand: ${asserted} README example value(s) verified.`);
}

const emitted = fs.readdirSync(out()).sort();
console.log(`@codecavepro/brand built: ${emitted.join(', ')}`);
