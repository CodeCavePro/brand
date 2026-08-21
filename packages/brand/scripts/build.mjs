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

/* ==========================================================================
 * The component tree — CCWEB2-318 phase 4.
 *
 * Same rule as the CSS: copied byte-for-byte from docs/source_examples/, which
 * is itself a capture of what codecave.pro ships. Nothing here is authored, so
 * a specimen in the storybook and a component in a consumer's node_modules are
 * provably the same bytes as the site's.
 *
 * WHY THE LAYOUT CHANGES SHAPE. The captures flatten the site's
 * `src/components/` away — `header/desktop-menu.vue` on disk is
 * `src/components/header/desktop-menu.vue` on the site. Its imports did not
 * flatten with it: it still climbs `../../assets/images/logo.svg`, which from
 * the capture tree lands OUTSIDE source_examples/ entirely. Every capture with
 * a two-level climb is in that position, and it has never been noticed because
 * build-storybook.mjs carries a resolver that re-roots an overshooting climb
 * back at source_examples/. A bundler plugin can do that; `import` in a
 * consumer's app cannot.
 *
 * So the package restores the depth the capture removed. dist/src/ IS the
 * site's src/ — components/, assets/, helpers/, lib/ — and every relative
 * import resolves by ordinary path arithmetic, with not one byte edited.
 *
 * WHAT IS NOT SHIPPED, and why each one is out. This list is short on purpose:
 * an exclusion is a component people cannot use, so it needs a reason that
 * survives being read out loud.
 */
const NOT_SHIPPED = [
  ['styles/global.css',
   'the SITE\'s stylesheet, not this package\'s — it imports tailwindcss and ' +
   '@codecavepro/brand/tokens.css, so shipping it would have the package ' +
   'import itself. The storybook still reads it from the captures, where it ' +
   'belongs, to build tw-bridge.css.'],
  ['footer/footer.astro',
   'an Astro component. Nothing that installs this package can render one ' +
   'without Astro, and it imports build-time-only modules besides.'],
  ['homepage/testimonial.astro', 'ditto.'],
  ['common/ArticlePreview.vue',
   'CMS-shaped, not brand-shaped: it imports Article from lib/strapi/types, ' +
   '74 KB of types generated from the Strapi schema, and getImageUrl from ' +
   'helpers/image-url.ts, which reads a hardcoded CMS host and token out of ' +
   'lib/strapi.ts. Shipping either would put the site\'s content model, and ' +
   'its CMS address, inside its design system.'],
  ['common/Review.vue', 'ditto.'],
  ['project/pain-points-item.vue', 'ditto.'],
  ['homepage/technologies.vue', 'ditto (Technology, from the same 74 KB).'],
  ['helpers/image-url.ts',
   'the reason the four above are out. Inverting it site-side — take the base ' +
   'URL rather than import lib/strapi — is what makes them shippable, and is ' +
   'the same move CCWEB2-325 made for ContactUsForm. Filed as CCWEB2-332.'],
];
const EXCLUDED = new Set(NOT_SHIPPED.map(([rel]) => rel));

/** A capture's path inside dist/, restoring the site's own directory depth. */
function shippedAs(rel) {
  const top = rel.split('/')[0];
  return ['assets', 'helpers', 'lib'].includes(top)
    ? `src/${rel}`
    : `src/components/${rel}`;
}

/**
 * The shippable captures, computed rather than listed.
 *
 * Every .vue that is not excluded is a root; each root's relative imports are
 * followed transitively and pulled in with it. A list written by hand goes
 * stale the first time a component gains an import — this cannot, and it fails
 * loudly rather than shipping a component whose import resolves to nothing.
 */
function shippable() {
  const all = (function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  })(docs('source_examples'))
    .map((f) => path.relative(docs('source_examples'), f).split(path.sep).join('/'))
    .filter((rel) => !rel.startsWith('brand-repo'));

  /* Resolved in the SHIPPED layout, not the capture layout — that is the whole
   * assertion. `header/mobile-menu.vue` reaching `../../assets/images/logo.svg`
   * escapes source_examples/ and lands inside dist/src/, and following the
   * imports where the consumer will follow them is what proves it. */
  const byShipped = new Map(all.map((rel) => [shippedAs(rel), rel]));
  const roots = all.filter((rel) => rel.endsWith('.vue') && !EXCLUDED.has(rel))
    .map(shippedAs);
  const seen = new Set();
  const escaped = [];

  const visit = (shipped) => {
    if (seen.has(shipped)) return;
    seen.add(shipped);
    const src = fs.readFileSync(docs('source_examples', byShipped.get(shipped)), 'utf8');
    for (const m of src.matchAll(/from\s*["'](\.[^"']*)["']/g)) {
      const joined = path.posix.join(path.posix.dirname(shipped), m[1]);
      const hit = [joined, `${joined}.ts`, `${joined}.vue`].find((c) => byShipped.has(c));
      if (!hit) { escaped.push([shipped, m[1]]); continue; }
      visit(hit);
    }
  };
  for (const shipped of roots) visit(shipped);

  if (escaped.length) {
    console.error('build failed — a shipped component imports something the package does not carry:');
    for (const [shipped, spec] of escaped) console.error(`  dist/${shipped}  ->  ${spec}`);
    console.error('');
    console.error('Capture what it imports, or add the component to NOT_SHIPPED with a reason.');
    process.exit(1);
  }
  return [...seen].sort();
}

/** Undo shippedAs: assets/, helpers/ and lib/ never live under components/. */
function captureOf(shipped) {
  return shipped.startsWith('src/components/')
    ? shipped.slice('src/components/'.length)
    : shipped.slice('src/'.length);
}

/** Every verbatim copy, as [source, absolute-destination]. */
const shipped = shippable();

const COPIES = [
  ...VERBATIM.map(([src, dest]) => [src, out(dest), `dist/${dest}`]),
  ...ROOT_VERBATIM.map(([src, dest]) => [src, path.join(pkg, dest), dest]),
  ...shipped.map((rel) => [
    docs('source_examples', captureOf(rel)),
    out(rel),
    `dist/${rel}`,
  ]),
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
  fs.mkdirSync(path.dirname(target), { recursive: true });
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

  /* Same treatment for the component counts. "15 components and 13 icons" is a
   * fact about what shippable() computed, and a component added site-side would
   * otherwise leave the sentence quietly wrong on the npm page. */
  const counts = /(\d+) components and (\d+) icons/.exec(fs.readFileSync(readme, 'utf8'));
  if (counts) {
    const under = (sub, suffix) =>
      shipped.filter((rel) => rel.startsWith(sub) && rel.endsWith(suffix)).length;
    const real = [under('src/components/', '.vue'), under('src/assets/icons/', '.vue')];
    if (Number(counts[1]) !== real[0] || Number(counts[2]) !== real[1]) {
      console.error(
        `build failed — README.md says ${counts[1]} components and ${counts[2]} icons; ` +
          `dist ships ${real[0]} and ${real[1]}.`,
      );
      process.exit(1);
    }
    asserted += 2;
  }

  console.log(`@codecavepro/brand: ${asserted} README example value(s) verified.`);
}

const emitted = fs.readdirSync(out()).sort();
console.log(`@codecavepro/brand built: ${emitted.join(', ')}`);
