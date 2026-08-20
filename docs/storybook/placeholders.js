/* ===========================================================================
 * placeholders.js — swap CMS-hosted media for local stand-ins after mount.
 *
 * getImageUrl() prefixes every media path with the Strapi host
 * (ports/strapi.adapter.ts), so an image a captured component asks for lives on
 * a CMS this page cannot read. StrapiPort can supply the base URL but not the
 * private token behind it, so this is the one place a specimen genuinely cannot
 * reproduce production: the request is real, the response is not ours to get.
 * Every page therefore points those <img>s at docs/assets/images/ after mount.
 * Everything else about the element — classes, sizing, object-fit, alt wiring —
 * stays the component's own.
 *
 * Why this is a module and not four copies of `img.src = …`:
 *
 * `common/images/LazyImage.vue` renders <img :data-src> with NO src, and an
 * IntersectionObserver copies data-src onto src when the image nears the
 * viewport. Setting .src on one of those works for exactly as long as it takes
 * the observer to fire, and then the component overwrites it with the CMS URL
 * again. That is not hypothetical: the 2026-08-20 resync introduced LazyImage
 * into Review.vue and pain-points-item.vue, and the swap on three pages had
 * been silently losing the race ever since — the specimens were quietly
 * requesting strapi.azure.codecave.network and rendering broken images.
 *
 * So: write data-src where it exists and let LazyImage do the copying, which
 * also means the specimen demonstrates the lazy path instead of stepping around
 * it. Write src where it does not. Callers should not have to know which
 * components are lazy today — that is the whole point of putting it here.
 * ======================================================================== */

/**
 * @param {string|Iterable<Element>} target  selector, or a list of <img>s
 * @param {string} url                       page-relative placeholder URL
 * @param {(img: Element) => boolean} [skip] optional per-image opt-out
 */
export function usePlaceholders(target, url, skip) {
  const imgs = typeof target === 'string'
    ? document.querySelectorAll(target)
    : target;

  for (const img of imgs) {
    if (skip && skip(img)) continue;

    if (img.hasAttribute('data-src')) {
      // LazyImage reads this on intersection. Set src too, so the element is
      // never briefly srcless if the observer has already run.
      img.setAttribute('data-src', url);
    }
    img.src = url;
  }
}
