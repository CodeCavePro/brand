/* ==========================================================================
 * Ask the Design-project upload map the two questions a staging directory used
 * to answer by accident.
 *
 * 1. Does every source file exist? A copy loop failed loudly on a missing file.
 *    A map does not: an entry naming a path nobody wrote is a plain object, and
 *    the failure arrives as a DesignSync upload error halfway through a push,
 *    with some of the project already replaced.
 *
 * 2. Does every reference a CARD makes resolve to something the push writes?
 *    This is the question nothing has ever asked, on either side, and it is the
 *    one that matters -- because the answer is currently NO. The cards mount
 *    `../../../compiled/Checkbox.js`, whose injected <style> reaches
 *    `url(../assets/images/checked-icon.svg)`. A relative url() in a <style>
 *    element resolves against the DOCUMENT, and the cards sit three levels
 *    deep, so it asks for components/Components/assets/…. The old copy step
 *    put it at components/assets/… and the remote has carried that unreachable
 *    path ever since: the tick 404s, the card still renders, and every check in
 *    both repositories stays green. Same shape as CCWEB2-370, one system over.
 *
 * A card is HTML, so its references are the browser's, resolved at request time
 * against the PROJECT tree -- never against anything on this disk. That is why
 * this check reads the map's `path` values and not its `localPath` values.
 * ====================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { projectFiles, repo, STALE } from './design-sync-map.mjs';

const files = projectFiles();
const declared = new Set(files.map((f) => f.path));
const problems = [];

/* ---- 1. every source exists, and no two entries disagree ----------------- */
for (const f of files) {
  if (!fs.existsSync(path.join(repo, ...f.localPath.split('/')))) {
    problems.push(`${f.path}\n    reads ${f.localPath}, which does not exist on disk`);
  }
}

for (const s of STALE) {
  if (declared.has(s)) {
    problems.push(`${s}\n    is in STALE (to be deleted) and in the map (to be written)`);
  }
}

/* ---- 2. every reference a card makes is a path the push writes ------------
 * Three resolvers reach into a card and they are all the browser's, so all
 * three resolve against the project. <link href>, the import map's values, and
 * a module specifier are handled the same way; a url() inside a bundle the card
 * mounts is handled against the CARD's directory, for the reason in the header.
 * Bare specifiers are skipped -- the import map is what answers those, and its
 * own values are checked here as references in their own right. */
const REFS = [
  /(?:href|src)\s*=\s*"([^"]+)"/g,
  /"(?:vue|gsap(?:\/[\w-]+)?)"\s*:\s*"([^"]+)"/g,
  /\bfrom\s+'([^']+)'/g,
];
const URLS = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^"')\s]+))\s*\)/g;

const resolveIn = (dir, spec) => path.posix.normalize(path.posix.join(dir, spec));

const onDisk = (f) => fs.existsSync(path.join(repo, ...f.localPath.split('/')));

/* Only cards that exist. A card whose source is missing was already reported by
   step 1, and reading it here would replace that sentence with an ENOENT stack
   -- the generated cards are gitignored, so a fresh checkout hits this first. */
for (const card of files.filter((f) => f.path.endsWith('.html') && onDisk(f))) {
  const dir = path.posix.dirname(card.path);
  const html = fs.readFileSync(path.join(repo, ...card.localPath.split('/')), 'utf8');

  const check = (spec, why) => {
    if (/^(data:|https?:|\/\/|#|mailto:)/.test(spec)) return;
    if (!spec.startsWith('.') && !spec.startsWith('/')) return; // bare — the import map answers it
    const target = resolveIn(dir, spec);
    if (!declared.has(target)) {
      problems.push(`${card.path}\n    ${why} ${spec}\n    -> ${target}, which the push does not write`);
    }
  };

  for (const re of REFS) for (const m of html.matchAll(re)) check(m[1], 'asks for');

  /* and what the bundles it mounts reach for, at the card's own depth */
  for (const m of html.matchAll(/\bfrom\s+'(\.[^']+\.js)'/g)) {
    const bundle = files.find((f) => f.path === resolveIn(dir, m[1]));
    if (!bundle) continue; // already reported above
    const js = fs.readFileSync(path.join(repo, ...bundle.localPath.split('/')), 'utf8');
    for (const u of js.matchAll(URLS)) {
      check(u[1] ?? u[2] ?? u[3], `mounts ${path.posix.basename(bundle.path)}, which reaches`);
    }
  }
}

if (problems.length) {
  console.error(
    `${problems.length} problem(s) in the Design-project upload map:\n\n  ` +
      problems.join('\n\n  ') +
      `\n\nEvery path above is resolved against the PROJECT tree, which is where a\n` +
      `card's references resolve at request time. A missing one renders as a 404\n` +
      `inside the Design System pane and nowhere else.`,
  );
  process.exit(1);
}

const cards = files.filter((f) => f.path.endsWith('.html')).length;
console.log(
  `design-sync map resolves: ${files.length} file(s) to upload, every source present; ` +
    `every reference from ${cards} card(s) lands on a path the push writes` +
    (STALE.length ? `; ${STALE.length} stale remote path(s) queued for deletion` : ''),
);
