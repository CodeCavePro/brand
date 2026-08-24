/* Prove the findings counts quoted as prose match the story pages.
 *
 *   node docs/tools/check-findings.mjs
 *
 * Three files tell the reader how much the storybook found — docs/README.md,
 * docs/pages/storybook/index.astro and docs/pages/index.astro — and none of
 * them is derived from anything. They are three hand-typed copies of one fact
 * that changes every time a story page gains or loses a note.
 *
 * They have already drifted. PainPointsItem's XSS note was marked fixed
 * upstream and lost its `is-warn`, which moves a finding from the defect
 * column to the observation column without changing the total; the split
 * stayed at 30/25 in one place while the pages said 29/26, and nothing
 * noticed until someone recounted by hand.
 *
 * The pages are the source: a finding is an element carrying `sb-note` that
 * appears after the page's `<h2>Findings</h2>`, `is-warn` marking the ones
 * flagged as defects. Notes above that heading are page furniture — the
 * project-chip story opens with one explaining why it is the static specimen —
 * so the heading, not the file, is where counting starts.
 *
 * The claim patterns below are deliberately literal. Rewording one of those
 * sentences fails this check rather than silently exempting the file from it,
 * which is the same reason packages/brand checks its peer list both ways: a
 * check that has quietly stopped covering anything reads exactly like a check
 * that passes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stories = path.join(docs, 'pages', 'storybook');
const rel = (p) => path.relative(process.cwd(), p);

/* ---- count what the story pages carry ----------------------------------- */
const HEADING = '<h2>Findings</h2>';
const pages = fs.readdirSync(stories)
  .filter((f) => f.endsWith('.astro') && f !== 'index.astro')
  .sort();

if (!pages.length) {
  console.error(`no story pages in ${rel(stories)} — nothing to count.`);
  process.exit(1);
}

let defects = 0;
let observations = 0;
const headless = [];

for (const file of pages) {
  const src = fs.readFileSync(path.join(stories, file), 'utf8');
  const at = src.indexOf(HEADING);
  if (at === -1) { headless.push(file); continue; }
  const section = src.slice(at + HEADING.length);
  defects += (section.match(/class="sb-note is-warn"/g) ?? []).length;
  observations += (section.match(/class="sb-note"/g) ?? []).length;
}

if (headless.length) {
  console.error(
    `${headless.length} story page(s) with no ${HEADING} to count from:\n` +
    headless.map((f) => `  ${f}`).join('\n') +
    '\nEvery story page records what the extraction found. A page without the' +
    '\nheading contributes nothing here and would shrink the totals silently.');
  process.exit(1);
}

const total = defects + observations;

/* ---- what the prose claims ---------------------------------------------- */
/* Whitespace is collapsed first: all three sentences wrap mid-number-list. */
const CLAIMS = [
  {
    file: path.join(docs, 'README.md'),
    pattern: /\*\*(\d+) findings are recorded — (\d+) flagged as defects, (\d+) as design observations\.\*\*/,
    reads: ['total', 'defects', 'observations'],
  },
  {
    file: path.join(stories, 'index.astro'),
    pattern: /(\d+) findings across the thirteen components — (\d+) flagged as defects, (\d+) as design observations/,
    reads: ['total', 'defects', 'observations'],
  },
  {
    file: path.join(docs, 'pages', 'index.astro'),
    pattern: /(\d+) findings, (\d+) of them defects/,
    reads: ['total', 'defects'],
  },
];

const expected = { total, defects, observations };
const problems = [];

for (const claim of CLAIMS) {
  const flat = fs.readFileSync(claim.file, 'utf8').replace(/\s+/g, ' ');
  const found = [...flat.matchAll(new RegExp(claim.pattern, 'g'))];

  if (found.length !== 1) {
    problems.push(
      `${rel(claim.file)} — ${found.length === 0 ? 'no' : `${found.length}`} sentence(s) match ` +
      `the pattern this check looks for.\n    ${claim.pattern}\n  ` +
      (found.length === 0
        ? 'The sentence was reworded or removed. Fix the pattern in this file so\n  ' +
          'the claim stays covered, or drop the entry if the claim is really gone.'
        : 'Two copies of the same claim in one file drift independently. Keep one.'));
    continue;
  }

  claim.reads.forEach((name, i) => {
    const said = Number(found[0][i + 1]);
    if (said !== expected[name]) {
      problems.push(`${rel(claim.file)} — says ${said} ${name}, the story pages carry ${expected[name]}.`);
    }
  });
}

if (problems.length) {
  console.error(
    `${problems.length} findings-count problem(s):\n` +
    problems.map((p) => `  ${p}`).join('\n') +
    `\n\nCounted from ${pages.length} story pages: ${total} findings, ` +
    `${defects} defects, ${observations} design observations.`);
  process.exit(1);
}

console.log(
  `findings counts agree: ${total} across ${pages.length} story pages — ` +
  `${defects} defects, ${observations} design observations — quoted in ` +
  `${CLAIMS.length} places and matching in all of them.`);
