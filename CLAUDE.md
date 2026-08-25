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

    Seven used to stay site-owned: ArticlePreview, link-group, desktop-menu, mobile-menu, services-list, technologies and technology-card each read the site's `paths.ts`, `links.ts` or `menu.ts`, so installing one would have put codecave.pro's navigation behind an npm release — changing a menu item would mean publishing. 2.0.0 stopped shipping them for that reason.

    **2.1.0 ships six of the seven, because the reach was removed rather than tolerated.** The exclusion was never about the components; it was about what they read. Each now takes the same information as props — `basePath`, `items`, `serviceLinks`, `ctaHref`, `href`, `logo` — exactly as BrandNav did, and codecave.pro passes it in from the modules it still owns. **`paths.ts` consequently dropped out of the tarball**: nothing shipped imports it any more, so the package no longer carries one site's route table at all. Nineteen components and thirteen icons ship, and all twelve storybook specimens compile from the package rather than three of them falling back to the captures.

    **codecave.pro consumes all of it as of 2.1.1, and keeps no copies.** `src/components/header/` is `header.astro` and `menu.ts`; the six arrive from the package and `desktop-menu.vue` is deleted rather than imported. The header is Astro now, not Vue: it used to hold a `ref(window.innerWidth)` to pick between the two bars, which forced the whole thing to `client:only`, so **every page was served with no header at all** and grew one when Vue booted. A media query does that job, and BrandNav needs no JavaScript by construction — so the desktop bar is now static HTML and only the drawer hydrates, below `xl`.

    **desktop-menu.vue is gone rather than excluded.** BrandNav replaced it outright, codecave.pro deleted the file on 2026-08-24, and the capture went with it — `source_examples/` records what the site ships, so a capture of a file the site does not have is not evidence of anything. It has no `NOT_SHIPPED` entry, because that list is for captures that exist and must not ship, not for captures that should not exist.

    **The site keeps no copy of anything the package ships, as of 2026-08-24.** Audited by basename and normalised content, which found 19 exact duplicates — nine of them already dead. codecave.pro's `global.css` now declares **zero** custom properties of its own, and `.page-container` / `.section-container` are restated there only because importing `colors_and_type.css` would add ten `@font-face` rules whose `src` paths resolve inside the package; every *value* in them is a token. **37 captures now have no origin left** and are frozen by definition, which is worth watching: `source_examples/` is documented as evidence and nothing authored, and a majority of it can no longer be checked against anything.

    **The fonts are settled.** The package declares ten `@font-face` rules — 300/400/500/700/900, upright and italic, every weight Satoshi has — and codecave.pro declares the same ten. **The binaries are still not in the tarball**: that is a redistribution question, recorded in `build.mjs`, and no release changes it. The vendor's own `stylesheet.css` is unusable and both stylesheets say why next to the declarations.

    **A consumer that installs the components has to put the package back in Tailwind's scan.** Automatic content detection skips `node_modules` and this package ships Vue source, so a utility used only inside an installed component is never emitted — with no error anywhere: the build succeeds, the typecheck passes, and the elements render unstyled. One `@source` line fixes it, the package `README.md` says so, and codecave.pro's `check:classes` fails the build when it is missing (CCWEB2-360).

    The version mechanic stays true and is the thing to remember — CI installs with `pnpm install --frozen-lockfile`, so the site runs whatever its lockfile pins and nothing moves it on its own. A token change here reaches the site only when someone raises the range and regenerates the lockfile. pnpm's `minimumReleaseAge` guard used to add a day on top of that, and no longer does: codecave.pro's `pnpm-workspace.yaml` exempts this package as a whole, with an entry naming no version at all. Every *wildcard* spelling is still rejected — `@codecavepro/brand@*`, `@x`, `@>=0.0.0` — which is why both repos said for a while that a whole-package exemption was unavailable. It is the wildcards that are unavailable; an entry with no version predicate is a different thing and pnpm accepts it.

    **Never build or publish a component from a stale capture — and read what
    "stale" is measured against.** `npm run check:captures` diffs
    `docs/source_examples/` against **whatever branch the codecave.pro checkout
    happens to be on**, so a checkout sitting on an unmerged branch reports that
    branch's own fixes as capture drift. The captures record what the site
    *ships*: put the checkout on `development` before believing the answer.


-   [CCWEB2-374](https://codecave.atlassian.net/browse/CCWEB2-374) — **still an open decision, but the reason given for closing it was wrong, and there is now a branch that proves it.** The docs site reads like a documentation site and is not one — all 30 pages are specimens or galleries, and the only real prose it has (`DESIGN.md`, `README.md`, `SKILL.md`, `guide.md`, 1,601 lines) is not rendered as pages at all.

    The analysis said Starlight collides with `build.format: 'preserve'`. `preserve` is load-bearing — 35 citations across eight files address these URLs, one inside the shipped `colors_and_type.css`, and `check:links` fails on any that stops resolving — so that read as a blocker. It is not one. `preserve` is a **named** strategy in Starlight's `createPathFormatter`, aliased to `directory`, and the aliasing is the whole fault: the sidebar links `/x/`, the file is `x.html`, the canonical is `x.html/` and the sitemap is `x`, in a build that exits 0. **`trailingSlash: 'never'` reconciles all four**, verified against the live host.

    `spike/starlight-ccweb2-374` and its `STARLIGHT-SPIKE.md` carry the measurements — including the header override rendering BrandNav as static HTML, the four prose files rendering with their frontmatter untouched (it belongs to Claude Skills and to the token manifest, not to Starlight), and three silent costs, one of which is unfixed: `check-links.mjs` derives routes from `pages/` and cannot see a collection, so `/guides/*` would sit outside the dead-link check. **Do not merge that branch as a decision** — it is evidence for one.

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
page is an `.astro` under `docs/pages/`, and everything else in `docs/` is
payload that passes through — which `docs/tools/astro-passthrough.mjs` asserts
every build, both halves being silent when they fail.

**There are two browsable surfaces, and that is the shape to hold in mind.**
`kitchen-sink/` asks whether a *part* is right — 25 specimens, tokens through
live components, on one hub; `examples/` asks whether the parts *compose*, as
six deliverables behind a gallery. It used to be five surfaces: a brand page,
`preview/`, `storybook/`, `artifacts/` and two indexes over them. The brand page
folded into the front door as anchors, `preview/` and `storybook/` merged, and
`artifacts/` became `examples/`. 30 routes became 34: the surfaces collapsed, the
content did not. **`docs/storybook/` still exists and serves no pages** — it is
the compiled bundles, ports and placeholders the specimens mount, and it keeps
its name because every specimen identity derives from it.

**The six files under `docs/examples/raw/` are never rendered by Astro and never
will be.** Each has a wrapper page that documents it and embeds it in an
`<iframe>`, which is what lets both rules hold at once: every ROUTE carries the
menu, and every ARTIFACT stays a standalone document someone can be handed. That
split has a cost worth knowing — an `<iframe>` reports nothing about what
happens inside it, so nothing on the wrapper page can see a broken deliverable.
Moving `artifacts/` one directory deeper broke the wordmark in four of the six
and the Satoshi `@font-face` rules in two, and every check in the repo stayed
green. `npm run check:examples` is what asks now.

**Every route carries the same main menu, by construction.** `DocPage` renders
`DsNav` with no prop to override it, and the items come from
`docs/components/menu.ts`; a section's second bar comes from `SUB` in the same
file and is the only half that varies. So the one real failure mode is a page
getting *no* menu by skipping the layout — which builds, renders and passes
everything while being absent from the navigation. `npm run check:links` asserts
every page under `pages/` imports `DocPage`, and separately that every
documentation route the prose cites still resolves, anchors included: collapsing
the surfaces moved most of this site's URLs and broke 49 citations across nine
files, which nothing else here would ever have noticed.

**It also asks the plainest question about a page, which nothing used to ask:
when this runs, does the file it reaches for exist?** Every relative `src`,
`href`, `url()` and module specifier below the frontmatter fence, resolved
against the page's OUTPUT location and matched against the union of what the
build renders and what it copies -- 151 of them. Frontmatter is excluded
deliberately: imports above the fence are Astro's, resolved at build time against
the *source* tree, so judging both by one rule reports every layout import as a
dead file. Separately, a page importing a bare specifier must pass `importmap` to
`DocPage`, and a page passing it must import one -- the layout emits the map only
on request, so a specimen without it fails on `import ... from 'vue'` in the
browser and nowhere else. **This is the check that matters when a page MOVES**: a
relative path that was right at the old depth is wrong at the new one and still
looks perfectly reasonable.

Two rules survive the migration and are in [CONTRIBUTING.md](/CONTRIBUTING.md)
with their reasons. The one that bites when adding a page: a `.html` at the same
path wins over the `.astro`, so writing one page in both forms leaves the
`.astro` dead — Astro's own behaviour is a `WARN` and exit 0, and the
passthrough check fails the build instead. The one that bites when improving a
page: **the storybook specimens are not Astro islands and must not become them.**
They mount `compiled/*.js` in the browser through an import map, which is what
makes them a record of what codecave.pro ships rather than a rebuild of it, and
`is:inline` on both tags is what keeps that true — so a *specimen* is still not
an island. `@astrojs/vue` is no longer unused, though: `DsNav.astro` renders
`BrandNav.vue` with no client directive, which is the chrome rather than a
specimen and emits static HTML with no JavaScript at all.

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

**The package ships no brand marks, and that is now a decision rather than an
accident.** `logo.svg` was only ever in the tarball because a menu imported it,
and it left with the menus in 2.0.1. `BrandNav.vue` takes the wordmark as a
`logo` prop — a URL the consumer resolves through its own asset pipeline — so
the bar can be shared without the package distributing the mark. Same shape as
the font binaries, which stay out for a different reason (redistributing
third-party type), and the two answers agree about what "the brand kit ships":
the system, not the assets.

**`docs/authored/` is the second root, and the only one anyone writes into.**
`source_examples/` is evidence and nothing there is authored; `authored/` is the
opposite, and exists because `BrandNav.vue` has no upstream to be captured from —
it is the site bar and the docs bar reconciled, so neither repo owns it. Two
directories rather than a flag, because the rule that nothing under
`source_examples/` is authored stops being checkable the moment the two sit side
by side. **The directory name is the claim**, and a path present in both roots
fails the build rather than letting whichever walked last win.

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

**Specifiers are rewritten on the way in, and they are all the same problem.** A
capture names a file the package already ships, but spells it in a form that
only resolves from *outside* the package — so copied verbatim it produces a
tarball that looks complete and breaks in a consumer's build. The whole rule is
the table in `docs/tools/import-aliases.mjs`, which is also read by
`build-storybook.mjs` when it compares the package's copy of a component against
the capture it came from: an identical-bytes test there would mean the package
was *not* built from that capture. Rewritten captures "match their origin once
`@helpers` is resolved" rather than byte-for-byte, and `check` says which count
is which.

-   **codecave.pro's path aliases** — `@assets/`, `@components/`, `@helpers/`,
    `@lib/`. tsconfig `paths` entries in that repo, one per top-level directory
    under `src/`; this package ships no tsconfig and a consumer has never heard
    of them. `@helpers` was silently both un-followed and mistaken for an npm
    package, which would have dropped every helper out of the tarball while the
    build stayed green (CCWEB2-355).
-   **`@layouts/` and `@styles/`** — in the same table with a **null** target,
    which is not an omission. The package deliberately ships neither, so a
    shipped file reaching one is a bug rather than a missing rewrite; the entry
    is what makes the build say so. Without it `@styles/global.css` fell through
    as an unrecognised bare specifier and was reported as *an undeclared npm
    peer named `@styles`* — a real fault under a name that sends the reader to
    `package.json` to declare a package that does not exist.
-   **`@codecavepro/brand/...`** — **the package's own name.** The site installs
    this package, so any component that renders a Button imports it that way.
    Node would *resolve* a self-reference through the `exports` map, which is
    what makes it worse than a plain error: it would work here, work in a
    consumer that installed a matching version, and demand `@codecavepro/brand`
    as its own peerDependency. Only the four subpaths that map into `dist/src/`
    are rewritten; anything else is left alone so `assertNoSelfImport()` catches
    it by name rather than a wrong path resolving to nothing.

**Adding one is not routine, even though the table makes it look it.** The bar
every *rewritable* entry clears: the alias must name a directory the package
ships, so the rewrite is pure path arithmetic with no judgement in it.
`assertDistResolves()` is the backstop and asks the built files, not the
captures — every import in `dist/` must resolve inside `dist/`. Three details
were each a silent failure first, and are worth knowing before touching this:

-   `assertNoSelfImport()` and `assertPeersDeclared()` read `shippedText()`, the
    post-rewrite bytes, not the capture. Judging a specifier the rewrite removes
    is how both fired on a spelling that never reaches the tarball.
-   Both skip anything `isAlias()` recognises — not merely anything with a
    target — which is the `@styles` case above.
-   `usesAlias()` is a specifier-position regex, not a substring test. A comment
    mentioning `@helpers/service-links.ts` in prose was once enough to fail the
    build for carrying an unrewritten alias: it failed on its own documentation,
    the same shape as a Tailwind utility named in prose.

**A `url()` in a `<style>` block is never aliased**, on either side. It already
resolves in the shipped layout, and `unalias()` only understands quoted
specifiers — so aliasing one would break the tarball rather than the site build.
codecave.pro's `tsconfig.json` says so where it declares the aliases;
`Checkbox.vue`'s tick is the reason (CCWEB2-370).

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
already mirrored as CCWEB2-270…310. It stays a file only because ten places
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