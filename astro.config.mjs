// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import starlight from '@astrojs/starlight'; // SPIKE CCWEB2-374
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
 * today's URLs today's URLs. That matters beyond tidiness: 35 citations across
 * eight prose and config files address these paths, one of them inside the
 * shipped colors_and_type.css.
 *
 * That sentence used to read "twelve places, three of them inside the shipped
 * colors_and_type.css" — which is the count for WEBSITE-REVIEW.md's section
 * numbers, borrowed here by mistake and describing a different thing entirely.
 * The numbers above are measured, and check-links.mjs now asserts every one of
 * those citations resolves, so the argument does not rest on a remembered
 * count any more.
 */
export default defineConfig({
  site: 'https://brand.codecave.pro',

  srcDir: './docs',
  publicDir: './docs',
  outDir: './dist',

  build: { format: 'preserve' },
  trailingSlash: 'never',

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
   * that, so treat it as a bet, not a requirement.
   *
   * The odds got longer on 2026-08-21: phase 4 was resequenced behind phase 6
   * (see CLAUDE.md for why), so it now waits on the first publish AND on the
   * website PR, and it may not happen at all. Two conditions retire this, and
   * either is enough — phase 4 landing without an island, or phase 6 landing
   * while phase 4 is still unstarted. Then this line and the @astrojs/vue
   * devDependency both go; re-adding them is one `npm i -D` and two lines, so
   * there is nothing to preserve by hesitating. */
  integrations: [
    vue(),
    /* SPIKE — CCWEB2-374. Starlight injects a ROOT catch-all `[...slug]`, so the
       question is whether it steals routes from the 34 hand-built pages and the
       197 payload files. It only generates paths its collection supplies, and
       the collection is scoped to guides/ — but that is a claim to test, not to
       assume. `disable404Route` because this site ships no 404 today and a spike
       should not quietly add one. */
    starlight({
      title: 'CODECAVE',
      disable404Route: true,
      /* The thing CCWEB2-374 was actually asking about. */
      components: {
        Header: './docs/starlight-overrides/Header.astro',
        Sidebar: './docs/starlight-overrides/Sidebar.astro',
      },
      /* BrandNav says it needs tokens and nothing else; Starlight links neither.
         Does handing it the real stylesheet style the bar, or does the global
         class layer fight Starlight’s own? */
      customCss: ['./docs/colors_and_type.css', './docs/nav.css', './docs/starlight.css'],
      /* No search index. Starlight builds one with Pagefind by default and puts
         the search box in its Header — the component this site replaces with its
         own bar, which has no slot for one and should not grow a search field
         only on four pages out of 39. Left on, the build ships an index nothing
         can query, which is the kind of claim this repository checks rather
         than makes. Search is a feature decision, not a side effect. */
      pagefind: false,
      /* No prev/next footer either, and this one is about URL spelling rather
         than about a third navigation being redundant -- though it is that too,
         since the sub-nav lists all four guides in the same reading order and
         marks the current one.

         Starlight formats its own links through createPathFormatter, which under
         `preserve` (aliased to `directory`) emits them WITHOUT the extension:
         /guides/design-rules, not /guides/design-rules.html. The live host
         resolves that -- verified -- but nothing else here does. Every other link
         on this site is written with .html precisely so a page still opens from
         disk, which is how the deliverable wrappers get reviewed, and so it does
         not depend on a host feature. Pagination was the only place that stopped
         being true. */
      pagination: false,
      /* No `sidebar`. The Sidebar component is overridden to render nothing —
         see that file for why an autogenerated one comes out empty here — so a
         config for it would describe a bar that does not exist. */
    }),
    docsPassthrough(),
  ],

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
