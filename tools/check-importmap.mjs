/* Prove the vendor map covers exactly what the compiled bundles import.
 *
 *   node tools/check-importmap.mjs
 *
 * The compiled specimens are esbuild output with `vue` and the gsap entry
 * points left external, so `import { SplitText } from "gsap/SplitText"`
 * survives into the browser and only an import map resolves it. Miss one and
 * the browser rejects the whole module graph: the page renders, the
 * stylesheets load, the specimen simply never mounts, and nothing anywhere
 * says why.
 *
 * That is not hypothetical. Refreshing the captures moved TypingEffect from
 * `gsap/dist/SplitText` to `gsap/SplitText` -- the site had followed gsap 3.13,
 * which promoted the plugin to a root entry point -- and the map kept naming
 * the old path. That specimen was dead in every built storybook from the
 * refresh until this check was written.
 *
 * Both directions, for the same reason packages/brand checks its peers both
 * ways: an unmapped import kills a page, and a mapped specifier nothing
 * imports any more is a claim about the bundles that has quietly stopped
 * being true.
 *
 * IT ALSO ASKS WHETHER THE FILE IS THERE, which the DocPage version never did.
 * That version compared two lists of NAMES, so a map entry pointing at a
 * vendored runtime nobody had committed passed cleanly and failed as a 404 in
 * the browser -- the same silent-empty-canvas failure the check exists to
 * prevent, one layer further in.
 *
 * The map moved out of layouts/DocPage.astro when the kitchen-sink specimens
 * stopped mounting bundles and began importing the .vue sources through Vite.
 * Its consumer now is ds-bundle/, whose Design-project cards cannot run a
 * bundler; tools/storybook-vendor.mjs says the rest.
 *
 * REQUIRES A BUILD. vendor/ is committed, but compiled/ is generated and
 * gitignored, so this reads output rather than tracked files: run
 * `npm run build:storybook` first. `npm run check` assumes the same thing
 * already -- it reads packages/brand/dist/ -- so this adds no new
 * precondition, only a second reason for the existing one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VENDOR } from './storybook-vendor.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const compiled = path.join(docs, 'storybook', 'compiled');
const vendor = path.join(docs, 'vendor');
const rel = (p) => path.relative(process.cwd(), p);

/* ---- what the bundles import -------------------------------------------- */
const bundles = fs.existsSync(compiled)
  ? fs.readdirSync(compiled).filter((f) => f.endsWith('.js')).sort()
  : [];

if (!bundles.length) {
  console.error(`no compiled specimens in ${rel(compiled)} — nothing to check.`);
  process.exit(1);
}

/* Static `from "x"`, side-effect `import "x"`, dynamic `import("x")`. A
 * specifier starting with . or / is a path the browser resolves by itself. */
const PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
];

const imported = new Map(); // specifier -> the bundles importing it
for (const file of bundles) {
  const src = fs.readFileSync(path.join(compiled, file), 'utf8');
  for (const re of PATTERNS) {
    for (const [, spec] of src.matchAll(re)) {
      if (spec.startsWith('.') || spec.startsWith('/')) continue;
      if (!imported.has(spec)) imported.set(spec, []);
      const seen = imported.get(spec);
      if (!seen.includes(file)) seen.push(file);
    }
  }
}

/* ---- what the map declares, and whether it is there --------------------- */
const mapped = Object.keys(VENDOR);
const missing = mapped
  .filter((k) => !fs.existsSync(path.join(vendor, VENDOR[k])))
  .sort();

/* ---- compare ------------------------------------------------------------ */
const unmapped = [...imported.keys()].filter((s) => !mapped.includes(s)).sort();
const unused = mapped.filter((s) => !imported.has(s)).sort();

if (unmapped.length) {
  console.error(
    `${unmapped.length} bare specifier(s) the storybook import map does not resolve.`,
    '\nThe browser rejects the whole module graph, so these never mount:\n' +
    unmapped.map((s) => `  ${s}  (${imported.get(s).join(', ')})`).join('\n') +
    '\nAdd them to VENDOR in tools/storybook-vendor.mjs, naming a file in ' +
    `${rel(vendor)}.`);
}

if (unused.length) {
  console.error(
    `${unused.length} import-map entr${unused.length === 1 ? 'y' : 'ies'} no compiled specimen imports:\n` +
    unused.map((s) => `  ${s}`).join('\n') +
    '\nEither a capture moved to a different entry point and the map was left' +
    '\nbehind, or the entry is dead. Reconcile it in tools/storybook-vendor.mjs.');
}

if (missing.length) {
  console.error(
    `${missing.length} vendor map target(s) missing from ${rel(vendor)}:\n` +
    missing.map((k) => `  ${k} -> ${VENDOR[k]}`).join('\n') +
    '\nThe specifier resolves and the fetch 404s, so the module graph still' +
    '\nfails and the canvas is still empty.');
}

if (unmapped.length || unused.length || missing.length) process.exit(1);

console.log(
  `vendor map resolves all ${mapped.length} bare specifier(s) across ` +
  `${bundles.length} compiled specimen(s) to files in ${rel(vendor)}: ` +
  mapped.join(', '));
