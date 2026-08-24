/**
 * The specifiers codecave.pro writes that cannot survive into dist/, and what
 * they become on the way in.
 *
 * They are all the same problem: a capture names a file this package ALREADY
 * SHIPS, but spells it in a form that only resolves from outside the package.
 * Copied verbatim, each produces a tarball that looks complete and breaks in a
 * consumer's build.
 *
 * There are two kinds.
 *
 *   THE SITE'S PATH ALIASES — `@assets/icons/shevron.vue`, `@helpers/paths.ts`,
 *   `@lib/crm/types.ts` and the rest. These are tsconfig `paths` entries in
 *   THAT repo (CCWEB2-354, later one per top-level directory under src/). This
 *   package ships no tsconfig and a consumer has never heard of them, so an
 *   alias can neither survive nor be mistaken for an npm package — and before
 *   CCWEB2-355 `@helpers` was quietly both: the walk followed only `./`-shaped
 *   specifiers, so every helper would have dropped out of the package the
 *   moment the captures were resynced, while assertPeersDeclared read
 *   `@helpers/paths.ts` as a scoped package nothing declares.
 *
 *   THE PACKAGE'S OWN NAME — `@codecavepro/brand/components/common/Button.vue`.
 *   The site installs this package, so a component that renders a Button
 *   imports it by name; copy that in and the package imports itself. Node would
 *   even RESOLVE it — a package with an `exports` map can self-reference —
 *   which is what makes it dangerous rather than merely wrong: it would work
 *   here, work in a consumer that installed a matching version, and demand
 *   @codecavepro/brand as its own peerDependency. assertNoSelfImport() in
 *   build.mjs refuses that outright.
 *
 * This module is the single place that knows any of it. It has two readers with
 * no other code in common — the package build, which rewrites captures on their
 * way into dist/, and the storybook build, which compares the package's copy of
 * a component against the capture it came from and so needs the same answer. A
 * second copy of the arithmetic in either of them would be a second thing to
 * keep in step, which is the trap the aliases themselves sprang.
 *
 * ADDING ONE IS NOT ROUTINE, even though the table below makes it look it. The
 * bar every rewritable entry clears: the alias must name a directory the
 * package SHIPS, so the rewrite is pure path arithmetic with no judgement in
 * it, and assertDistResolves() can prove the result by asking dist/ rather than
 * by trusting this file. `@layouts` and `@styles` are in the table precisely
 * because they do NOT clear it.
 */

import path from 'node:path';

export const HELPERS_ALIAS = '@helpers/';
export const SELF_NAME = '@codecavepro/brand/';

/**
 * Every path alias codecave.pro declares, and where it lands in the SHIPPED
 * layout — or null for one that lands nowhere.
 *
 * The nulls are not omissions. An alias the site has but the package does not
 * ship has to be RECOGNISED, so that usesAlias() reports it and
 * assertDistResolves() names the file carrying it. Left out of this table
 * entirely, `@styles/global.css` in a shipped component would fall through as
 * an unrecognised bare specifier and be reported as an undeclared npm peer
 * named `@styles` — a real failure under a misleading name, which is exactly
 * how long this class of bug takes to find.
 *
 * src/styles/ and src/layouts/ are site-only on purpose: global.css imports
 * tailwindcss and this package's own tokens.css (see NOT_SHIPPED), and a layout
 * is an Astro page shell, which a design system has no business carrying.
 */
const SITE_ALIASES = {
  '@assets/': 'src/assets/',
  '@components/': 'src/components/',
  '@helpers/': 'src/helpers/',
  '@lib/': 'src/lib/',
  '@layouts/': null,
  '@styles/': null,
};

/* Which subpaths of the PACKAGE NAME map into dist/src/. Straight from the
 * exports map in package.json: "./components/*" -> "./dist/src/components/*",
 * and the same for assets, helpers and lib. Anything else the package exports
 * — tokens.css, theme.css, the root entry — is NOT under src/, so it is left
 * alone deliberately: a wrong path here would resolve to nothing quietly,
 * whereas an unrewritten self-import trips assertNoSelfImport() by name. */
const SELF_SUBPATHS = ['components', 'assets', 'helpers', 'lib'];

/**
 * Whether a specifier is an alias at all — including one this package does not
 * ship, where aliasTarget() answers null.
 *
 * The two are different questions and conflating them produced a true failure
 * under a false name. A shipped component importing `@styles/global.css` has
 * aliasTarget() null, so a check that skipped only "things with a target"
 * carried it through to assertPeersDeclared(), which reported `@styles/
 * global.css is imported but not a peerDependency` — sending the reader to
 * package.json to declare an npm package called @styles that does not exist.
 * The real fault is that the file reaches out of the package, which is
 * assertDistResolves()'s sentence to pass.
 */
export const isAlias = (spec) =>
  SITE_ALIAS_PREFIXES.some((p) => spec.startsWith(p)) || spec.startsWith(SELF_NAME);

/** What an aliased specifier names in the SHIPPED layout, or null. */
export const aliasTarget = (spec) => {
  for (const [alias, base] of Object.entries(SITE_ALIASES)) {
    if (spec.startsWith(alias)) {
      return base === null ? null : base + spec.slice(alias.length);
    }
  }
  if (spec.startsWith(SELF_NAME)) {
    const rest = spec.slice(SELF_NAME.length);
    return SELF_SUBPATHS.includes(rest.split('/')[0]) ? `src/${rest}` : null;
  }
  return null;
};

/** Every site alias prefix, for a resolver that needs to match on them. */
export const SITE_ALIAS_PREFIXES = Object.keys(SITE_ALIASES);

/**
 * Where an alias points inside CODECAVE.PRO's own src/ — not the shipped
 * layout. The storybook compiles captures against the site checkout, so it
 * needs this end of the mapping; aliasTarget() answers the other end. Both come
 * from the one table, which is the whole point of the table: a resolver that
 * knew only @helpers compiled every capture until one imported @assets, and
 * then failed with "could not resolve", naming the specifier but not the reason.
 */
export const sitePath = (spec) => {
  for (const alias of SITE_ALIAS_PREFIXES) {
    if (spec.startsWith(alias)) {
      return `${alias.slice(1, -1)}/${spec.slice(alias.length)}`;
    }
  }
  return null;
};

const escapeForRegExp = (s) => s.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * The site's alias prefixes as a regex alternation, already escaped.
 *
 * Exported because build-storybook.mjs needs the same alternation for its
 * esbuild resolver, and the one time it built its own the escape function came
 * out as a no-op — `'\$&'` is `$&` in a JS string, so every "escaped" character
 * was replaced by itself. It happened to work, because the only special
 * character in any prefix is `/` and a RegExp constructor does not need that
 * escaped. A silently-inert escape that works by luck is worse than none.
 */
export const SITE_ALIAS_PATTERN = SITE_ALIAS_PREFIXES.map(escapeForRegExp).join('|');

/* Every prefix this module knows, as an alternation. Built from the table
 * rather than spelled out again, so "would the rewrite change this?" and "does
 * this use an alias?" can never disagree about which prefixes exist. */
const PREFIX_GROUP = [...Object.keys(SITE_ALIASES), SELF_NAME]
  .map(escapeForRegExp)
  .join('|');

const ALIASED_SPECIFIER = new RegExp(`(["'])(?:${PREFIX_GROUP})[^"']+\\1`);

/**
 * Whether a source text uses an alias IN A SPECIFIER.
 *
 * Not a substring test, which is what this was. `src.includes('@helpers/')`
 * also matches the name written in a sentence — and a component comment
 * explaining where a map had moved to was enough to report the built file as
 * carrying an unrewritten alias. The build failed on its own documentation.
 * The same shape of mistake as a Tailwind utility named in prose.
 */
export const usesAlias = (src) => ALIASED_SPECIFIER.test(src);

/**
 * Rewrite aliased specifiers to a path a consumer can follow — relative to the
 * importing file's own place in the shipped layout. Pure path arithmetic, so
 * for @helpers it reproduced the relative form the captures had before the
 * alias existed, byte for byte; that is what made that change provably a no-op
 * for the package.
 *
 * An alias with no shipped target is left EXACTLY as written, so
 * assertDistResolves() reports the file rather than this silently emitting a
 * path into a directory the tarball does not contain.
 *
 * Deliberately narrow: a quoted specifier and nothing else. A url() inside a
 * <style> block is not rewritten, and codecave.pro does not alias one — its
 * tsconfig says why, and Checkbox.vue's tick is the reason (CCWEB2-370).
 * Anything spelled another way is left alone, and the callers assert on the
 * built output rather than trusting this to have caught everything.
 */
export function unalias(src, shipped) {
  const from = path.posix.dirname(shipped);
  return src.replace(
    new RegExp(`(["'])(${PREFIX_GROUP})([^"']+)\\1`, 'g'),
    (whole, quote, prefix, rest) => {
      const target = aliasTarget(prefix + rest);
      if (!target) return whole;
      const rel = path.posix.relative(from, target);
      return quote + (rel.startsWith('.') ? rel : `./${rel}`) + quote;
    },
  );
}
