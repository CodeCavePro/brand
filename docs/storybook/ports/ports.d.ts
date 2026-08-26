/**
 * The storybook's ports.
 *
 * A component sometimes reaches outside itself — for an HTML sanitiser. The
 * storybook is a static docs site with no server, so it cannot always satisfy
 * those imports the way production does. The dependency is inverted rather than
 * faked: each interface here declares the narrow thing a component actually
 * needs, and an adapter beside it supplies an implementation that works in a
 * docs page.
 *
 * A CMS used to be the other case, and is deliberately no longer one. Where the
 * environment can be substituted, a port belongs here; where the component was
 * reaching for one company's DATA — a CMS host, a CRM's field names — the fix
 * is not a port at all but a prop, so that the site supplies it and the
 * component never knows. lib/crm/types.ts is that boundary for forms, and
 * resolveImage() is it for images. Neither has an adapter here, because
 * neither is a port.
 *
 * "Works in a docs page" is not a licence to do less. An adapter substitutes the
 * environment, never the behaviour — SanitizerPort really sanitises, using the
 * same engine the site does. Where one genuinely cannot reproduce production,
 * the specimen has to say so on its face rather than in a comment nobody
 * reading the page will see.
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
 * Wiring lives in one place — the PORTS table in tools/build-storybook.mjs —
 * and every build prints which ports a specimen actually reached for. A port
 * nothing imports still typechecks, so the build log is where an orphan shows.
 */

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
