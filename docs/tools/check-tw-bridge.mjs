/* Prove docs/storybook/tw-bridge.css is in step with docs/source_examples/.
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
 * storybook goes on documenting an older site than the sources beside it.
 *
 * This check needs nothing but node, so it runs in CI, in a hook, or by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceDigest, recordedDigest } from './source-digest.mjs';

const docs = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bridge = path.join(docs, 'storybook', 'tw-bridge.css');
const src = path.join(docs, 'source_examples');

if (!fs.existsSync(bridge)) {
  console.error(`missing ${path.relative(process.cwd(), bridge)}`);
  process.exit(1);
}

const recorded = recordedDigest(bridge);
const actual = sourceDigest(src);

if (recorded === null) {
  console.error(
    'tw-bridge.css records no source-digest — it predates the check.\n' +
    'Regenerate it:  node docs/tools/build-storybook.mjs [path-to-codecave.pro]');
  process.exit(1);
}

if (recorded !== actual) {
  console.error(
    'tw-bridge.css is STALE — source_examples/ has changed since it was generated.\n' +
    `  recorded: ${recorded}\n` +
    `  actual:   ${actual}\n` +
    'The storybook is documenting an older site than the sources beside it.\n' +
    'Regenerate:  node docs/tools/build-storybook.mjs [path-to-codecave.pro]');
  process.exit(1);
}

console.log(`tw-bridge.css matches source_examples/ (sha256:${actual.slice(0, 12)}…)`);
