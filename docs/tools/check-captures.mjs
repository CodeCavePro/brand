/* Prove docs/source_examples/ still matches the site it was captured from.
 *
 *   node docs/tools/check-captures.mjs [path-to-codecave.pro]
 *
 * Exit 0 when every capture is byte-identical to its origin in the site
 * checkout; exit 1, listing the drifted files, when it is not.
 *
 * Why this exists: source_examples/ is EVIDENCE. Everything in this package
 * that claims "production does X" is ultimately resting on those files, and a
 * capture that has fallen behind the site does not announce itself — it reads
 * exactly like a current one, and every claim built on it is quietly wrong.
 *
 * It had been measured by hand three times by 2026-08-21, finding nine drifted
 * files on 2026-08-19, thirteen on 2026-08-20 and zero on 2026-08-21. A number
 * that moves that fast is not something to re-derive by hand each time somebody
 * remembers to wonder — which is the same argument this repo applies to
 * tw-bridge.css and to the package's byte-identity. Hence a command.
 *
 * NOT in CI, and it cannot be: CodeCavePro/codecave.pro is private and CI has
 * no checkout of it. This is a local check, like `npm run build`. The pattern
 * matches build-storybook.mjs, which has the same constraint for the same
 * reason: when the site is unreachable, say so and stop rather than pretending
 * to have verified something.
 *
 * Six brand-repo-* captures are skipped. They are captures of THIS repo's own
 * earlier token files, not of the site, so they have no upstream here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const captures = path.join(docs, 'source_examples');
const repo = path.resolve(docs, '..');

const site = path.resolve(process.argv[2] ?? path.join(repo, '..', 'codecave.pro'));
const srcDir = path.join(site, 'src');

if (!fs.existsSync(srcDir)) {
  console.error(`No codecave.pro checkout at ${site}`);
  console.error('');
  console.error('Pass one explicitly:');
  console.error('  node docs/tools/check-captures.mjs ../path/to/codecave.pro');
  console.error('');
  console.error('Nothing was verified. The captures may or may not be current.');
  process.exit(1);
}

/** Every file under source_examples/, repo-relative. */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

/**
 * Where a capture came from. The vue/astro trees live under src/components/ on
 * the site but are captured without that segment, so both layouts are tried.
 */
function originOf(rel) {
  for (const candidate of [path.join(srcDir, rel), path.join(srcDir, 'components', rel)]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const drifted = [];
const unresolved = [];
let checked = 0;
let skipped = 0;

for (const file of walk(captures).sort()) {
  const rel = path.relative(captures, file).split(path.sep).join('/');
  if (rel.startsWith('brand-repo-')) {
    skipped++;
    continue;
  }

  const origin = originOf(rel);
  if (origin === null) {
    unresolved.push(rel);
    continue;
  }

  checked++;
  if (!fs.readFileSync(file).equals(fs.readFileSync(origin))) {
    drifted.push({ rel, origin: path.relative(site, origin).split(path.sep).join('/') });
  }
}

// A capture whose origin has vanished is not "fine" — the site deleted or moved
// the file and the capture is now documenting something that does not exist.
if (unresolved.length) {
  console.error(`${unresolved.length} capture(s) have no counterpart in the site checkout:`);
  for (const rel of unresolved) console.error(`  ${rel}`);
  console.error('');
  console.error('Either the site moved the file, or it deleted it and the capture is stale.');
}

if (drifted.length) {
  console.error(`${drifted.length} capture(s) have drifted from the site:`);
  for (const { rel, origin } of drifted) console.error(`  ${rel}  <-  ${origin}`);
  console.error('');
  console.error('Refresh them FROM the site — never hand-edit a capture to match.');
  console.error('Then rebuild the storybook, which is derived from them:');
  console.error(`  node docs/tools/build-storybook.mjs ${path.relative(repo, site)}`);
}

if (drifted.length || unresolved.length) process.exit(1);

console.log(
  `source_examples/ matches ${path.basename(site)} ` +
  `(${checked} file(s) byte-identical, ${skipped} brand-repo capture(s) skipped).`,
);
