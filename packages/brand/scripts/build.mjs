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
import { HELPERS_ALIAS, aliasTarget, isAlias, unalias, usesAlias } from '../../../docs/tools/import-aliases.mjs';

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
 * `src/components/` away — `common/Checkbox.vue` on disk is
 * `src/components/common/Checkbox.vue` on the site. Its imports did not
 * flatten with it: it still climbs `../../assets/icons/asterisk-icon.vue`,
 * which from the capture tree lands OUTSIDE source_examples/ entirely. Every capture with
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
];
const EXCLUDED = new Set(NOT_SHIPPED.map(([rel]) => rel));

/* An exclusion naming a capture that does not exist is a claim that has
 * stopped being true, and it reads as coverage: the list is what a reader
 * consults to find out why something is missing, so a stale line answers a
 * question about a file nobody has. Deleting a capture leaves its exclusion
 * behind with nothing to say so — the build goes on succeeding.
 *
 * Same shape as assertPeersDeclared() failing on a declared peer nothing
 * imports, and check:importmap failing on a mapped specifier nothing imports. */
function assertExclusionsExist() {
  const missing = NOT_SHIPPED.map(([rel]) => rel).filter(
    (rel) => !fs.existsSync(docs('source_examples', rel)),
  );
  if (!missing.length) return;
  console.error('build failed — NOT_SHIPPED excludes captures that do not exist:');
  for (const rel of missing) console.error(`  source_examples/${rel}`);
  console.error('');
  console.error('An exclusion is for a capture that EXISTS and must not ship. If the');
  console.error('capture is gone, delete its entry rather than leaving a reason for a');
  console.error('file nobody has.');
  process.exit(1);
}

/** A capture's path inside dist/, restoring the site's own directory depth. */
function shippedAs(rel) {
  const top = rel.split('/')[0];
  return ['assets', 'helpers', 'lib'].includes(top)
    ? `src/${rel}`
    : `src/components/${rel}`;
}

/**
 * The site imports its helpers through an @helpers alias (CCWEB2-354), and that
 * alias is a tsconfig `paths` entry in codecave.pro — which this package does
 * not ship and a consumer does not have. So it can neither survive into dist/
 * nor be treated as an npm package, and it was silently both: the walk below
 * followed only `./`-shaped specifiers, so every helper would have dropped out
 * of the package the moment the captures were resynced, while
 * assertPeersDeclared read `@helpers/paths.ts` as a scoped package nothing
 * declares. Two failures, one cause, neither visible until someone rebuilt.
 *
 * The rule itself lives in docs/tools/helpers-alias.mjs, because the storybook
 * build needs the same answer and must not keep its own copy of it. What is
 * local to here is where it gets applied: resolved by the walk, rewritten on
 * copy, and asserted afterwards against the built output.
 */
/**
 * The two roots a shipped file can come from.
 *
 * source_examples/ began as EVIDENCE — captured from codecave.pro, authored by
 * nobody here, with check:captures proving it still matched. authored/ is the
 * opposite and exists for exactly one reason: BrandNav.vue is the site bar and
 * the docs bar reconciled into one component, so it has no upstream to be
 * captured from. Neither repo owns it any more.
 *
 * Kept as two directories rather than a flag or a list, because the directory
 * name IS the claim.
 *
 * THAT CLAIM IS NOW MOSTLY THE OTHER WAY ROUND, AND KNOWINGLY SO.
 * check:captures was deleted on 2026-08-25: the site installs this package and
 * pins it, so demanding the two be equal was red for exactly the changes it was
 * meant to protect. Of the 45 files under source_examples/, 37 have no upstream
 * at all — they are the ORIGIN now, and editing one is the normal way to change
 * a component — 6 are captures of this repo's own earlier token files, and 2 are
 * live inputs the build reads (global.css, logo.svg). Nothing under either root
 * is evidence of a repository this one cannot see.
 */
const ROOTS = ['source_examples', 'authored'];

/** Which root holds a given capture-relative path. Filled by shippable(). */
const rootOfRel = new Map();

/** The file a shipped path was copied from, in whichever root holds it. */
const originOf = (rel) => docs(rootOfRel.get(rel) ?? 'source_examples', rel);

/** A shipped file whose bytes are not its capture's is one of these. */
const isAliased = (rel) => usesAlias(fs.readFileSync(originOf(captureOf(rel)), 'utf8'));

/**
 * Every file a source file points at, in the spelling it points at them with.
 *
 * WHY url() IS IN HERE. It was not, and the walk below is what decides which
 * files the package ships. Checkbox.vue draws its tick as a background-image on
 * a pseudo-element -- `url("../../assets/images/checked-icon.svg")` inside its
 * <style> block, which is not an import and so was not an edge. The icon never
 * entered the tarball, and nothing anywhere said so: the build was green, the
 * byte-identity check had nothing to compare because the file was not in the
 * shipped set, and assertDistResolves() read the built files with these same two
 * import patterns and so shared the blind spot exactly. It reached a consumer as
 * a 404 on /assets/images/checked-icon.svg and a checkbox that would not tick.
 *
 * logo.svg was carried the whole time and hid the gap, because a component
 * happens to reach IT through `import Logo from "../../assets/images/logo.svg"`.
 * Assets were never shipped as a category -- only ever as a side effect of the
 * one spelling the walk knew.
 *
 * What is deliberately NOT returned: a scheme (`https:`, `data:`), a
 * protocol-relative `//host`, and a bare `#fragment` -- an SVG's own gradient
 * and filter references are that last form, and this text scan reads shipped
 * SVGs too. Everything else is a file, and must be one this package carries;
 * a root-relative `/assets/x.svg` is not exempt, because a consumer has no
 * codecave.pro public/ directory to serve it from.
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

/**
 * Every reference in dist/ must resolve inside dist/ — checked on the BUILT files,
 * not on the captures the walk read.
 *
 * shippable() already refuses a relative import that escapes the package, but it
 * asks the question of the capture, and the @helpers rewrite happens after. That
 * gap is not theoretical: stop the walk from following the alias and the build
 * stays green while src/helpers/ vanishes from the tarball and every rewritten
 * `../../helpers/paths.ts` points at nothing. It publishes, it installs, and it
 * dies in the consumer's bundler. Verified by doing exactly that.
 *
 * So the artifact is asked instead. Anything the rewrite missed still says
 * @helpers and is named; anything the rewrite produced that leads nowhere is
 * named too, whatever put it there.
 */
function assertDistResolves() {
  const built = new Set(shipped);
  const stale = [];
  const dangling = [];
  for (const rel of shipped) {
    const file = out(rel);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    if (usesAlias(src)) stale.push(rel);
    /* Alias specifiers are reported as stale just above; joining one here would
     * only name the same file twice, under a path it never had. */
    for (const spec of referencesOf(src).filter((s) => !isAlias(s))) {
      const joined = path.posix.join(path.posix.dirname(rel), spec);
      if (![joined, `${joined}.ts`, `${joined}.vue`].some((c) => built.has(c))) {
        dangling.push([rel, spec]);
      }
    }
  }
  if (!stale.length && !dangling.length) return;
  console.error('build failed — dist/ does not hold together:');
  for (const rel of stale) {
    console.error(`  dist/${rel} still imports through an alias`);
  }
  for (const [rel, spec] of dangling) {
    console.error(`  dist/${rel} reaches ${spec}, which this package does not carry`);
  }
  console.error('');
  console.error('unalias() rewrites a QUOTED specifier whose prefix is in the table in');
  console.error('docs/tools/import-aliases.mjs, and nothing else. An alias listed there');
  console.error('with a null target is one this package deliberately does NOT ship --');
  console.error('@styles and @layouts -- so a shipped file reaching one is the bug, not');
  console.error('the missing rewrite. shippable() only follows what referencesOf()');
  console.error('returns; a reference spelled some other way needs handling in both.');
  process.exit(1);
}

/**
 * Every npm package the shipped components import must be a declared peer.
 *
 * The import walk below polices *relative* imports — it proves nothing about
 * `import { Carousel } from "vue3-carousel"`. An undeclared one resolves fine
 * here, because the site checkout next door has it installed, and then fails in
 * the consumer's build, which is the worst place to find out. Promoting the
 * four CMS-shaped components added three of these at once.
 */
/**
 * No shipped file may import this package by its own name.
 *
 * The site consumes the package that way -- 38 files say
 * `@codecavepro/brand/components/common/Button.vue` -- and the captures are the
 * site's files. So the spelling is one refresh away from landing inside the
 * package at any time, and it does not announce itself: Node resolves a
 * package's own name when `exports` is present, so it would very likely just
 * work, right up until a consumer ends up with two versions installed and one
 * component quietly renders another version's Button.
 *
 * assertPeersDeclared would catch it today, but with exactly the wrong advice --
 * it would report an undeclared peer and tell you to declare it, which is how
 * @codecavepro/brand ends up as a peerDependency of @codecavepro/brand. Hence a
 * separate check that says the real thing.
 *
 * It passes because of what NOT_SHIPPED now excludes, not by luck: every shipped
 * file whose origin is still alive on the site is an icon, a helper or a type
 * file, and none of those render a shared component. The day that stops being
 * true this fails, which is the point. (CCWEB2-371)
 */
/**
 * Every custom property a shipped component READS must be one the package
 * declares — in tokens.css, in theme.css, or in that component's own style
 * block. Runs after the derived files exist, because those two ARE the
 * declaration.
 *
 * WHY. The site declares things privately in its own :root, and a component
 * that reads one of them looks perfect here and on codecave.pro while being
 * broken for everyone else. --duration-control was exactly that: Checkbox.vue
 * and Radio.vue transition their tick and dot through it, the site declared it,
 * the package never did. A consumer got `transition: var(--duration-control)
 * transform` with nothing behind the var — invalid at computed-value time, so
 * the tick appeared instantly instead of scaling in. Nothing failed; it was
 * simply wrong, in the quiet way.
 *
 * This is the CSS half of the question assertDistResolves() asks about imports
 * and url(): does everything this package hands a consumer resolve inside what
 * it hands them? (CCWEB2-371)
 */
function assertTokensSuffice() {
  const declared = new Set();
  for (const file of ['tokens.css', 'theme.css']) {
    const css = fs.readFileSync(out(file), 'utf8');
    for (const m of css.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:/gm)) declared.add(m[1]);
  }
  const missing = new Map();
  for (const rel of shipped) {
    const src = fs.readFileSync(out(rel), 'utf8');
    const blocks = src.match(/<style[\s\S]*?<\/style>/g) ?? [src];
    for (const block of blocks) {
      const own = new Set([...block.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));
      for (const m of block.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) {
        if (declared.has(m[1]) || own.has(m[1])) continue;
        if (!missing.has(m[1])) missing.set(m[1], new Set());
        missing.get(m[1]).add(rel);
      }
    }
  }
  if (!missing.size) return;
  console.error('build failed — a shipped component reads a property this package does not declare:');
  for (const [name, files] of [...missing].sort()) {
    console.error(`  ${name}  <-  ${[...files].sort().join(', ')}`);
  }
  console.error('');
  console.error('It resolves on codecave.pro because the site declares it privately, and');
  console.error('nowhere else. Add it to docs/colors_and_type.css — or to docs/theme.css if');
  console.error('a utility class should exist for it, which for a value read only from a');
  console.error('scoped style block it should not.');
  process.exit(1);
}

/**
 * The bytes a shipped file will CONTAIN, which are not the bytes of the capture
 * it comes from wherever an alias is rewritten on copy.
 *
 * Every check that reasons about a file's IMPORTS has to read this rather than
 * the capture, or it judges a specifier that never reaches the tarball. Both of
 * the checks below read the capture, which was correct only while the sole
 * alias was @helpers -- that one is not a bare specifier, so neither check ever
 * looked at it. The package's own name IS bare, and both fired on a spelling
 * the rewrite removes: assertNoSelfImport() by name, assertPeersDeclared() by
 * demanding @codecavepro/brand as its own peer.
 */
function shippedText(shipped, byShipped) {
  const src = fs.readFileSync(originOf(byShipped.get(shipped)), 'utf8');
  return usesAlias(src) ? unalias(src, shipped) : src;
}

function assertNoSelfImport(shippedFiles, byShipped) {
  const self = JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8')).name;
  const guilty = [];
  for (const shipped of shippedFiles) {
    const src = shippedText(shipped, byShipped);
    for (const m of src.matchAll(/from\s*["']([^."'][^"']*)["']/g)) {
      if (m[1] === self || m[1].startsWith(`${self}/`)) guilty.push([shipped, m[1]]);
    }
  }
  if (!guilty.length) return;
  console.error(`build failed — a shipped file imports ${self}, which is this package:`);
  for (const [shipped, spec] of guilty) console.error(`  dist/${shipped}  ->  ${spec}`);
  console.error('');
  console.error('That is the site\x27s spelling. It normally leaves on copy --');
  console.error('import-aliases.mjs rewrites the four subpaths that map into dist/src/');
  console.error('into relative form -- so what is above is either a subpath it does NOT');
  console.error('rewrite, or a file the rewrite never ran on. Do not widen the rule');
  console.error(`without reading why it is narrow, and never declare ${self}`);
  console.error('as its own peerDependency: Node resolves a self-reference through the');
  console.error('exports map, so the package would quietly depend on a separately');
  console.error('installed copy of itself.');
  process.exit(1);
}

function assertPeersDeclared(shippedFiles, byShipped) {
  const manifest = JSON.parse(fs.readFileSync(path.join(pkg, 'package.json'), 'utf8'));
  const declared = new Set(Object.keys(manifest.peerDependencies ?? {}));
  const imported = new Map();

  for (const shipped of shippedFiles) {
    const src = shippedText(shipped, byShipped);
    const specs = [
      ...[...src.matchAll(/from\s*["']([^."'][^"']*)["']/g)],
      ...[...src.matchAll(/^\s*import\s+["']([^."'][^"']*)["']/gm)],
    ].map((m) => m[1]);
    for (const spec of specs) {
      /* Not an npm package, however much `@helpers/paths.ts` looks like one to
       * the split below. It is resolved by the walk and rewritten on copy. */
      if (isAlias(spec)) continue;
      const parts = spec.split('/');
      const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
      if (!imported.has(name)) imported.set(name, new Set());
      imported.get(name).add(shipped);
    }
  }

  const undeclared = [...imported.keys()].filter((n) => !declared.has(n)).sort();
  const unused = [...declared].filter((n) => !imported.has(n)).sort();
  if (!undeclared.length && !unused.length) return;

  console.error('build failed — package.json disagrees with what the components import:');
  for (const name of undeclared) {
    console.error(`  ${name} is imported but not a peerDependency, wanted by:`);
    for (const f of [...imported.get(name)].sort()) console.error(`      dist/${f}`);
  }
  for (const name of unused) {
    console.error(`  ${name} is a peerDependency but nothing shipped imports it.`);
  }
  console.error('');
  console.error('An undeclared peer resolves here — the site checkout next door has it —');
  console.error("and breaks in the consumer's build. Declare it, optional unless every");
  console.error('component needs it, and say in README.md which components want it.');
  process.exit(1);
}

/**
 * The shippable captures, computed rather than listed.
 *
 * Every .vue that is not excluded is a root; every file each root REACHES —
 * relative imports, aliased helpers, and the url() targets in its styles — is
 * followed transitively and pulled in with it. A list written by hand goes
 * stale the first time a component gains a reference; this cannot, and it fails
 * loudly rather than shipping a component whose reference resolves to nothing.
 */
function shippable() {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

  /* Both roots, flattened into one list of capture-relative paths, with each
   * path remembering where it came from. A name colliding across the two would
   * be a genuine ambiguity — the same shipped file with two different origins —
   * so it fails here rather than letting whichever root walked last win. */
  const all = [];
  for (const root of ROOTS) {
    const base = docs(root);
    if (!fs.existsSync(base)) continue;
    for (const file of walk(base)) {
      const rel = path.relative(base, file).split(path.sep).join('/');
      if (root === 'source_examples' && rel.startsWith('brand-repo')) continue;
      if (rootOfRel.has(rel)) {
        console.error(`build failed — ${rel} exists in both ${rootOfRel.get(rel)}/ and ${root}/.`);
        console.error('One shipped file cannot have two origins. Rename one, or delete');
        console.error('the authored copy if the site has since grown a real one to capture.');
        process.exit(1);
      }
      rootOfRel.set(rel, root);
      all.push(rel);
    }
  }

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
    const src = fs.readFileSync(originOf(byShipped.get(shipped)), 'utf8');
    for (const spec of referencesOf(src)) {
      /* Every form lands in the same coordinate system -- the shipped layout --
       * so an aliased helper is followed exactly like a relative import, and a
       * stylesheet url() exactly like both. A file stays in the package because
       * something reaches it, rather than because of how that reach is spelled. */
      const joined = aliasTarget(spec)
        ?? path.posix.join(path.posix.dirname(shipped), spec);
      const hit = [joined, `${joined}.ts`, `${joined}.vue`].find((c) => byShipped.has(c));
      if (!hit) { escaped.push([shipped, spec]); continue; }
      visit(hit);
    }
  };
  for (const shipped of roots) visit(shipped);

  assertNoSelfImport(seen, byShipped);
  assertPeersDeclared(seen, byShipped);

  if (escaped.length) {
    console.error('build failed — a shipped file reaches for something the package does not carry:');
    for (const [shipped, spec] of escaped) console.error(`  dist/${shipped}  ->  ${spec}`);
    console.error('');
    console.error('Capture what it reaches for, or add the component to NOT_SHIPPED with a reason.');
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
    originOf(captureOf(rel)),
    out(rel),
    `dist/${rel}`,
    rel,
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

/**
 * The Tailwind bridge, EXTRACTED from docs/theme.css. It is the `@theme`
 * block and nothing else.
 *
 * ITS ORIGIN MOVED, and the reason is written next to the block itself.
 * Briefly: it used to be extracted from the capture of the site's global.css,
 * until the site deleted its own @theme block and started importing this file
 * instead. That made the derivation a circle, surviving only while the capture
 * stayed stale. The block is now promoted into docs/, like the components were.
 *
 * WHY IT EXISTS. `./tokens.css` publishes the token *values*; it declares
 * --color-surface-primary. It does not make `.bg-surface-primary` exist. A
 * Tailwind utility class exists only if Tailwind knows the name, and Tailwind
 * learns names from an @theme block. Since the package started shipping the
 * components, a consumer who installed them got components that mounted,
 * behaved correctly, and rendered nearly unstyled — because every colour,
 * radius and control height in them is reached through a utility class.
 *
 * ORDERING IS LOAD-BEARING. Six of these entries are written as
 * self-references — `--color-glow-25: var(--color-glow-25)`. That is not a
 * bug and must never be "fixed" on sight: the declaration exists so Tailwind
 * emits the utility, while the value comes from tokens.css, whose :root is
 * unlayered and therefore beats @layer theme. A self-reference with no
 * unlayered declaration behind it is a cycle, and the property silently
 * becomes invalid. So theme.css is correct ONLY when tokens.css is imported
 * before it and stays unlayered. The header says so to the consumer.
 *
 * The block is located structurally, like the :root one, and anything
 * ambiguous is a hard failure rather than a guess.
 */
function extractTheme(src) {
  const css = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
  const rel = path.relative(repo, src).split(path.sep).join('/');

  const opens = [...css.matchAll(/^@theme\s*\{[ \t]*$/gm)];
  if (opens.length !== 1) {
    throw new Error(
      `${rel}: expected exactly one \`@theme {\` block, found ${opens.length}.\n` +
        'dist/theme.css is extracted from it — see scripts/build.mjs.',
    );
  }

  const from = opens[0].index;
  const close = css.indexOf('\n}\n', from);
  if (close === -1) throw new Error(`${rel}: the @theme block is never closed in column 0.`);
  const block = css.slice(from, close + 2) + '\n';

  const declarations = (block.match(/^\s+--[\w-]+\s*:/gm) ?? []).length;
  if (declarations < 30) {
    throw new Error(`${rel}: the @theme block declares only ${declarations} names.`);
  }

  const header = [
    '/* ==========================================================================',
    ' * CODECAVE Tailwind theme — @codecavepro/brand/theme.css',
    ' * --------------------------------------------------------------------------',
    ` * GENERATED from ${rel} — do not edit.`,
    ' *',
    ' * Declares the names Tailwind needs in order to emit CODECAVE utility',
    ' * classes: bg-surface-primary, text-heading-lg, rounded-card and the rest.',
    ' * Without it the components in this package mount and behave correctly and',
    ' * render nearly unstyled.',
    ' *',
    ' * IMPORT ORDER MATTERS, and this file is wrong without it:',
    ' *',
    ' *   @import "tailwindcss";',
    ' *   @import "@codecavepro/brand/tokens.css";   <- must come first,',
    ' *   @import "@codecavepro/brand/theme.css";       and stay unlayered',
    ' *',
    ' * Several entries here are deliberate self-references (--x: var(--x)). They',
    ' * exist so Tailwind emits the utility; the value comes from tokens.css,',
    " * whose unlayered :root outranks @layer theme. Import tokens.css inside a",
    ' * cascade layer, or not at all, and those names resolve to nothing.',
    ' * ======================================================================== */',
    '',
    '',
  ].join('\n');

  return header + block;
}

/**
 * A name declared in BOTH theme.css and tokens.css, with two different literal
 * values, is the second-home failure this package exists to end — and it hides,
 * because tokens.css wins the cascade and the @theme value is simply dead. The
 * site would show one value while the package documents another.
 *
 * So: every literal in the @theme block whose name tokens.css also declares
 * must agree with it. Entries whose value is a var() reference are the correct
 * shape and are not compared.
 */
const THEME_VALUE_EXCEPTIONS = [
  [
    '--font-sans',
    'tokens.css ships the full fallback stack; global.css says "Satoshi, ' +
      'sans-serif". The package value already wins on the live site, measured ' +
      'during CCWEB2-318 phase 6 — the only resolved value the whole migration ' +
      'moved. Keeping the shorter literal would re-import the shorter stack.',
  ],
];

function assertThemeAgreesWithTokens(themeCss, tokensCss) {
  const declared = new Map();
  for (const m of tokensCss.matchAll(/^\s+(--[\w-]+)\s*:\s*([^;]+);/gm)) {
    declared.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  }
  const excused = new Map(THEME_VALUE_EXCEPTIONS);
  const clashes = [];

  for (const m of themeCss.matchAll(/^\s+(--[\w-]+)\s*:\s*([^;]+);/gm)) {
    const name = m[1];
    const value = m[2].replace(/\s+/g, ' ').trim();
    if (value.startsWith('var(')) continue;
    if (!declared.has(name) || excused.has(name)) continue;
    if (declared.get(name) !== value) {
      clashes.push(`  ${name}\n      theme.css:  ${value}\n      tokens.css: ${declared.get(name)}`);
    }
  }

  if (clashes.length) {
    console.error(
      'build failed — theme.css and tokens.css disagree about ' +
        `${clashes.length} value(s):\n${clashes.join('\n')}\n\n` +
        'tokens.css wins the cascade, so the theme.css value is already dead\n' +
        'wherever both are imported. Fix it in docs/theme.css — make the entry\n' +
        '`var(--name)`, as the others are. That file is the origin now; do not\n' +
        'chase this into docs/source_examples/, which is evidence, not source.',
    );
    process.exit(1);
  }
  return declared.size;
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
const DERIVED = [
  [() => extractRoot(docs('colors_and_type.css')), 'tokens.css'],
  [() => extractTheme(docs('theme.css')), 'theme.css'],
];

/* Both derived stylesheets, re-derived, so the agreement check runs against
 * what this build would ship rather than against whatever is in dist/. */
const themeAgrees = () =>
  assertThemeAgreesWithTokens(
    derive(DERIVED[1][0], 'theme.css'),
    derive(DERIVED[0][0], 'tokens.css'),
  );

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
  for (const [src, target, label, rel] of COPIES) {
    if (!fs.existsSync(target)) {
      console.error(`  not built: ${label}`);
      drifted++;
      continue;
    }
    /* An aliased capture is compared against what it REWRITES to, the same way
     * a derived file is compared against what it extracts to. The guarantee is
     * unchanged in kind: dist/ is still provably a function of docs/ alone. */
    const rewritten = rel && isAliased(rel)
      ? unalias(fs.readFileSync(src, 'utf8'), rel)
      : null;
    const matches = rewritten === null
      ? fs.readFileSync(src).equals(fs.readFileSync(target))
      : fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') === rewritten;
    if (!matches) {
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
  const known = themeAgrees();
  const rewritten = COPIES.filter(([, , , rel]) => rel && isAliased(rel)).length;
  console.log(
    `@codecavepro/brand: ${COPIES.length - rewritten} file(s) match their origin ` +
      `byte-for-byte, ${rewritten} match it once @helpers is resolved, ` +
      `${DERIVED.length} re-derive unchanged, theme.css agrees with ${known} token(s).`,
  );
  process.exit(0);
}

fs.rmSync(out(), { recursive: true, force: true });
fs.rmSync(tmp(), { recursive: true, force: true });
fs.mkdirSync(out(), { recursive: true });
fs.mkdirSync(tmp('tokens'), { recursive: true });

for (const [src, target, , rel] of COPIES) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  /* Byte-for-byte unless the capture uses the @helpers alias, which cannot
   * survive into a consumer's node_modules. Deciding per file keeps the
   * guarantee for everything else literally true rather than nearly true. */
  if (rel && isAliased(rel)) fs.writeFileSync(target, unalias(fs.readFileSync(src, 'utf8'), rel));
  else fs.copyFileSync(src, target);
}

assertExclusionsExist();
assertDistResolves();

for (const [produce, dest] of DERIVED) {
  fs.writeFileSync(out(dest), derive(produce, dest));
}

themeAgrees();
assertTokensSuffice();

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


  /* And for the face count, which is the one that actually went stale. The
   * README said `six @font-face` in two places from 1.0 until the four italic
   * cuts landed, and nothing noticed -- the two counts above were asserted and
   * this one was not, so it was the only number on the npm page that could
   * drift. Every mention has to agree, not just the first: the sentence appears
   * once in the overview and once under Fonts, and fixing only one is exactly
   * how it went wrong before. */
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const faces = [...fs.readFileSync(readme, 'utf8')
    .matchAll(/(\w+) `@font-face`/g)].map((m) => m[1]).filter((w) => WORDS.includes(w) || /^\d+$/.test(w));
  if (faces.length) {
    const real = (fs.readFileSync(out('colors_and_type.css'), 'utf8')
      .match(/@font-face/g) ?? []).length;
    const want = WORDS[real] ?? String(real);
    const wrong = faces.filter((word) => word !== want);
    if (wrong.length) {
      console.error(
        `build failed — README.md says ${[...new Set(faces)].join('/')} ` +
          `\`@font-face\` rule(s); dist/colors_and_type.css declares ${real} (${want}).`,
      );
      process.exit(1);
    }
    asserted += faces.length;
  }
  console.log(`@codecavepro/brand: ${asserted} README example value(s) verified.`);
}

const emitted = fs.readdirSync(out()).sort();
console.log(`@codecavepro/brand built: ${emitted.join(', ')}`);
