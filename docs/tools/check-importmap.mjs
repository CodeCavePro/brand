/* Prove the storybook's import map covers exactly what its bundles import.
 *
 *   node docs/tools/check-importmap.mjs
 *
 * The compiled specimens are esbuild output with `vue` and the gsap entry
 * points left external, so `import { SplitText } from "gsap/SplitText"`
 * survives into the browser and only the import map in layouts/DocPage.astro
 * resolves it. Miss one and the browser rejects the whole module graph: the
 * page renders, the stylesheets load, the specimen simply never mounts, and
 * nothing anywhere says why.
 *
 * That is not hypothetical. Refreshing the captures moved TypingEffect from
 * `gsap/dist/SplitText` to `gsap/SplitText` — the site had followed gsap 3.13,
 * which promoted the plugin to a root entry point — and the map kept naming
 * the old path. That specimen was dead in every built storybook from the
 * refresh until this check was written.
 *
 * Both directions, for the same reason packages/brand checks its peers both
 * ways: an unmapped import kills a page, and a mapped specifier nothing
 * imports any more is a claim about the bundles that has quietly stopped
 * being true. Neither input needs the codecave.pro checkout — compiled/ is
 * committed and the layout is right here — so this runs wherever node does.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const compiled = path.join(docs, 'storybook', 'compiled');
const layout = path.join(docs, 'layouts', 'DocPage.astro');
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

/* ---- what the map declares ---------------------------------------------- */
const src = fs.readFileSync(layout, 'utf8');
const block = src.match(/const importmapJson = `([\s\S]*?)`;/);
if (!block) {
  console.error(
    `no importmapJson template literal in ${rel(layout)} — this check reads the map from there.`);
  process.exit(1);
}

const mapped = [...block[1].matchAll(/"([^"]+)"\s*:\s*"/g)].map(([, key]) => key);
if (!mapped.length) {
  console.error(`the importmapJson template in ${rel(layout)} declares nothing.`);
  process.exit(1);
}

/* ---- compare ------------------------------------------------------------ */
const unmapped = [...imported.keys()].filter((s) => !mapped.includes(s)).sort();
const unused = mapped.filter((s) => !imported.has(s)).sort();

if (unmapped.length) {
  console.error(
    `${unmapped.length} bare specifier(s) the storybook import map does not resolve.`,
    '\nThe browser rejects the whole module graph, so these never mount:\n' +
    unmapped.map((s) => `  ${s}  (${imported.get(s).join(', ')})`).join('\n') +
    `\nAdd them to importmapJson in ${rel(layout)}, pointing at docs/vendor/.`);
}

if (unused.length) {
  console.error(
    `${unused.length} import-map entr${unused.length === 1 ? 'y' : 'ies'} no compiled specimen imports:\n` +
    unused.map((s) => `  ${s}`).join('\n') +
    '\nEither a capture moved to a different entry point and the map was left' +
    `\nbehind, or the entry is dead. Reconcile it in ${rel(layout)}.`);
}

if (unmapped.length || unused.length) process.exit(1);

console.log(
  `import map resolves all ${mapped.length} bare specifier(s) across ` +
  `${bundles.length} compiled specimen(s): ${mapped.join(', ')}`);
