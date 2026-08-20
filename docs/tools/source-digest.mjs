/* Hash of everything under docs/source_examples/.
 *
 * tw-bridge.css and storybook/compiled/*.js are DERIVED from that directory,
 * and nothing about a stale derivation looks wrong: it compiles, it loads, and
 * it silently documents an older site than the sources sitting beside it. The
 * generator records this digest in the tw-bridge.css header so a checker can
 * prove the two are in step.
 *
 * Deliberately dependency-free — node's own crypto and fs, nothing else. The
 * generator needs the codecave.pro checkout's node_modules (vue/compiler-sfc,
 * esbuild, tailwindcss) and so cannot run everywhere; the CHECK has to run
 * anywhere, or it will not be run at all.
 *
 * Path names are folded in as well as contents, so renaming a file or adding
 * an empty one moves the digest.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const DIGEST_PREFIX = ' * source-digest: sha256:';

export function sourceDigest(dir) {
  const h = crypto.createHash('sha256');
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      h.update(path.relative(dir, p).split(path.sep).join('/'));
      h.update('\0');
      h.update(fs.readFileSync(p));
      h.update('\0');
    }
  };
  walk(dir);
  return h.digest('hex');
}

/** Pull the digest the generator recorded, or null if the file predates it. */
export function recordedDigest(cssPath) {
  const head = fs.readFileSync(cssPath, 'utf8').slice(0, 2048);
  return head.match(/^ \* source-digest: sha256:([0-9a-f]{64})$/m)?.[1] ?? null;
}
