/**
 * The storybook's ports.
 *
 * A captured component sometimes reaches outside itself — for a CMS base URL,
 * for an HTML sanitiser. The storybook is a static, buildless docs site; it has
 * no CMS token and no reason to ship a sanitiser to guard a hard-coded demo
 * string. So the dependency is inverted rather than faked: each interface here
 * declares the narrow thing a component actually needs, and an adapter beside
 * it supplies a second implementation for the docs build.
 *
 * That distinction is the point. A stub says "pretend this module is not
 * there", and nothing checks the pretence — it fails in a browser, at runtime,
 * as an undefined. A port says "here is the contract, and here is another
 * implementation of it", and `npm run check` typechecks every adapter against
 * its interface, so an adapter that drifts from what the component imports
 * fails the build instead.
 *
 * The bar for adding one is deliberately narrow: if swapping the
 * implementation would change what the specimen LOOKS LIKE, it is not a port.
 * It belongs in the bundle, compiled from the real source like everything else.
 *
 * Wiring lives in one place — the PORTS table in tools/build-storybook.mjs.
 */

/**
 * What `src/lib/strapi.ts` is to a component that only wants to build a media
 * URL. The production module also constructs a `StrapiClient` around a private
 * token; `helpers/image-url.ts` needs none of it, only the base.
 */
export interface StrapiPort {
  readonly strapiUrl: string;
}

/**
 * What `isomorphic-dompurify` is to a component rendering markdown. On the site
 * the input is CMS-authored and sanitising it is correct. In a specimen the
 * input is a literal in the page beside it.
 */
export interface SanitizerPort {
  sanitize(html: string): string;
}
