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

-   [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318) — **epic. All six phases have landed (2026-08-21), and phase 6's sentence is now finished on the styling side.** The package is on public npm; codecave.pro `development` installs **1.6.1**, imports both `/tokens.css` and `/theme.css` from it, and no longer keeps a palette or an `@theme` block of its own — which is why `docs/theme.css` is now the ORIGIN of that block rather than the site's `global.css` capture. Deriving it from the site had quietly become a circle, and it survived only while the capture was stale. Twelve components moved with it — Button, GlowButton, Checkbox, InputText, TextField, Radio, Review, TypingEffect, ContactUsForm, ResearchForm, LazyImage, pain-points-item — and are gone from the site's `src/`.

    Seven stay site-owned on purpose: ArticlePreview, link-group, desktop-menu, mobile-menu, services-list, technologies and technology-card all reach the site's `paths.ts`, `links.ts` or `menu.ts`. Installing them would put codecave.pro's navigation behind an npm release — changing a menu item would mean publishing. That is a coupling decision, not a mechanical swap.

    **As of 2.0.0 the package does not ship them either, and that took a major bump.** It had been shipping all seven — not by decision, but because every non-excluded `.vue` is a root. Nobody installed them, so nothing said so, until the site began importing the package by name and those seven became the only shipped captures with a live origin left to drift. Refreshing them would have written `@codecavepro/brand/components/common/Button.vue` into the package's own source: the package importing itself, `assertPeersDeclared` demanding the package as its own peer, and a consumer with two versions installed getting one component's Button from the other. The alternative was a second rewrite rule taught to four places to keep shipping files nobody installs, so they went into `NOT_SHIPPED` instead and `assertNoSelfImport()` keeps the class shut. What is left with a live origin — thirteen icons, two leaf modules, one SVG — renders no shared component and so can never acquire that import. Three storybook specimens compile from the captures now, and the build says which.

    **The fonts are settled.** The package declares ten `@font-face` rules — 300/400/500/700/900, upright and italic, every weight Satoshi has — and codecave.pro declares the same ten. **The binaries are still not in the tarball**: that is a redistribution question, recorded in `build.mjs`, and no release changes it. The vendor's own `stylesheet.css` is unusable and both stylesheets say why next to the declarations.

    **A consumer that installs the components has to put the package back in Tailwind's scan.** Automatic content detection skips `node_modules` and this package ships Vue source, so a utility used only inside an installed component is never emitted — with no error anywhere: the build succeeds, the typecheck passes, and the elements render unstyled. One `@source` line fixes it, the package `README.md` says so, and codecave.pro's `check:classes` fails the build when it is missing (CCWEB2-360).

    The version mechanic stays true and is the thing to remember — CI installs with `pnpm install --frozen-lockfile`, so the site runs whatever its lockfile pins and nothing moves it on its own. A token change here reaches the site only when someone raises the range and regenerates the lockfile, and pnpm's `minimumReleaseAge` guard means a same-day publish also needs its `minimumReleaseAgeExclude` entry or the frozen install refuses it.

    **Never build or publish a component from a stale capture — and read what
    "stale" is measured against.** `npm run check:captures` diffs
    `docs/source_examples/` against **whatever branch the codecave.pro checkout
    happens to be on**, so a checkout sitting on an unmerged branch reports that
    branch's own fixes as capture drift. The captures record what the site
    *ships*: put the checkout on `development` before believing the answer.


-   [CCWEB2-372](https://codecave.atlassian.net/browse/CCWEB2-372) — **the package ships no logo.** It never shipped one deliberately: `logo.svg` was in the tarball because a menu imported it, and the menus left in 2.0.0. Putting the one SVG back would recreate the accident on purpose, so the question is which marks, in which formats — and whether an npm package is the right delivery for brand marks at all, next to the same unanswered question about the font binaries.

Open bugs in what codecave.pro ships, found while resyncing the captures or
while working on the site itself. **These are the site's to fix, not the
package's** — do not "correct" them in `docs/`. A bug leaves this list the
moment it is fixed; Jira keeps the history, so nothing here is a record:

-   [CCWEB2-320](https://codecave.atlassian.net/browse/CCWEB2-320) — `TextField.vue`'s error message renders at 2.91:1. Accessibility, and a colour decision, so it is **assigned to Maria Shaban**.
-   [CCWEB2-331](https://codecave.atlassian.net/browse/CCWEB2-331) — GlowButton renders 44px against the 48px `--control-height` every other button uses, because its `h-11` has no `min-h-12` under it to cancel it — unlike `Button.vue`, where the same class was dead. Fixing it moves pixels on all eleven call sites, so it is a design call and is **assigned to Maria Shaban**: either GlowButton joins the 48px grid, or the exception gets written down next to the token.

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

**That import map is checked against the bundles, both ways.** It is the only
thing resolving the specifiers esbuild deliberately left external, and an
import-map key is matched exactly — so a capture moving to a different entry
point of the same package silently kills every specimen on the page. Nothing
errors: the page renders, the canvas is simply empty. `npm run check:importmap`
reads the bare specifiers out of `storybook/compiled/*.js` and the keys out of
`DocPage.astro`'s `importmapJson` and fails on either mismatch, since a mapped
specifier nothing imports is a claim that has stopped being true. Both inputs
are committed, so unlike `check:captures` it needs no site checkout and runs in
CI.

**A layout may not derive a page's depth from `Astro.url.pathname`.** With
`build.format: 'preserve'`, a directory index is requested at `/storybook` in
dev and emitted at `/storybook/` by the build, so the same page counts a
different number of levels in each mode — and nothing else in the request
separates an index from a leaf. `DocPage.astro` asks `import.meta.glob` which
pages are `index.astro` instead; Vite resolves that at transform time, so it is
the same static list in both modes.

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
cannot reach production, the specimen must say so on its face, not in a
comment. No port is in that position today.

**A port exists because a captured component needs it, and every build says
which ones a specimen actually reached for.** `check:ports` typechecks every
adapter whether or not anything imports it, so on its own a green check reads
as coverage of something that may be running for nothing — which is exactly
what `StrapiPort` became once the CMS-shaped components took an injected
`resolveImage()`. So `build-storybook.mjs` names the specimens each port stood
in for, and names any port nothing reached for at all.

Related rule: **nothing under `docs/source_examples/` is authored.** A
hand-written stub used to live there as `lib/strapi.ts`; it is gone.

### The package, in one paragraph

`packages/brand/` is a **pure derivative of `docs/`** — it copies
`colors_and_type.css` and `fonts.css` byte-for-byte, copies the root `LICENSE`,
copies the components out of `docs/source_examples/`, extracts `tokens.css` from
`colors_and_type.css` and `theme.css` from `docs/theme.css`, and compiles
`docs/tokens/*.ts`. No *design content* under `packages/` is authored; the only
tracked files are its manifest, build script and `README.md`, and `npm run
check` asserts the byte-identity of every copy. **`docs/` remains the single
origin; edit there, never in `packages/`.**

**Two things a shipped component may reach for are checked at build time, and
both were added after one got out.** `assertDistResolves()` asks whether every
import and `url()` in `dist/` resolves inside `dist/` — that is CCWEB2-370, the
checkbox tick. `assertTokensSuffice()` asks the same question of CSS: every
`var(--x)` a shipped component reads must be declared by `tokens.css`,
`theme.css` or the component itself. `--duration-control` was the one that was
not — codecave.pro declared it privately in its own `:root`, so Checkbox and
Radio transitioned correctly here and on the site and instantly for everybody
else. **A property the site happens to declare is not a property the package
has**, and the only way to tell the difference is to ask the tarball.

**One rewrite happens on the way in, and it is the only one.** The site imports
its helpers as `@helpers/paths.ts` — a tsconfig `paths` entry in codecave.pro,
which this package does not ship and a consumer has never heard of. So the nine
captures that use it are rewritten to the relative form as they are copied, and
those nine "match their origin once `@helpers` is resolved" rather than
byte-for-byte; `check` says which count is which. The rule lives in
`docs/tools/helpers-alias.mjs` because `build-storybook.mjs` needs the same
answer when it compares the package's copy of a component against the capture it
came from — an identical-bytes test there would mean the package was *not* built
from that capture. **Do not add a second alias without reading what the first
one cost:** it was silently both un-followed and mistaken for an npm package,
which would have dropped every helper out of the tarball while the build stayed
green. `assertDistResolves()` is the backstop and asks the built files, not the
captures — every import in `dist/` must resolve inside `dist/`.

**`theme.css` is the half that makes the components visible, and its import order
is load-bearing.** `tokens.css` carries the token *values*; only an `@theme` entry
makes `.bg-surface-primary` exist, so a consumer needs both. Several `@theme`
entries are deliberate self-references (`--x: var(--x)`) — **never "fix" one on
sight.** The declaration is what makes Tailwind emit the utility; the value comes
from `tokens.css`, whose unlayered `:root` beats `@layer theme`. Behind a layered
or absent `tokens.css` the same line is a cycle and resolves to nothing. Where the
two files both give a name a *literal* value they must agree, and the build fails
if they do not — otherwise one is dead and nothing shows it. `--font-sans` is the
one excused difference, and the exception carries its reason in `build.mjs`.
`--breakpoint-sm` must stay a literal: Tailwind bakes it into `@media (width >=
457px)` at build time, where a `var()` would be invalid CSS.

**The component list is computed, never written down.** `build.mjs` takes every
non-excluded `.vue` under `source_examples/` as a root and follows everything it
*reaches* transitively — *in the layout the package ships*, which is why
`dist/src/` restores the site's `src/components/…` depth rather than keeping the
captures' flattened one. A reference that lands outside the package fails the
build and names itself. So a component is added by capturing it, and the only
hand-written thing is `NOT_SHIPPED`, where each exclusion carries its reason as
a string.

**"Reaches" means imports *and* `url()` targets in a `<style>` block, and it did
not always.** Following imports alone shipped `logo.svg`, because a menu happens
to `import` it, while `Checkbox.vue`'s tick — a `background-image` — was never
an edge at all: the icon stayed out of the tarball, and every check agreed,
because `assertDistResolves()` read the built files with the same two import
patterns and so was blind in exactly the same place. It surfaced as a 404 and a
checkbox that would not tick. Assets are not a category the build knows; a file
ships because something reaches it, so **a new spelling of "reaches" has to be
taught to `referencesOf()`, which both the walk and the backstop now call.**

**What a component imports from npm is checked against the manifest.** The
relative-import walk proves every `../` resolves inside the package; it proves
nothing about `import { Carousel } from 'vue3-carousel'`. An undeclared one
resolves here anyway — the site checkout next door has it installed — and fails
in the consumer's build, the one place nobody would look. So `build.mjs`
collects every bare specifier the shipped files import and fails unless
`peerDependencies` names exactly that set, in **both** directions: an import
nothing declares, and a declared peer nothing imports any more.

The storybook compiles from the package where the package has the component and
from the captures where it does not, and **says which on every build.** A
specimen quietly reverting to the captures is exactly the drift this
arrangement prevents, and the build log is the only place anyone would see it.
A component's identity — its scoped-style id, its `__file` — is its *capture*
path whichever root supplied the bytes, so promoting one (or removing it again)
does not rewrite every `data-v-` attribute in its bundle.

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
cannot see. The same treatment covers the two counts the README quotes as
prose — the `:root` property count and the components-and-icons count — because
those are facts about what the build produced, not claims worth trusting. The registry is npm public — this repo is already a public repo,
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