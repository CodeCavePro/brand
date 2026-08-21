# CODECAVE Brand kit

The human-facing companions to this file, which state the same rules with their
reasons rather than as instructions: [CONTRIBUTING.md](/CONTRIBUTING.md) (what is
editable, what is derived, what to run) and [RELEASING.md](/RELEASING.md)
(publishing the npm package). When a rule here changes, check whether one of
those states it too.

## Where open work lives — read this before assuming there is none

**Jira is the only list.** This repo used to keep a `TODO.md`; it was deleted on
2026-08-20 once its contents were filed, so *the absence of a to-do file in this
repository does not mean the work is done.*

Open items for the brand package, all in
[CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) under the **`brand-kit`**
label ([live query](https://codecave.atlassian.net/issues?jql=project%20%3D%20CCWEB2%20AND%20labels%20%3D%20%22brand-kit%22%20ORDER%20BY%20key%20ASC)):

-   [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318) — **epic.** Publish `@codecavepro/brand` to npm and have codecave.pro install it, inverting the direction of truth. **`@codecavepro/brand@1.0.0` went to public npm on 2026-08-21 — phase 5 is done. Open: publishing 1.1.0 (needs a human OTP), then phase 6 (the codecave.pro PR — open it, do not merge), then phase 4.** The epic lists phase 4 before phase 6; **that order was reversed on 2026-08-21 and the reason is below.** Re-measure the captures with `npm run check:captures` before building components from them; never publish a component built from a capture that is behind the site.

    **Why phase 4 waits for phase 6.** Phase 4 promotes `docs/source_examples/`
    into `packages/brand/src/components`, which breaks two rules this repo
    otherwise holds absolutely: that nothing under `packages/` is authored, and
    that a storybook specimen is a *record* of what the site ships. Nine of the
    nineteen captures import things only the site has, so promoting them means
    editing them — and an edited capture is neither the site's source nor a
    record of it. That is only a fair trade once the site actually installs the
    package, because then the package *is* what the site ships and the storybook
    documenting it is documenting production. Until that day it would leave
    nothing describing the real site. Phase 6 is what makes phase 4 honest, so
    phase 6 goes first. The token half of the epic — the package, the CSS, the
    faux-bold font fix — needs none of this and is unblocked.

    **What the site imports is `/tokens.css`, not `/css`.** Measured before
    writing the phase 6 PR: `@codecavepro/brand/css` is the design system
    whole, so importing it into codecave.pro would impose eight element rules
    the site has no competing rule for, add sixty class selectors it does not
    use, and redefine `.page-container` and `.section-container`, which the
    site already defines and which differ. That is a redesign, not a
    dependency update. `/tokens.css` — added in 1.1.0, extracted from
    `colors_and_type.css` by `packages/brand/scripts/build.mjs` — is the
    `:root` block alone, so the site can stop keeping its own copy of the
    palette without a single pixel moving. **Phase 6 changes no colours.**
    The site's own `@font-face` stays its own for the same reason: swapping
    one faux-bolded cut for six real ones is a visible change and belongs in
    its own PR, not smuggled into this one.

Genuine bugs in what codecave.pro ships, found while resyncing the captures.
**These are the site's to fix, not the package's** — do not "correct" them in
`docs/`:

-   [CCWEB2-319](https://codecave.atlassian.net/browse/CCWEB2-319) — the site's dead `h-11` under `min-h-12`. The package half is settled: `--control-height` is `3rem`/48px, applied by `.btn` as `min-height`.
-   [CCWEB2-320](https://codecave.atlassian.net/browse/CCWEB2-320) — `TextField.vue`'s error message renders at 2.91:1. Accessibility.
-   [CCWEB2-321](https://codecave.atlassian.net/browse/CCWEB2-321) — footer link reads "Truspilot".
-   [CCWEB2-322](https://codecave.atlassian.net/browse/CCWEB2-322) — `LazyImage.vue` never binds the `width`/`height` props it declares.

### The docs site is Astro

Finished under [CCWEB2-317](https://codecave.atlassian.net/browse/CCWEB2-317) on
2026-08-21, so it is architecture now rather than open work. **Sources stay in
`docs/`, output goes to gitignored `dist/`, and Pages deploys `dist/`.** Every
page is an `.astro` under `docs/pages/`; `artifacts/` is never rendered and never
will be. Everything else in `docs/` is payload and passes through, which
`docs/tools/astro-passthrough.mjs` asserts every build — both halves are silent
when they fail.

Two rules survive the migration and are in [CONTRIBUTING.md](/CONTRIBUTING.md)
with their reasons. The one that bites when adding a page: a `.html` at the same
path wins over the `.astro`, so writing one page in both forms leaves the
`.astro` dead — Astro's own behaviour is a `WARN` and exit 0, and the
passthrough check fails the build instead. The one that bites when improving a
page: **the storybook specimens are not Astro islands and must not become them.**
They mount `compiled/*.js` in the browser through an import map, which is what
makes them a record of what codecave.pro ships rather than a rebuild of it, and
`is:inline` on both tags is what keeps that true. `@astrojs/vue` is consequently
exercised by nothing; it stays only as a bet on CCWEB2-318 phase 4.

### Ports, not stubs

Where a captured component depends on something the docs build cannot carry (a
Strapi client, an HTML sanitiser), **do not stub it**. `docs/storybook/ports/`
holds the interface and a docs-build adapter, wired through the `PORTS` table in
`build-storybook.mjs`, and `npm run check:ports` typechecks each adapter against
its interface in CI. A stub fails as an `undefined` in a reader's browser; an
adapter fails the build. The bar is in `ports.d.ts`: if swapping the
implementation would change what the specimen *looks like*, it is not a port.

**An adapter substitutes the environment, never the behaviour.** `SanitizerPort`
is real `dompurify` — pinned to the version `codecave.pro/pnpm-lock.yaml`
resolves for `isomorphic-dompurify`, and `build-storybook.mjs` fails the build
if the two drift — not a pass-through; the wrapper's `jsdom` half is what gets
dropped, because a docs page is only ever a browser. It shipped as an identity
function for a day and that was the wrong call: it made the one page people
visit to check sanitising the one page not doing it. Where an adapter truly
cannot reach production (`StrapiPort` has the CMS host but not its token), the
specimen must say so on its face, not in a comment.

Related rule: **nothing under `docs/source_examples/` is authored.** A
hand-written stub used to live there as `lib/strapi.ts`; it is gone.

### The package, in one paragraph

`packages/brand/` is a **pure derivative of `docs/`** — it copies
`colors_and_type.css` and `fonts.css` byte-for-byte, copies the root `LICENSE`,
and compiles `docs/tokens/*.ts`. No *design content* under `packages/` is
authored; the only tracked files are its manifest, build script and `README.md`,
and `npm run check` asserts the byte-identity of all three copies. **`docs/`
remains the single origin; edit there, never in `packages/`.**

The `LICENSE` copy is not housekeeping: npm picks a licence up **only** from the
package root and `files: ["dist"]` neither includes nor excludes it, so the
tarball shipped no licence text at all while `package.json` claimed
`"Unlicense"`. Copying it beats authoring a second one for the same reason as
the palette. Publishing the result is [RELEASING.md](/RELEASING.md).

The README is authored because npm renders it as the package page and there is
nowhere else for that page to come from — it is manifest-adjacent, the same
category as `package.json`. It explains how to install and consume, and links
rather than restates: the rules live in `docs/DESIGN.md`.

Its usage example does quote real token values, which is a second home for
them, so **they are asserted, not trusted.** Any README line shaped
`group.key;   // 'value'` is checked against the freshly compiled module by
`build.mjs`; a palette change that leaves the README behind fails the build, and
`prepack` runs it, so a stale value cannot be published. Prose comments are
ignored — verified by corrupting a value and watching it exit 1. Add values to
the example freely in that shape; do **not** write one in a form the check
cannot see. The registry is npm public — this repo is already a public repo,
so nothing private was being protected.

CCWEB2 is the *website* project and these are brand-package items — they sit there
because no brand project exists yet. The `brand-kit` label is what makes them
movable in bulk when one does. **Print colour space / CMYK is deliberately not
filed anywhere:** it is Maria Shaban's decision and gets its own project later.

Site-side flaws still go to [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md), which is
already mirrored as CCWEB2-270…310. It stays a file only because twelve places
cite it by section number, three of them inside the shipped
`docs/colors_and_type.css`.

## Core Visual Foundation
These are the foundational rules and assets that dictate how every other template is built. [[1](https://weirmedia.ca/web-design)]
-   Logo System: Primary logo, secondary logo, submarks, favicon, and monochrome versions.
-   Color Palette: Exact HEX and RGB codes divided into primary, secondary, and accent colors. (Print colour space — CMYK, and whether a spot colour is used — is deferred to Maria Shaban, and is tracked outside this file.)
-   Typography Hierarchy: Specific brand fonts, scale sizes, and line-height instructions for headers, subheaders, and body text.
-   Brand Style Guide: A PDF manual outlining do's and don'ts, spacing rules, and usage examples. [[1](https://rabbitlogo.com/blog/logo-system/), [2](https://www.realtor.com/marketing/resources/visual-branding-101-how-to-create-a-toolkit-your-agents-will-actually-use/), [3](https://storyflow.so/blog/how-to-create-a-brand-book), [4](https://www.webwave.co.in/services/branding-services)]

## Digital Communication & Marketing
These assets turn your daily digital touchpoints into brand-building opportunities. [[1](https://www.mediawallstreet.com/)]
-   Email Templates: Newsletter layouts, transactional email designs, and automated welcome sequence graphics.
-   Email Signatures: Standardized layouts for all employees featuring consistent fonts, logos, and social links.
-   Presentation Slides: Keynote, PowerPoint, or Google Slides templates containing master slides for data, quotes, and title pages.
-   Landing Page Blueprints: Wireframes or built-out page templates featuring pre-styled hero sections, buttons, and testimonials. [[1](https://www.archmark.co/3-basics-for-managing-your-email-automation), [2](https://www.nativedigital.co.nz/email-signature-management), [3](https://www.linkedin.com/in/kevinlerner), [4](https://elementor.com/blog/wireframe/)]

## Data Collection & Operational Assets
These tools keep your backend operations looking as professional as your frontend marketing. [[1](https://mangomadness.ca/branding-design/)]
-   Forms & Surveys: Branded Google Forms, Typeform layouts, or PDF applications with custom headers and field styling.
-   Invoices & Receipts: Clean templates for billing that include your logo, brand colors, and official typography.
-   Contracts & Proposals: Standardized word-processing templates (Word or Google Docs) with branded cover pages, headers, and footers. [[1](https://www.journy.io/integrations/typeform), [2](https://amosndegraphics.com/record-keeping-books-printing/?srsltid=AfmBOoo2zedzXUJEsROizGNgIkFr9xl0ljfj-5z2gxksZ6hqd_loYQ4Q), [3](https://www.indianic.com/products/proposal-creator)]

## Social Media & Content Creation
These ready-to-use graphics help teams create content rapidly without losing visual cohesion. [[1](https://pluralis.in/services/online-branding/social-media-branding-kit/)]
-   Profile Kits: Coordinated profile pictures and banner graphics for LinkedIn, X, YouTube, and Meta platforms.
-   Post Templates: Editable Canva or Adobe files for standard static posts, Instagram Stories, and carousel layouts.
-   Video Assets: Branded intro/outro animations, lower-third graphic overlays for names, and watermarks. [[1](https://www.designfreelogoonline.com/logoshop/social-media-kit/), [2](https://brandpacks.com/templates/ad-creative-social-media-template-2/), [3](https://enterprisetube.com/blog/brand-identity-using-white-label-video-platform-video)]