/**
 * The storybook's ports.
 *
 * A captured component sometimes reaches outside itself — for a CMS base URL,
 * for an HTML sanitiser. The storybook is a static docs site with no CMS token
 * and no server, so it cannot always satisfy those imports the way production
 * does. The dependency is inverted rather than faked: each interface here
 * declares the narrow thing a component actually needs, and an adapter beside
 * it supplies an implementation that works in a docs page.
 *
 * "Works in a docs page" is not a licence to do less. An adapter substitutes the
 * environment, never the behaviour — SanitizerPort really sanitises, using the
 * same engine the site does. Where an adapter genuinely cannot reproduce
 * production (StrapiPort has no private token, so media URLs point at a host the
 * page cannot read), the specimen says so on its face rather than in a comment.
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
 * What `isomorphic-dompurify` is to a component rendering markdown: one function
 * that takes HTML and gives back HTML with the executable parts removed. The
 * site needs the isomorphic wrapper because it renders on a server too; a
 * storybook page is only ever a browser, so `sanitizer.adapter.ts` implements
 * this with the DOMPurify underneath and skips the jsdom half.
 *
 * Deliberately not typed as `string | Node` even though DOMPurify accepts both.
 * The interface is the surface the CAPTURED COMPONENT uses, not the surface the
 * library offers — narrow enough that any conforming sanitiser could sit here.
 */
export interface SanitizerPort {
  sanitize(html: string): string;
}
