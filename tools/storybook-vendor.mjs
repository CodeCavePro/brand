/**
 * Which vendored runtime each externalised specifier resolves to.
 *
 * build-storybook.mjs bundles a specimen with `external: ['vue','gsap','gsap/*']`,
 * so those three specifiers survive into the compiled output as bare imports.
 * A browser cannot resolve a bare import, so whatever mounts a bundle has to
 * supply the mapping — and the mapping is a JUDGEMENT, not arithmetic: `vue`
 * could be any of half a dozen builds in the package, and this is the
 * production ESM browser one; `gsap` is a directory whose entry point is
 * index.js. Neither is derivable from the specifier, which is why it is
 * written down once here instead of restated wherever it is needed.
 *
 * Paths are relative to docs/vendor/ — to the directory itself, not to any page
 * — because the two consumers sit at different depths. The docs site no longer
 * has one at all: its specimens import the .vue sources through Vite, so they
 * resolve `vue` the ordinary way and never see this. The remaining consumer is
 * ds-bundle/, whose Components cards mount compiled/*.js in a Design project
 * that cannot run a bundler; it copies docs/vendor/ wholesale and declares its
 * own map at its own depth.
 *
 * This lived in layouts/DocPage.astro's `importmapJson` until the specimens
 * stopped mounting bundles. Left there it would have been a constant in a
 * layout that never emitted it, describing an artifact the layout has nothing
 * to do with — and check-importmap.mjs would have gone on reading it, reporting
 * green for a claim nothing made any more.
 */

export const VENDOR = {
  'vue': 'vue.esm-browser.prod.js',
  'gsap': 'gsap/index.js',
  'gsap/SplitText': 'gsap/SplitText.js',
};
