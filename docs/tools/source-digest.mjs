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
 *
 * THE DIGEST IS OVER BYTES ON DISK, AND THAT MAKES LINE ENDINGS CONTENT.
 * The same commit checked out with CRLF and with LF hashes to two different
 * values, so the check can only pass on machines that agree — which is what
 * `.gitattributes` is for, and why it is not optional here. The `eol` option
 * below exists so a failing check can tell that story instead of blaming the
 * sources; see docs/tools/check-tw-bridge.mjs.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const DIGEST_PREFIX = ' * source-digest: sha256:';

/**
 * @param {string} dir
 * @param {{eol?: 'asis' | 'lf' | 'crlf'}} [opts]
 *   'asis' — hash the bytes as they are. The only mode anything asserts on.
 *   'lf' / 'crlf' — hash as if every text file used that ending. Diagnostic
 *   only: it answers "is this a real change, or just a checkout convention?"
 */
export function sourceDigest(dir, { eol = 'asis' } = {}) {
  const h = crypto.createHash('sha256');
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      h.update(path.relative(dir, p).split(path.sep).join('/'));
      h.update('\0');
      h.update(reend(fs.readFileSync(p), eol));
      h.update('\0');
    }
  };
  walk(dir);
  return h.digest('hex');
}

/* latin1 round-trips arbitrary bytes through a string unchanged, so this is
 * safe on anything that reaches it. Files containing a NUL are left alone —
 * git's own binary heuristic, and the reason a stray .png cannot corrupt a
 * diagnostic digest. */
function reend(buf, eol) {
  if (eol === 'asis' || buf.includes(0)) return buf;
  const lf = buf.toString('latin1').replace(/\r\n/g, '\n');
  return Buffer.from(eol === 'crlf' ? lf.replace(/\n/g, '\r\n') : lf, 'latin1');
}

/** Pull the digest the generator recorded, or null if the file predates it. */
export function recordedDigest(cssPath) {
  const head = fs.readFileSync(cssPath, 'utf8').slice(0, 2048);
  return head.match(/^ \* source-digest: sha256:([0-9a-f]{64})$/m)?.[1] ?? null;
}
