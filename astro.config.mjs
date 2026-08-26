// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import starlight from '@astrojs/starlight'; // SPIKE CCWEB2-374
import docsPassthrough from './tools/astro-passthrough.mjs';
import { aliasTarget } from './tools/import-aliases.mjs';
import { portFor } from './tools/storybook-ports.mjs';

/* Resolving the specifiers a component is WRITTEN with, against this repo.
 *
 * The kitchen-sink specimens import the component sources directly -- see
 * DocPage.astro for why that replaced the compiled bundles -- so Vite now has
 * to answer the same three questions the package build answers, and answer
 * them the same way:
 *
 *   codecave.pro's path aliases   `@helpers/date-formatter.ts` and the rest are
 *   tsconfig `paths` entries in THAT repo. Nothing here declares them, so the
 *   dev server reported them as missing npm packages and gave up pre-bundling.
 *
 *   THE PACKAGE'S OWN NAME        `@codecavepro/brand/components/common/Button.vue`
 *   is how a component that renders a Button is written, because the site
 *   installs this package. Left alone it resolves -- to packages/brand/dist/,
 *   the BUILT copy, which is a different file that only exists after a package
 *   build and never hot-reloads. Every specimen would silently go stale.
 *
 *   PORTS                         `isomorphic-dompurify` pairs DOMPurify with
 *   jsdom for SSR; a docs page is only ever a browser. Same table the storybook
 *   bundles read, for the same reason.
 *
 * The mapping is aliasTarget()'s, not sitePath()'s, and the difference is not
 * cosmetic. aliasTarget answers in the SHIPPED layout -- `src/common/Button.vue`
 * -- and that layout is a mirror of src/components/, so stripping `src/` lands
 * on this repo's own tree for every prefix including the package name.
 * sitePath answers in codecave.pro's layout, where `@components/` is
 * `components/...`; joined onto src/components/ that is one level too deep, and
 * the directory-existence test this used to do meant the prefix silently
 * resolved to nothing rather than to the wrong file.
 *
 * A prefix the table maps to null -- `@layouts/`, `@styles/` -- is left
 * unresolved on purpose. This repo does not have them, and an unresolved
 * import that names itself beats one quietly pointed somewhere plausible. */
const ROOTS = ['src/components', 'src/captured'].map((d) =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), d),
);

const authoredSources = () => ({
  name: 'codecave:authored-sources',
  /* Before Vite's own resolution, or `isomorphic-dompurify` and the package
     name both resolve to node_modules and the substitution never happens. */
  enforce: /** @type {const} */ ('pre'),
  resolveId(spec) {
    const port = portFor(spec);
    if (port) return port.file;
    const shipped = aliasTarget(spec);
    if (!shipped?.startsWith('src/')) return null;
    const rel = shipped.slice('src/'.length);
    return ROOTS.map((r) => path.join(r, rel)).find((f) => fs.existsSync(f)) ?? null;
  },
});

/* The docs site — CCWEB2-317, and phase 2 of CCWEB2-318.
 *
 * SOURCES STAY IN docs/. OUTPUT GOES TO dist/, WHICH IS NOT COMMITTED.
 *
 * The opposite shape was considered and cannot be used — an Astro project in
 * `site/`, a `payload/` directory, and `docs/` as the build OUTPUT.
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
 * as raw .astro source. tools/astro-passthrough.mjs prunes them and then
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

  /* vue() compiles the kitchen-sink specimens, and that is a reversal.
   *
   * This comment used to say the integration was wired and exercised by
   * nothing, and that it would stay that way: the specimens mounted
   * storybook/compiled/*.js in the BROWSER, esbuild output from codecave.pro's
   * own toolchain, precisely so a reader saw what the site shipped rather than
   * a rebuild of it. Compiling them here was the one thing the storybook must
   * not do.
   *
   * That argument rested on this repository being downstream, and it has not
   * been since 2026-08-25. The components are authored in src/ now and the site
   * installs the package built from them, so compiling a specimen from source
   * IS showing what ships -- and mounting a prebuilt bundle instead shows
   * whatever the last package build produced, which is the stale copy.
   *
   * The practical half: a specimen that imports the .vue hot-reloads while you
   * edit the component, which a prebuilt bundle can never do. That is the whole
   * reason the change was made.
   *
   * build:storybook still runs and still writes compiled/*.js -- ds-bundle/
   * consumes them for a Design project that cannot run a bundler. It is no
   * longer what this site mounts. */
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
      customCss: ['./src/styles/colors_and_type.css', './docs/nav.css', './docs/starlight.css'],
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
    plugins: [authoredSources()],

    optimizeDeps: {
      /* Tell Vite what the entrypoints are, because it guesses badly here.
       *
       * Left to itself it globs the project for .html and .vue files to scan
       * for dependencies — and since publicDir is docs/, that sweep picks up
       * all 36 documentation pages and every component source under
       * docs/authored/ and docs/source_examples/. Those then fail to resolve,
       * 11 times, because they import site-side components nothing here has:
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
