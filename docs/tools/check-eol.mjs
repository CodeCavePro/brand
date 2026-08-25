/* Fail on a CRLF working tree, and say that is what it is.
 *
 *   node docs/tools/check-eol.mjs
 *
 * .gitattributes pins `* text=auto eol=lf` and explains at length why: three
 * things here are digests or byte-for-byte copies of files in docs/, and all
 * three read the WORKING TREE rather than the git blob. A CRLF checkout and an
 * LF checkout of the same commit disagree on every one of them. That is not
 * hypothetical -- it broke the Pages deploy 36 consecutive times across
 * 2026-08-20 and 21, green locally every time.
 *
 * So why a check, when the attributes file already prevents it? Because the
 * attributes file governs CHECKOUT, and nothing governs what a tool writes
 * afterwards. An editor or a script that emits platform-native line endings
 * puts a file back to CRLF and neither git nor the build says so in those
 * words: the digest check reports "regenerate the storybook" (which on Windows
 * re-records the CRLF digest and fails again -- the exact 36-run loop), and the
 * package check reported "drifted: X differs from Y", which sends the reader
 * looking for a content difference that is not there. Both are true statements
 * about a consequence. This one names the cause.
 *
 * Tracked files only, and binaries excluded by extension -- the same four
 * .gitattributes names rather than a heuristic, since a .woff2 full of 0x0D0A
 * is just a font.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const BINARY = /\.(png|ico|woff|woff2)$/i;

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && !BINARY.test(f) && fs.existsSync(f) && fs.statSync(f).isFile());

const crlf = tracked.filter((f) => fs.readFileSync(f).includes('\r\n'));

if (crlf.length) {
  console.error(`${crlf.length} tracked file(s) carry CRLF; this repository is eol=lf:`);
  for (const f of crlf) console.error(`  ${f}`);
  console.error('');
  console.error('Line endings are CONTENT here — tw-bridge.css digests the working tree,');
  console.error('and packages/brand asserts byte-identity against it. See .gitattributes.');
  console.error('');
  console.error('Renormalise, then regenerate whatever reads the tree:');
  console.error('  git add --renormalize . && git checkout -- .');
  console.error('  npm run build && node docs/tools/build-storybook.mjs');
  process.exit(1);
}

console.log(`${tracked.length} tracked text file(s) are LF.`);
