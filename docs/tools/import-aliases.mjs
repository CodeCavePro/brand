/**
 * The specifiers codecave.pro writes that cannot survive into dist/, and what
 * they become on the way in.
 *
 * There are two, and they are the same problem twice: a capture names a file
 * this package ALREADY SHIPS, but spells it in a form that only resolves from
 * outside the package. Copied verbatim, each produces a tarball that looks
 * complete and breaks in a consumer's build.
 *
 *   @helpers/paths.ts
 *     A tsconfig `paths` entry in THAT repo (CCWEB2-354). This package ships no
 *     tsconfig and a consumer has never heard of it, so the specifier can
 *     neither survive nor be mistaken for an npm package — and before
 *     CCWEB2-355 it was quietly both: the walk followed only `./`-shaped
 *     specifiers, so every helper would have dropped out of the package the
 *     moment the captures were resynced, while assertPeersDeclared read
 *     `@helpers/paths.ts` as a scoped package nothing declares.
 *
 *   @codecavepro/brand/components/common/Button.vue
 *     The package's own name. The site installs this package, so a component
 *     that renders a Button imports it by name; copy that in and the package
 *     imports itself. Node would even RESOLVE it — a package with an `exports`
 *     map can self-reference — which is what makes it dangerous rather than
 *     merely wrong: it would work here, work in a consumer that installed a
 *     matching version, and demand @codecavepro/brand as its own
 *     peerDependency. assertNoSelfImport() in build.mjs refuses that outright.
 *
 * This module is the single place that knows either rule. It has two readers
 * with no other code in common — the package build, which rewrites captures on
 * their way into dist/, and the storybook build, which compares the package's
 * copy of a component against the capture it came from and so needs the same
 * answer. A second copy of the arithmetic in either of them would be a second
 * thing to keep in step, which is the trap the aliases themselves sprang.
 *
 * ADDING A THIRD IS NOT ROUTINE. Each of these cost a silent failure to find.
 * The bar is the one both clear: the specifier must name a file the package
 * already ships, so the rewrite is pure path arithmetic with no judgement in
 * it, and assertDistResolves() can prove the result by asking dist/ rather than
 * by trusting this file.
 */

import path from 'node:path';

export const HELPERS_ALIAS = '@helpers/';
export const SELF_NAME = '@codecavepro/brand/';

/* Which subpaths of the package name map into dist/src/. Straight from the
 * exports map in package.json: "./components/*" -> "./dist/src/components/*",
 * and the same for assets, helpers and lib. Anything else the package exports
 * — tokens.css, theme.css, the root entry — is NOT under src/, so it is left
 * alone deliberately: a wrong path here would resolve to nothing quietly,
 * whereas an unrewritten self-import trips assertNoSelfImport() by name. */
const SELF_SUBPATHS = ['components', 'assets', 'helpers', 'lib'];

/** What an aliased specifier names in the SHIPPED layout, or null. */
export const aliasTarget = (spec) => {
  if (spec.startsWith(HELPERS_ALIAS)) {
    return `src/helpers/${spec.slice(HELPERS_ALIAS.length)}`;
  }
  if (spec.startsWith(SELF_NAME)) {
    const rest = spec.slice(SELF_NAME.length);
    return SELF_SUBPATHS.includes(rest.split('/')[0]) ? `src/${rest}` : null;
  }
  return null;
};

/**
 * A quoted specifier starting with either prefix. Deliberately the same shape
 * unalias() rewrites, so "would the rewrite change this?" and "does this use an
 * alias?" can never disagree.
 */
const ALIASED_SPECIFIER = /(["'])(@helpers\/|@codecavepro\/brand\/)[^"']+\1/;

/**
 * Whether a source text uses either alias IN A SPECIFIER.
 *
 * Not a substring test, which is what this was. `src.includes('@helpers/')`
 * also matches the name written in a sentence -- and a component comment
 * explaining where a map moved to was enough to report the built file as
 * carrying an unrewritten alias. The build failed on its own documentation.
 * The same shape of mistake as a Tailwind utility named in prose.
 */
export const usesAlias = (src) => ALIASED_SPECIFIER.test(src);

/**
 * Rewrite aliased specifiers to a path a consumer can follow — relative to the
 * importing file's own place in the shipped layout. Pure path arithmetic, so
 * for @helpers it reproduces the relative form the captures had before the
 * alias existed, byte for byte; that is what made the change provably a no-op
 * for the package.
 *
 * Deliberately narrow: a quoted specifier and nothing else. Anything spelled
 * another way is left alone, and the callers assert on the built output rather
 * than trusting this to have caught everything.
 */
export function unalias(src, shipped) {
  const from = path.posix.dirname(shipped);
  return src.replace(
    /(["'])(@helpers\/|@codecavepro\/brand\/)([^"']+)\1/g,
    (whole, quote, prefix, rest) => {
      const target = aliasTarget(prefix + rest);
      if (!target) return whole;
      const rel = path.posix.relative(from, target);
      return quote + (rel.startsWith('.') ? rel : `./${rel}`) + quote;
    },
  );
}
