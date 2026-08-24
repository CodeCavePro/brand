/* Prove every reference inside a deliverable still resolves.
 *
 *   node docs/tools/check-examples.mjs
 *
 * The six files under docs/examples/raw/ are the only things on this site that
 * are NOT pages: they are standalone documents a client is handed, and Astro
 * never renders them. That is exactly why they need this check -- nothing else
 * looks at them. A page with a broken asset fails a build or shows up in a
 * console; a payload file with a broken asset ships.
 *
 * It has already happened once. Moving artifacts/ to examples/raw/ to make room
 * for the wrapper pages put them one directory deeper, and four of the six lost
 * `../assets/codecave-wide.svg` and `../colors_and_type.css` in the process --
 * a broken wordmark and an unstyled document, on the deliverables. Every check
 * in the repo stayed green, and the wrapper pages that embed them stayed green
 * too, because an <iframe> reports nothing about what happens inside it.
 *
 * So: every relative src/href in every raw artifact must resolve on disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = path.join(docs, 'examples', 'raw');
const rel = (p) => path.relative(process.cwd(), p);

if (!fs.existsSync(raw)) {
  console.error(`no ${rel(raw)} — the deliverables moved without this check.`);
  process.exit(1);
}

const files = fs.readdirSync(raw).filter((f) => f.endsWith('.html')).sort();
if (!files.length) {
  console.error(`no artifacts in ${rel(raw)} — nothing to check.`);
  process.exit(1);
}

/* Anything with a scheme, a fragment or a protocol-relative host is somebody
   else's problem; this check is about what has to be beside the file. */
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const REF = /(?:src|href)="([^"]+)"|url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/g;

const broken = [];
let checked = 0;

for (const file of files) {
  const full = path.join(raw, file);
  const src = fs.readFileSync(full, 'utf8');
  for (const m of src.matchAll(REF)) {
    const target = m[1] ?? m[2] ?? m[3] ?? m[4];
    if (!target || EXTERNAL.test(target)) continue;
    checked += 1;
    const clean = target.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!fs.existsSync(path.resolve(path.dirname(full), clean))) {
      broken.push(`  ${file} → ${target}`);
    }
  }
}

if (broken.length) {
  console.error(
    `${broken.length} unresolved reference(s) in the deliverables:\n` +
      broken.join('\n') +
      '\n\nThese files are handed to clients as they are. A reference that does' +
      '\nnot resolve here is a broken wordmark or an unstyled document in' +
      '\nsomebody’s inbox, and the wrapper pages cannot see it: an <iframe>' +
      '\nreports nothing about what happens inside it.',
  );
  process.exit(1);
}

console.log(
  `${files.length} deliverable(s) intact — ${checked} relative reference(s) resolve ` +
    `(${files.map((f) => f.replace('.html', '')).join(', ')}).`,
);
