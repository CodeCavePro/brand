/* Prove the token layer and Tailwind are not quietly redefining each other.
 *
 *   node docs/tools/check-tw-collisions.mjs
 *
 * Two directions, because a custom property can go wrong in two ways and the
 * check that existed only ever looked one way.
 *
 *   A. UNDECLARED — an SFC references var(--x) that nothing declares. It renders
 *      today only because the Tailwind build happens to emit a default of that
 *      name. Lift the component out of that build and the value silently
 *      changes or disappears.
 *
 *   B. REDEFINED — the package declares --x and Tailwind ALSO declares it, with
 *      a different value. The package wins (see the cascade note below), so a
 *      consumer's `text-sm` utility silently renders at our size instead of
 *      Tailwind's, with no warning anywhere. Nothing in THIS repo renders
 *      differently, which is exactly why it needs a check: the storybook scopes
 *      the site's tokens to its demo canvases, so a collision that would hit
 *      every consumer at document level is invisible on the one page built to
 *      look at components.
 *
 * Direction A is CCWEB2-314's original one-liner, which lived in a Jira
 * description and was run by hand. Direction B is the complement that ticket
 * describes and nobody had ever run: "It cannot see a name the brand package
 * publishes that Tailwind also defines but no SFC happens to use." The first
 * time it ran it found 18 collisions, 16 of them value-changing, two of them
 * load-bearing — CCWEB2-323.
 *
 * WHY THE PACKAGE WINS. Tailwind declares its theme inside `@layer theme`.
 * colors_and_type.css declares in a plain, unlayered :root, and unlayered CSS
 * beats any cascade layer regardless of source order. Verified in Chrome 148
 * with the layered rule placed last, so it is not a source-order artifact:
 *
 *     :root { --probe: green; }                     <- unlayered, the package
 *     @layer theme { :root { --probe: red; } }      <- layered, Tailwind
 *     ...resolves green.
 *
 * That is what makes direction B worth checking at all. If it were ordinary
 * last-one-wins, a consumer could fix it by moving an import.
 *
 * WHY THIS RUNS IN CI. Both of its inputs are in this repo: source_examples/ is
 * committed, and Tailwind's default theme comes from a devDependency pinned to
 * the version the site resolves — the same trick build-storybook.mjs uses for
 * dompurify, for the same reason. Neither direction needs the private site
 * checkout.
 *
 * It does still LOOK at a site checkout when one is beside it, and that survived
 * the removal of check-captures.mjs on 2026-08-25 because it is a different kind
 * of question. The captures check asserted that this repo had not moved ahead of
 * the site, which is now the normal state. These two ask whether a token would
 * collide in the CONSUMER's app, and the consumer is the site: the Tailwind pin
 * is asserted against the version the site builds with, and the site's own .vue
 * files widen the undeclared-property sweep. Neither says this repo is wrong for
 * being ahead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(docs, '..');
const captures = path.join(docs, 'source_examples');

/* Tailwind's COMPLETE default theme, straight from the package.
 *
 * Not storybook/tw-bridge.css, which is the obvious-looking source and the
 * wrong one: that file is tree-shaken to the utilities the specimens actually
 * use, so basing a collision check on it would rebuild in a new place exactly
 * the blind spot this check exists to close. */
const TW_THEME = path.join(repo, 'node_modules', 'tailwindcss', 'theme.css');

/* Collisions that are known and deliberate. Anything NOT listed here fails the
 * build, which is the whole point — the list is a record of decisions taken,
 * never a way to make the check quiet. */
const INTENDED = {
  '--color-gray-50':  'site declares the brand greys in its own unlayered :root, same value',
  '--color-gray-100': 'ditto',
  '--color-gray-200': 'ditto',
  '--color-gray-300': 'ditto',
  '--color-gray-400': 'ditto',
  '--color-gray-500': 'ditto',
  '--color-gray-600': 'ditto',
  '--color-gray-700': 'ditto',
  '--color-gray-800': 'ditto',
  '--color-gray-900': 'ditto',
  '--color-gray-950': 'ditto',
  '--font-sans':      'the brand font. site declares it in @theme deliberately',
  '--font-mono':      'package-only, but a mono stack is not something Tailwind should win',
  '--breakpoint-sm':  'site declares 457px in @theme; read at build time, inert at runtime',
  '--font-weight-bold': 'same value as Tailwind (700)',
};

/* Collisions that are real defects with a ticket open on them. Reported loudly
 * every run, but not fatal — they are tracked, and failing the build on a known
 * item would only teach people to skip the check.
 *
 * Empty, and the way it emptied is the point. Its two entries were --text-sm
 * and --text-lg (CCWEB2-323). They are now --text-label and --text-subhead,
 * names Tailwind has no default for, so there is nothing left to acknowledge:
 * the collision was removed rather than accepted. Prefer that. An entry here
 * is a debt, not a resolution. */
const OPEN = {};

/** Every `--name: value` declared at the top level of a rule in a CSS file. */
function declarations(css) {
  const out = new Map();
  for (const m of css.matchAll(/^[ \t]*(--[\w-]+)[ \t]*:([^;]*);/gm)) {
    if (!out.has(m[1])) out.set(m[1], m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim());
  }
  return out;
}

/** Every `var(--name)` referenced anywhere in a file. */
function references(css) {
  return new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const problems = [];

/* ---- A. names an SFC uses that nothing declares -------------------------- */

/* What the SITE has at runtime, which since CCWEB2-318 phase 6 is no longer
 * global.css alone: the site imports @codecavepro/brand/tokens.css and deleted
 * its own copy of the palette, so resolving declarations from global.css by
 * itself reports every brand token as undeclared. It reported 26 the day the
 * captures were refreshed, all of them false.
 *
 * FOLLOW THE IMPORT rather than hard-coding the union. If the site ever drops
 * that line, the names really do stop being declared and this check must fail
 * again — which it will, because the union is conditional on the import being
 * there. `@import "tailwindcss"` is deliberately NOT followed: a name that
 * exists only because Tailwind emits a default is exactly what direction A is
 * looking for.
 *
 * The package half is read from docs/colors_and_type.css's :root block, the
 * origin dist/tokens.css is extracted from (scripts/build.mjs), not from the
 * built file — dist/ is gitignored, so CI would resolve nothing. `npm run
 * check` asserts the two are identical before this ever runs. */
const globalCss = fs.readFileSync(path.join(captures, 'styles', 'global.css'), 'utf8');
const siteGlobals = new Set(declarations(globalCss).keys());

const IMPORTS_TOKENS = /^\s*@import\s+["']@codecavepro\/brand\/tokens\.css["']/m;
if (IMPORTS_TOKENS.test(globalCss)) {
  const origin = fs.readFileSync(path.join(docs, 'colors_and_type.css'), 'utf8');
  const open = origin.search(/^:root\s*\{[ \t]*$/m);
  const close = origin.indexOf('\n}\n', open);
  if (open === -1 || close === -1) {
    console.error('colors_and_type.css has no single top-level :root block to read tokens from.');
    console.error('Direction A was not checked; nothing about undeclared names was verified.');
    process.exit(1);
  }
  for (const name of declarations(origin.slice(open, close + 2)).keys()) siteGlobals.add(name);
}

/* And the same for the names that only an @theme entry declares.
 *
 * The --color-primary-* family is one of these: it aliases the brand ramp and
 * it has never been in colors_and_type.css. It used to be found because the
 * site wrote the @theme block itself; the site deleted that too and imports
 * theme.css instead, so this reported 4 names as undeclared -- asterisk-icon's
 * stroke among them -- all of them false, and all of them alarming, because an
 * invisible required-field asterisk is exactly the bug this check should find.
 *
 * Same discipline as the block above: follow the import rather than assume it,
 * and read the ORIGIN (docs/theme.css) rather than the generated dist/. */
const IMPORTS_THEME = /^\s*@import\s+["']@codecavepro\/brand\/theme\.css["']/m;
if (IMPORTS_THEME.test(globalCss)) {
  const themeOrigin = fs.readFileSync(path.join(docs, 'theme.css'), 'utf8');
  const open = themeOrigin.search(/^@theme\s*\{[ \t]*$/m);
  const close = themeOrigin.indexOf(`\n}\n`, open);
  if (open === -1 || close === -1) {
    console.error('docs/theme.css has no single top-level @theme block to read names from.');
    console.error('Direction A was not checked; nothing about undeclared names was verified.');
    process.exit(1);
  }
  for (const name of declarations(themeOrigin.slice(open, close + 2)).keys()) siteGlobals.add(name);
}

/* The captures always, and the full site tree as well when one is beside us.
 *
 * CCWEB2-314 asks for both: "run it against the website checkout, not just the
 * captures". The captures are 30 files and CI can see them; the site is every
 * file and CI cannot. Doing the wider sweep only when it is possible beats
 * picking one -- the narrow half never stops running, and the wide half runs
 * on every machine that has the checkout, which is every machine that could
 * act on the result anyway. */
const siteVue = path.join(path.resolve(repo, '..', 'codecave.pro'), 'src');
const scanned = [
  ...walk(captures).filter((f) => f.endsWith('.vue')).map((f) => [captures, f]),
  ...(fs.existsSync(siteVue)
    ? walk(siteVue).filter((f) => f.endsWith('.vue')).map((f) => [siteVue, f])
    : []),
];

for (const [base, file] of scanned.sort((a, b) => a[1].localeCompare(b[1]))) {
  const src = fs.readFileSync(file, 'utf8');
  /* Subtracting the file's OWN declarations is what makes this scriptable.
   * The one-liner in CCWEB2-314 could not do it, so it reported --duration --
   * which projects-carousel.vue declares inside its own scoped block -- and
   * every run needed a human to go and look at where the name was defined
   * before the result meant anything. A component-local custom property is not
   * an undeclared dependency on the build. */
  const own = new Set(declarations(src).keys());
  const rel = (base === captures ? '' : 'codecave.pro/src/') +
    path.relative(base, file).split(path.sep).join('/');

  for (const name of [...references(src)].sort()) {
    if (siteGlobals.has(name) || own.has(name)) continue;
    problems.push(`  ${rel}  uses ${name}, which neither global.css nor the file itself declares`);
  }
}

/* ---- B. names the package and Tailwind both declare ---------------------- */

if (!fs.existsSync(TW_THEME)) {
  console.error(`No Tailwind theme at ${path.relative(repo, TW_THEME)}`);
  console.error('Run `npm install` — tailwindcss is a devDependency of this repo.');
  console.error('Direction B was not checked; nothing about redefinition was verified.');
  process.exit(1);
}

const tw = declarations(fs.readFileSync(TW_THEME, 'utf8'));
const pkg = declarations(fs.readFileSync(path.join(docs, 'colors_and_type.css'), 'utf8'));

const open = [];
for (const [name, ours] of pkg) {
  if (!tw.has(name)) continue;
  if (name in INTENDED) continue;
  if (name in OPEN) {
    open.push(`  ${name}  ${OPEN[name]}`);
    continue;
  }
  const theirs = tw.get(name);
  if (theirs === ours) continue;   // collides by name only; nothing renders differently
  problems.push(
    `  ${name}  is declared by both — Tailwind ${theirs}, this package ${ours}\n` +
    `      The package wins (unlayered beats @layer theme), so every ` +
    `${name.replace(/^--/, '')} utility in a consumer's app silently changes.`,
  );
}

/* ---- the pin, when a site checkout is around to check it against --------- */

const site = path.resolve(repo, '..', 'codecave.pro');
const sitePkg = path.join(site, 'node_modules', 'tailwindcss', 'package.json');
const ourTw = JSON.parse(
  fs.readFileSync(path.join(repo, 'node_modules', 'tailwindcss', 'package.json'), 'utf8'),
).version;

if (fs.existsSync(sitePkg)) {
  const theirTw = JSON.parse(fs.readFileSync(sitePkg, 'utf8')).version;
  if (theirTw !== ourTw) {
    console.error(`Checked against Tailwind ${ourTw}, but the site builds with ${theirTw}.`);
    console.error(`Fix: npm i -D --save-exact tailwindcss@${theirTw}`);
    process.exit(1);
  }
}

/* ---- report -------------------------------------------------------------- */

if (open.length) {
  console.log(`${open.length} known collision(s), tracked and not fixed:`);
  for (const line of open) console.log(line);
  console.log('');
}

if (problems.length) {
  console.error(`${problems.length} token problem(s):`);
  for (const line of problems) console.error(line);
  console.error('');
  console.error('A name in direction A: add it to the package tokens, declare it in the');
  console.error('site\'s global.css, or scope it to the component. A name in direction B:');
  console.error('rename the package\'s token, or add it to INTENDED in this file WITH the');
  console.error('reason it is deliberate.');
  process.exit(1);
}

console.log(
  `tokens and Tailwind ${ourTw} do not collide ` +
  `(${pkg.size} package tokens vs ${tw.size} Tailwind defaults, ` +
  `${Object.keys(INTENDED).length} intended overrides, ${open.length} tracked).`,
);
console.log(
  `${scanned.length} SFC(s) scanned for undeclared properties` +
  (fs.existsSync(siteVue) ? ', captures and site checkout.' : ' — captures only, no site checkout.'),
);
