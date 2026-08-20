/**
 * SanitizerPort for the static docs build — the real thing, not a pass-through.
 *
 * `project/pain-points-item.vue` imports `sanitize` from `isomorphic-dompurify`
 * and wraps it around `marked.parse()`. This adapter satisfies that import with
 * plain `dompurify`, which is the same engine: isomorphic-dompurify is a thin
 * environment shim that pairs DOMPurify with jsdom so the call also works during
 * SSR. A storybook page is only ever a browser, where the shim's own browser
 * branch is exactly this — so bundling jsdom to reach it would add a Node DOM
 * implementation to a docs page in order to arrive at the code already running.
 *
 * The version is pinned to `dompurify@3.4.13` — not the newest patch, but the
 * one `codecave.pro/pnpm-lock.yaml` actually resolves for
 * `isomorphic-dompurify@3.22.0`. A specimen sanitising with a different engine
 * version than production is a specimen quietly making its own claim, so
 * `build-storybook.mjs` reads the site's resolved version and refuses to build
 * if this pin has drifted from it. It said "bump the two together" here for
 * about a day, during which the pin was already a patch ahead of production —
 * which is the argument for asserting it rather than asking.
 *
 * Default configuration on purpose. The site passes no options either, and a
 * stricter policy here would make the specimen show markup production would
 * have kept — the specimen would be wrong in the safe direction, which is still
 * wrong.
 *
 * This used to be `(html) => html`, on the argument that every specimen's
 * markdown is a literal in the page beside it. That was true and is still true,
 * and it was the wrong shape anyway: it made this page the one place in the
 * storybook where the component on screen was not the component in production,
 * silently, in the one behaviour anybody visits this page to check.
 */

import type { SanitizerPort } from './ports';
import DOMPurify from 'dompurify';

const adapter: SanitizerPort = {
  // Wrapped rather than passed by reference: DOMPurify.sanitize is a method on
  // an instance bound to `window`, and handing the bare function to a caller
  // that invokes it unbound loses that receiver.
  sanitize: (html) => DOMPurify.sanitize(html),
};

// Destructured so the named export matches what the component imports, while
// the object above is what gets typechecked against the interface.
export const { sanitize } = adapter;

export default adapter;
