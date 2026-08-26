/* Prove docs/storybook/tw-bridge.css is in step with the component sources.
 *
 *   node docs/tools/check-tw-bridge.mjs
 *
 * Exit 0 when the digest recorded in the generated header matches the sources
 * on disk; exit 1, loudly, when it does not.
 *
 * Why this exists: tw-bridge.css is generated, but build-storybook.mjs needs
 * the codecave.pro checkout's node_modules to run, so it cannot run in every
 * environment — which meant nothing anywhere verified the two were in step. A
 * stale bridge does not announce itself. It compiles, it loads, and the
 * specimens go on rendering an earlier version of the sources beside them.
 *
 * WHAT THIS DOES NOT ASK. Both inputs are in this repository: a digest written
 * into tw-bridge.css, and the bytes under the two roots. codecave.pro is not
 * one of them, and nothing here compares the two repositories any more —
 * check-captures.mjs was deleted on 2026-08-25. The message used to say a stale
 * bridge meant "an older SITE", which was fair while every file under
 * every component here was a capture of one, and stopped being fair when the
 * direction of truth flipped: components are developed here now and the site
 * installs them, pinned, so it is SUPPOSED to be behind between releases.
 *
 * This check needs nothing but node, so it runs in CI, in a hook, or by hand.
 * The one thing that reaches for git — naming which files moved — is
 * best-effort and never changes the verdict.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sourceDigest, recordedDigest } from './source-digest.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const bridge = path.join(docs, 'storybook', 'tw-bridge.css');
/* Both roots, in the same order build-storybook.mjs writes the digest in.
 * A component moving between them changes no bytes, so a digest over one
 * root alone would not notice the move at all. */
const srcRoot = path.resolve(docs, '..', 'src');
const roots = [path.join(srcRoot, 'components'), path.join(srcRoot, 'captured')];
const SRC_LABEL = 'src/components/ and src/captured/';

if (!fs.existsSync(bridge)) {
  console.error(`missing ${path.relative(process.cwd(), bridge)}`);
  process.exit(1);
}

/* A runnable line, not a usage synopsis. `[path-to-codecave.pro]` was neither:
 * pasted verbatim it resolves to a literal directory named after the
 * placeholder and exits 1, and the brackets hid that the argument is genuinely
 * optional when the checkout sits beside this repo, which is the documented
 * layout. */
const REGENERATE =
  'Regenerate the storybook:\n' +
  '  node docs/tools/build-storybook.mjs\n' +
  '\n' +
  'It needs a codecave.pro checkout for its TOOLCHAIN — vue/compiler-sfc,\n' +
  'esbuild and tailwindcss at the versions the site builds with, which is the\n' +
  'whole point of compiling there rather than here. It looks beside this repo;\n' +
  'pass a path if yours is somewhere else.';

/**
 * Which files moved since the bridge was last written. The digest is over the
 * whole directory and cannot name anything on its own, so this asks git.
 *
 * Best-effort by construction: this check is documented as needing nothing but
 * node so that it runs in CI, in a hook and by hand, and that property is worth
 * more than the file list. Anything git cannot answer degrades to a sentence.
 */
const LOG_HINT =
  'Run `git log -- src/components/ src/captured/` to see what moved.';

function changedSince(bridgePath, srcDirs) {
  try {
    const at = (args) =>
      execFileSync('git', args, { cwd: docs, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const commit = at(['log', '-1', '--format=%H', '--', bridgePath]);
    if (!commit) return LOG_HINT;
    /* To the WORKING TREE, not to HEAD: an uncommitted capture edit is the
       common case when someone is mid-change, and is exactly what they need
       named. */
    const files = at(['diff', '--name-only', commit, '--', ...srcDirs]).split('\n').filter(Boolean);
    const subject = at(['log', '-1', '--format=%h %s', commit]);
    if (!files.length) {
      return `tw-bridge.css was last written in ${subject}, and git reports no\n` +
             `change under ${SRC_LABEL} since. If that is a surprise, the digest is\n` +
             'over BYTES ON DISK — an untracked or ignored file in there counts too.';
    }
    return `Changed since tw-bridge.css was last written (${subject}):\n` +
           files.map((f) => `  ${f}`).join('\n');
  } catch {
    return LOG_HINT;
  }
}

const recorded = recordedDigest(bridge);
const actual = sourceDigest(roots);

if (recorded === null) {
  console.error('tw-bridge.css records no source-digest — it predates the check.');
  console.error(`\n${REGENERATE}`);
  process.exit(1);
}

if (recorded !== actual) {
  console.error(
    `tw-bridge.css is STALE — ${SRC_LABEL} changed since it was generated.\n` +
    `  recorded: ${recorded}\n` +
    `  actual:   ${actual}\n` +
    'The compiled storybook is behind the sources: the bundles and the\n' +
    'bridge were built from an earlier state of those files.\n' +
    '\n' +
    'This says NOTHING about codecave.pro, and nothing here does: components are\n' +
    'developed in this repository and the site installs them at a pinned version,\n' +
    'so it is meant to be behind between releases.');

  console.error(`
${changedSince(bridge, roots)}`);

  /* Before sending anyone to the generator, rule out the one failure the
   * generator cannot fix. A digest is over bytes on disk, so a CRLF checkout
   * and an LF checkout of the SAME commit disagree — and regenerating on the
   * odd machine just records its own convention and fails again on the other
   * one. That loop cost 36 consecutive Pages deploys on 2026-08-20/21, every
   * one of them green locally. Say so here rather than in a comment nobody
   * reads while a run is red. */
  const asLf = sourceDigest(roots, { eol: 'lf' });
  const asCrlf = sourceDigest(roots, { eol: 'crlf' });
  if (recorded === asLf || recorded === asCrlf) {
    const theirs = recorded === asCrlf ? 'CRLF' : 'LF';
    const ours = actual === asCrlf ? 'CRLF' : 'LF';
    console.error(
      `\nThis is a LINE-ENDING difference, not a content change: the sources are\n` +
      `byte-identical once endings are normalised. tw-bridge.css was generated\n` +
      `against a ${theirs} checkout and this one is ${ours}.\n` +
      `Regenerating will NOT fix it — it will record ${ours} and fail on ${theirs}.\n` +
      `Fix the checkout instead: .gitattributes pins every text file to LF, so\n` +
      `either it is missing or this tree predates it. To renormalise in place:\n` +
      `  git rm -r --cached . && git reset --hard`);
    process.exit(1);
  }

  console.error(`\n${REGENERATE}`);
  process.exit(1);
}

console.log(`tw-bridge.css matches ${SRC_LABEL} (sha256:${actual.slice(0, 12)}…)`);
