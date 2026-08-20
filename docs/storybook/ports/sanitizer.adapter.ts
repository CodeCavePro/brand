/**
 * SanitizerPort for the static docs build.
 *
 * Stands in for `isomorphic-dompurify`, which `project/pain-points-item.vue`
 * wraps around `marked.parse()`. That is the right call on the site, where the
 * markdown comes from the CMS and is therefore untrusted. It is ~300K of
 * sanitiser here, deciding that a paragraph written twenty lines up in
 * `pain-points-item.html` is still a paragraph.
 *
 * IDENTITY IS SAFE HERE AND NOWHERE ELSE. Every specimen's markdown is a
 * literal in the page that renders it, authored in this repository and served
 * from a static host with no user input anywhere in the path. The moment a
 * specimen renders markdown it did not author — anything fetched, anything
 * typed into the page — this adapter becomes a hole and the real library has to
 * be bundled instead.
 */

import type { SanitizerPort } from './ports';

const adapter: SanitizerPort = {
  sanitize: (html) => html,
};

export const { sanitize } = adapter;

export default adapter;
