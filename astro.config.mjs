// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import docsPassthrough from './docs/tools/astro-passthrough.mjs';

/* The docs site — CCWEB2-317, and phase 2 of CCWEB2-318.
 *
 * SOURCES STAY IN docs/. OUTPUT GOES TO dist/, WHICH IS NOT COMMITTED.
 *
 * ASTRO-MIGRATION.md section 3 proposed the opposite — an Astro project in
 * `site/`, a `payload/` directory, and `docs/` as the build output — and that
 * shape cannot be used, because it was designed before packages/brand existed.
 * The package copies `docs/colors_and_type.css` and `docs/fonts/fonts.css`
 * byte-for-byte and `npm run check` asserts the identity. Making `docs/` an
 * outDir would make the package's origin a generated directory, and "docs/ is
 * the single origin" — the rule the whole package rests on — would quietly
 * become false. Here `docs/` stays authored, `dist/` is disposable, and no
 * diff ever carries generated noise.
 *
 * WHY publicDir IS THE SAME DIRECTORY AS srcDir. Most of docs/ is payload
 * rather than pages: the stylesheet, the fonts, the captures, the artifacts,
 * brand.json, DESIGN.md. Pointing publicDir at docs/ ships every one of them
 * unchanged with nothing to enumerate — and an enumeration is precisely what
 * would rot, silently, one 404 at a time.
 *
 * Astro 7.2.4 accepts the overlap. The cost is that publicDir also copies the
 * three directories Astro *owns* — pages/, layouts/, components/ — into dist/
 * as raw .astro source. docs/tools/astro-passthrough.mjs prunes them and then
 * asserts the passthrough actually happened, so if a future Astro changes this
 * behaviour the build fails instead of shipping a hollow site.
 *
 * WHY format IS 'preserve' AND NOT 'file'. Under 'file', both `about.astro`
 * and `about/index.astro` build to `/about.html` — so `pages/preview/index.astro`
 * would land at `/preview.html` and every nav link to `preview/index.html`,
 * `storybook/index.html` and `artifacts/index.html` would 404. 'preserve' emits
 * each page exactly where it sits in the source tree, which is what keeps
 * today's URLs today's URLs. That matters beyond tidiness: twelve places cite
 * these paths, three of them inside the shipped colors_and_type.css.
 */
export default defineConfig({
  site: 'https://brand.codecave.pro',

  srcDir: './docs',
  publicDir: './docs',
  outDir: './dist',

  build: { format: 'preserve' },

  /* Astro's default is `true`, and it corrupts this repository's prose.
   *
   * Measured on the first ported page: a line break before an inline tag was
   * collapsed to nothing rather than to a space, so "violet light <strong>upward
   * </strong>" rendered as "lightupward", "--color-shadow-0 (#281470)" as
   * "--color-shadow-0(#281470)", and "1px #2B2848" as "1px#2B2848" — three
   * separate places on one page, in a repository where the written explanation
   * is the most valuable thing in it and the hardest to regenerate.
   *
   * Off, the rendered output is also byte-comparable to the .html file each
   * page replaces, which is the only practical way to review 29 ports for
   * having changed nothing. That is a second reason, not the reason. */
  compressHTML: false,

  /* vue() is wired and exercised by nothing, and phase 3 settled that it will
   * stay that way. This comment used to say the storybook would prove it. The
   * storybook does the opposite: its thirteen specimens mount Vue in the
   * *browser*, from an import map and docs/storybook/compiled/*.js — esbuild
   * output from codecave.pro's own toolchain — precisely so that what a reader
   * sees is what the site ships. Compiling those components here instead is the
   * one thing the storybook must not do, so `client:load` has no place in it.
   *
   * It stays because CCWEB2-318 phase 4 promotes components into the package
   * and may well want a real island to demonstrate one. Nothing is asserting
   * that, so treat it as a bet, not a requirement: if phase 4 lands without an
   * island, this and the @astrojs/vue devDependency should both go. */
  integrations: [vue(), docsPassthrough()],

  vite: {
    optimizeDeps: {
      /* Tell Vite what the entrypoints are, because it guesses badly here.
       *
       * Left to itself it globs the project for .html and .vue files to scan
       * for dependencies — and since publicDir is docs/, that sweep picks up
       * all 36 documentation pages and all 22 captures in source_examples/.
       * The captures then fail to resolve, 11 times, because they import
       * site-side components that were never captured:
       * `../../assets/icons/asterisk-icon.vue` exists in codecave.pro and has
       * no counterpart here.
       *
       * Those errors are correct about the imports and wrong about it
       * mattering. A capture is a record of what the site shipped, not a
       * module this project builds — nothing imports it, and phase 3 will
       * mount the ones it needs deliberately. `astro build` never had the
       * problem; only the dev server's pre-bundling scan did. Naming the real
       * entrypoints ends the sweep at the pages. */
      entries: ['docs/pages/**/*.astro'],
    },
  },
});
