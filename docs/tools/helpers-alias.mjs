/**
 * The site's @helpers alias, and how it leaves.
 *
 * codecave.pro imports its helpers as `@helpers/paths.ts` (CCWEB2-354). That
 * alias is a tsconfig `paths` entry in THAT repo — this package does not ship a
 * tsconfig, and a consumer installing @codecavepro/brand has never heard of it.
 * So the alias can neither survive into dist/ nor be mistaken for an npm
 * package, and before CCWEB2-355 it was quietly both.
 *
 * This module is the single place that knows the rule. It has two readers with
 * no other code in common — the package build, which rewrites captures on their
 * way into dist/, and the storybook build, which compares the package's copy of
 * a component against the capture it came from. A second copy of the rewrite in
 * either of them would be a second thing to keep in step, which is the same
 * trap the alias itself sprang.
 */

import path from 'node:path';

export const HELPERS_ALIAS = '@helpers/';

/** What an @helpers specifier names in the SHIPPED layout, or null. */
export const aliasTarget = (spec) =>
  spec.startsWith(HELPERS_ALIAS) ? `src/helpers/${spec.slice(HELPERS_ALIAS.length)}` : null;

/** Whether a source text uses the alias at all. */
export const usesAlias = (src) => src.includes(HELPERS_ALIAS);

/**
 * Rewrite @helpers specifiers to a path a consumer can follow — relative to the
 * importing file's own place in the shipped layout. Pure path arithmetic, so it
 * reproduces the relative form the captures had before the alias existed, byte
 * for byte; that is what makes the change provably a no-op for the package.
 *
 * Deliberately narrow: `from "@helpers/x"` and nothing else. Anything spelled
 * another way is left alone, and the callers assert on the built output rather
 * than trusting this to have caught everything.
 */
export function unalias(src, shipped) {
  const from = path.posix.dirname(shipped);
  return src.replace(
    /(["'])@helpers\/([^"']+)\1/g,
    (_m, quote, rest) => {
      const rel = path.posix.relative(from, `src/helpers/${rest}`);
      return quote + (rel.startsWith('.') ? rel : `./${rel}`) + quote;
    },
  );
}
