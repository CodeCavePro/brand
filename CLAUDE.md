# CODECAVE Brand kit

The human-facing companions to this file, which state the same rules with their
reasons rather than as instructions: [CONTRIBUTING.md](/CONTRIBUTING.md) (what is
editable, what is derived, what to run) and [RELEASING.md](/RELEASING.md)
(publishing the npm package). When a rule here changes, check whether one of
those states it too.

## Where everything is — one rule

**`src/` is authored; everything else is produced from it.** That was not true
until 2026-08-26, and the shape it replaced is why this section exists: the
components were in `docs/authored/`, the tokens in `docs/`, the SVG masters in a
root `src/` that held nothing else, the rendered logos in three places at once,
and the build scripts inside the directory that publishes the website.

| Directory | Holds | Edit? |
|---|---|---|
| `src/logos/` | the three SVG masters — every raster is rendered from them | yes |
| `src/styles/` | `colors_and_type.css` (the deliverable) and `theme.css` | yes |
| `src/tokens/` | the same tokens as typed TS modules, hand-mirrored | yes |
| `src/styles/fonts/` | six Satoshi cuts and `fonts.css` | the CSS only |
| `src/components/` | every component, helper and icon the system ships | yes |
| `src/captured/` | the eight files copied from codecave.pro | **never** |
| `docs/` | the website, and the published brand kit | pages, yes |
| `tools/` | every build and check script | yes |
| `packages/brand/` | the npm package — a pure derivative | **never** |
| `dist/` | the built website, gitignored | never |

Three of the paths a consumer links — `colors_and_type.css`, `tokens/` and
`fonts/` — are authored under `src/` and *published* into `dist/` at the URLs
they have always had. `tools/astro-passthrough.mjs` holds that map in
`PUBLISHED` and asserts the copy arrived; `check:links` and `check:examples`
**read** the same map rather than restating it, because both broke the day the
files moved and both were wrong about correct deliverables.

**Nothing here needs a codecave.pro checkout.** `build-storybook.mjs` borrowed
that repo's node_modules for its toolchain until 2026-08-26, on the argument
that a specimen must be built with the versions the *website* builds with — an
argument that died with the inversion, since the site is the consumer now. Every
module is declared here and pinned to match, and the switch was byte-neutral:
all twelve bundles and `tw-bridge.css` came out identical. Two optional reads
remain, both of which say when they are skipped — `check:collisions` sweeping
the site's SFCs, and the sanitizer port's dompurify pin. CI no longer checks that
repo out, and `CODECAVE_PRO_TOKEN` is unused.

`npm run build:assets` needs Inkscape and ImageMagick and will not run on a
stock Windows checkout. That is why the rendered ramps are tracked: they are the
record of the last run.

## Where open work lives — read this before assuming there is none

**Jira is the only list.** This repo used to keep a `TODO.md`; it was deleted on
2026-08-20 once its contents were filed, so *the absence of a to-do file in this
repository does not mean the work is done.*

Open items for the brand package, all in
[CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) under the **`brand-kit`**
label ([live query](https://codecave.atlassian.net/issues?jql=project%20%3D%20CCWEB2%20AND%20labels%20%3D%20%22brand-kit%22%20ORDER%20BY%20key%20ASC)):

-   [CCWEB2-340](https://codecave.atlassian.net/browse/CCWEB2-340) — build tooling sits in `dependencies`, so every advisory against it reads as production. **This repo is already clean** — everything is a devDependency and `packages/brand` declares no dependencies at all — so it is live only against codecave.pro, where `astro`, the `@astrojs/*` integrations, `@tailwindcss/vite` and `sharp` are all runtime deps. Labelled `brand-kit` but now purely site-side.

CCWEB2-318, the epic that inverted the direction of truth, closed on 2026-08-25
with the 2.2.0 release. What it established is architecture now and is described
below rather than tracked as work.


Open bugs in what codecave.pro ships, found while resyncing the captures or
while working on the site itself. **These are the site's to fix, not the
package's** — do not "correct" them in `docs/`. A bug leaves this list the
moment it is fixed; Jira keeps the history, so nothing here is a record:

-   [CCWEB2-320](https://codecave.atlassian.net/browse/CCWEB2-320) — `TextField.vue`'s error message renders at 2.91:1. Accessibility, and a colour decision, so it is **assigned to Maria Shaban**.

### What the package ships, and what a consumer must do

**The fonts are settled.** The package declares ten `@font-face` rules — 300/400/500/700/900, upright and italic, every weight Satoshi has — and codecave.pro declares the same ten. **The binaries are still not in the tarball**: that is a redistribution question, recorded in `build.mjs`, and no release changes it. The vendor's own `stylesheet.css` is unusable and both stylesheets say why next to the declarations.

**A consumer that installs the components has to put the package back in Tailwind's scan.** Automatic content detection skips `node_modules` and this package ships Vue source, so a utility used only inside an installed component is never emitted — with no error anywhere: the build succeeds, the typecheck passes, and the elements render unstyled. One `@source` line fixes it, the package `README.md` says so, and codecave.pro's `check:classes` fails the build when it is missing (CCWEB2-360).

### How a change here reaches the site

The version mechanic stays true and is the thing to remember — CI installs with `pnpm install --frozen-lockfile`, so the site runs whatever its lockfile pins and nothing moves it on its own. A token change here reaches the site only when someone raises the range and regenerates the lockfile. pnpm's `minimumReleaseAge` guard used to add a day on top of that, and no longer does: codecave.pro's `pnpm-workspace.yaml` exempts this package as a whole, with an entry naming no version at all. Every *wildcard* spelling is still rejected — `@codecavepro/brand@*`, `@x`, `@>=0.0.0` — which is why both repos said for a while that a whole-package exemption was unavailable. It is the wildcards that are unavailable; an entry with no version predicate is a different thing and pnpm accepts it.

`check-captures.mjs` was deleted on 2026-08-25, along with its npm script and
its release gate. The reason is the version mechanic above: the site installs
this package and pins it, so it lags by design. Components are developed
here, tried in the storybook here, published, and only then does the site
bump — which means a check demanding the two be equal was red for exactly the
changes it existed to protect, and green only when there was nothing to
release. It had already narrowed itself: 37 of the then-51 files under
`src/captured/` had no upstream left, and it reported them as "frozen by
definition".

**A component that reaches for one company's data does not belong here, and
that is a different test from what it is written in.** A component ships once
its reach becomes props — `items`, `serviceLinks`, `ctaHref`, `basePath`,
`logo`, `resolveImage`, an `ICrmFormClient`. A footer carrying an EIN, a street
address and a schema.org LocalBusiness graph, or a section calling a CMS for six
known record ids, has nothing left underneath the data; those are assemblies OF
shipped parts, not parts.

### The docs site is Astro

Finished under [CCWEB2-317](https://codecave.atlassian.net/browse/CCWEB2-317) on
2026-08-21, so it is architecture now rather than open work. **Sources stay in
`docs/`, output goes to gitignored `dist/`, and Pages deploys `dist/`.** Every
page is an `.astro` under `docs/pages/`, and everything else in `docs/` is
payload that passes through — which `tools/astro-passthrough.mjs` asserts
every build, both halves being silent when they fail.

**There are three browsable surfaces, and that is the shape to hold in mind.**
`guides/` asks what the rules *are* — the four prose files, rendered; the other
two ask whether the work obeys them. `kitchen-sink/` asks whether a *part* is
right, 25 specimens from tokens through live components on one hub; `examples/`
asks whether the parts *compose*, as six deliverables behind a gallery. `MAIN` is
in that reading order: prose, part, composition.

It used to be five surfaces, then two. A brand page, `preview/`, `storybook/`,
`artifacts/` and two indexes over them collapsed to `kitchen-sink/` and
`examples/` with the brand page folded into the front door as anchors — 30 routes
became 34, the surfaces collapsed and the content did not. `guides/` then took it
to 39, and that one went the other way: the content already existed and had no
surface at all. **`docs/storybook/` still exists and serves no pages** — it is
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
build renders and what it copies -- 152 of them. Frontmatter is excluded
deliberately: imports above the fence are Astro's, resolved at build time against
the *source* tree, so judging both by one rule reports every layout import as a
dead file. Separately, a page importing a bare specifier must pass `importmap` to
`DocPage`, and a page passing it must import one -- the layout emits the map only
on request, so a specimen without it fails on `import ... from 'vue'` in the
browser and nowhere else. **This is the check that matters when a page MOVES**: a
relative path that was right at the old depth is wrong at the new one and still
looks perfectly reasonable.

**Four of the 39 routes are Starlight's, and everything about that arrangement
is deliberate.** [STARLIGHT.md](/STARLIGHT.md) has the measurements behind every
line of it, and is worth reading before touching `docs/starlight.css`, the
loader or the overrides: **every fault this integration hit was silent**, and
four of them had to be found by measuring the rendered page rather than by
reading a build log. That is the standing cost of running a shell this repo does
not own. `docs/content.config.ts` renders `DESIGN.md`, `README.md`,
`SKILL.md` and `guide.md` **where they already sit** — they are payload, cited by
path from eight files, and two of them carry frontmatter belonging to other
systems (`SKILL.md`'s is Claude Skill metadata, `DESIGN.md`'s is a token
manifest). So the loader synthesizes the title and never touches a file. Two
things there look optional and are not: the data must go through `parseData()`,
or the entries store and render nothing at exit 0; and the titles are a **map**,
because three of the four open with the same `# heading`.

**`guides/index.html` is a hand-built `DocPage`, not a Starlight page.** Starlight
renders no section index, and autogenerating one would mean authoring prose inside
the loader. A static route beats Starlight's injected `[...slug]`, which the
passthrough check asserts every build.

**The four guides carry this site's chrome, both tiers, from the same
`menu.ts`.** `docs/starlight-overrides/Header.astro` renders `DsNav` and
`SubNav`; `Sidebar.astro` renders nothing, because an autogenerated sidebar comes
out empty here *and* would duplicate the sub-nav. `docs/starlight.css` is the
whole reconciliation and every rule in it carries the measurement that forced it —
`--sl-nav-height` derived from `--ds-bar` rather than left at one bar's worth, and
the header dropped out of `position: fixed` below 768px so the bars scroll away as
they do everywhere else.

**`DocPage` cannot run for a Starlight route, so `check:links` asserts the
mechanism that replaces it** — the config names the override, the override renders
both tiers — and derives the four collection routes from `content.config.ts` so
`/guides/*` is inside the dead-link check rather than exempt from it. It also
asserts `menu.ts` and the collection agree in **both** directions: a slug the bar
names and nothing renders, and a guide that renders and is in no bar. The second
is the orphan case, which is what the four pages were before the surface existed.

One rule survives the migration and is in [CONTRIBUTING.md](/CONTRIBUTING.md)
with its reason, and it bites when adding a page: a `.html` at the same path
wins over the `.astro`, so writing one page in both forms leaves the `.astro`
dead — Astro's own behaviour is a `WARN` and exit 0, and the passthrough check
fails the build instead.

**The rule that used to sit beside it said the storybook specimens are not Astro
islands and must not become them. It is reversed, and the reversal is the point
of the current arrangement.** A specimen mounted `storybook/compiled/*.js` in the
browser through an import map, so that a reader saw what codecave.pro shipped
rather than a rebuild of it; `is:inline` on both tags was what kept that true.
That argument rested on this repository being downstream, and it has not been
since 2026-08-25. The components are authored in `src/` and the site installs the
package built from them, so **compiling a specimen from source is showing what
ships** — and mounting a prebuilt bundle instead shows whatever the last package
build produced. The practical half is the reason it changed: a specimen that
imports the `.vue` hot-reloads while you edit the component, and a prebuilt
bundle never can.

So a specimen page is now an ordinary `<script type="module">` importing
`../../../src/components/…`, `@astrojs/vue` compiles them, and `DocPage` no
longer has an `importmap` prop. **`build:storybook` still runs and still writes
`compiled/*.js`** — `ds-bundle/` consumes them for a Design project that cannot
run a bundler. It is simply no longer what this site mounts.

**That leaves three resolvers on a page, and `check:links` judges a reference by
whichever owns it.** Above the fence is Astro's, at build time, against the
source tree. A `<script>` *without* `is:inline` is Vite's — also build time, also
the source tree. Everything else, `is:inline` scripts included, is the browser's
at request time against the *output* tree. Those are different depths, so one
path is right for one and quietly wrong for the other: the conversion moved four
`placeholders.js` imports from correct to broken without changing a character of
them, and this is the check that said so. The old pairing it replaces — "a page
importing a bare specifier must pass `importmap`" — is now the opposite
assertion, that no `is:inline` script may import a bare specifier, because
nothing resolves one any more.

**The vendored runtime map is checked against the bundles, both ways, and against
the disk.** `vue` and the gsap entry points are left external by esbuild, so
something has to resolve them for whatever mounts a bundle — and the mapping is
a judgement rather than arithmetic (`vue` is one of half a dozen builds in the
package; `gsap` is a directory). A capture moving to a different entry point of
the same package silently kills every specimen: nothing errors, the page renders,
the canvas is simply empty. `npm run check:importmap` reads the bare specifiers
out of `storybook/compiled/*.js` and the keys out of `tools/storybook-vendor.mjs`
and fails on either mismatch, **and on a mapped file that is not in
`docs/vendor/`** — the DocPage version compared two lists of names, so a map
entry pointing at a runtime nobody committed passed cleanly and 404'd in the
browser. Both inputs are committed, so it needs no site checkout and runs in CI.

**A layout may not derive a page's depth from `Astro.url.pathname`.** With
`build.format: 'preserve'`, a directory index is requested at `/storybook` in
dev and emitted at `/storybook/` by the build, so the same page counts a
different number of levels in each mode — and nothing else in the request
separates an index from a leaf. `DocPage.astro` asks `import.meta.glob` which
pages are `index.astro` instead; Vite resolves that at transform time, so it is
the same static list in both modes.

### `tw-bridge.css`, and why a component edit fails the build

**`docs/storybook/tw-bridge.css` is generated, and it carries a fingerprint of
the component sources in its own header.** Change anything under
`src/components/` or `src/captured/` without regenerating it and
`npm run check` fails, CI fails, and the Pages deploy stops. That is the whole
mechanic; the rest of this section is why it is worth the friction.

**What the file is.** `tools/build-storybook.mjs` writes it beside the twelve
`storybook/compiled/*.js` bundles: the site's Tailwind v4 theme compiled
against *exactly* the utility classes the component templates use, plus the
site's `:root` and `@theme` tokens scoped to `.sb-canvas, .sb-mount`. It is a
**derivation of the components**, never an input to them.

**What still reads it, and what no longer does.** `ds-bundle/` does — a Design
project that cannot run a bundler, so it needs the utilities pre-compiled.
**The docs site does not**: its specimens are Vite-compiled from source against
`docs/tailwind.css` since the reversal described above. So the bridge now
serves one consumer, and the digest guards it and the twelve bundles together.

**The digest.** Line 10 of the file is `source-digest: sha256:<64 hex>` — a
sha256 over every byte of every file under **both** roots, with path names and
each root's own name folded in. `tools/check-tw-bridge.mjs` recomputes it from
the working tree. `check:tw-bridge` is in `npm run check`, and it is also the
**first step of `static.yml`**, unconditional and depending on nothing but node.

**Why a digest instead of trusting people to rebuild.** A stale derivation does
not announce itself. It compiles, it loads, and the specimen goes on rendering
an earlier version of the component sitting beside it on the same page. Nothing
else in this repository would ever catch that.

Three properties surprise people, and each is a real trap:

-   **It hashes bytes on disk, not tracked content.** An untracked or ignored
    file under either root moves it. The failure says so explicitly, because the
    git-based "what changed" hint reports *no change* in exactly that case.
-   **It covers both roots, keyed by name.** MOVING a file between
    `src/components/` and `src/captured/` changes no bytes and still moves the
    digest — deliberately, because that move is a claim about whether the file
    is authored, and **the directory name is the claim**.
-   **Line endings are content.** The same commit checked out CRLF and LF hashes
    to two different values, which is what `.gitattributes` (`* text=auto
    eol=lf`) exists for. **When the check reports a line-ending difference, do
    NOT regenerate** — that records your machine's convention and fails on the
    other one. It cost 36 consecutive Pages deploys on 2026-08-20/21, every one
    of them green locally. The check detects the case and says to fix the
    checkout instead of sending you to the generator.

**What a stale bridge does NOT mean: anything about codecave.pro.** The site
installs this package at a pinned version and is *supposed* to lag between
releases. The message used to blame an "older site" and that stopped being fair
when the direction of truth flipped.

**The workflow — two commands and one habit:**

1.  Edit under `src/components/` or `src/captured/`.
2.  `npm run build:storybook`. It rewrites the twelve bundles and the bridge,
    new digest included, and needs **no codecave.pro checkout**.
3.  **Commit the regenerated output in the same commit as the component
    change.** All thirteen files are tracked; splitting them leaves a commit
    that fails its own check.
4.  `npm run check` before pushing.

Running the generator when nothing has changed is a safe no-op — the output is
byte-identical, which is how the codecave.pro decoupling was proved.

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

Related rule: **nothing under `src/captured/` is authored** — which,
since the components moved to `src/components/`, is a claim about eight files
rather than a rule spanning the whole component tree.

### The package, in one paragraph

`packages/brand/` is a **pure derivative of `src/`** — it copies
`src/styles/colors_and_type.css` and `src/styles/fonts/fonts.css` byte-for-byte, copies
the root `LICENSE`, copies the components out of `src/components/` and
`src/captured/`, extracts `tokens.css` from `colors_and_type.css` and
`theme.css` from `src/styles/theme.css`, and compiles `src/tokens/*.ts`. No
*design content* under `packages/` is authored; the only tracked files are its
manifest, build script and `README.md`, and `npm run check` asserts the
byte-identity of every copy. **`src/` is the single origin; edit there, never in
`packages/` and never in `docs/`.**

**The package ships no brand marks, and that is now a decision rather than an
accident.** `logo.svg` was only ever in the tarball because a menu imported it,
and it left with the menus in 2.0.1. `BrandNav.vue` takes the wordmark as a
`logo` prop — a URL the consumer resolves through its own asset pipeline — so
the bar can be shared without the package distributing the mark. Same shape as
the font binaries, which stay out for a different reason (redistributing
third-party type), and the two answers agree about what "the brand kit ships":
the system, not the assets.

**`src/components/` is the root anyone writes into, and as of 2026-08-25 it holds
every component.** It began as a home for `BrandNav.vue` alone, which has no
upstream to be captured from — it is the site bar and the docs bar reconciled, so
neither repo owns it. Everything else joined it once the same became true of them:
37 files with no upstream left, sitting in a directory whose name said they were
copies of something. `src/captured/` keeps the eight that really are.

Two directories rather than a flag, because the rule that nothing under
`src/captured/` is authored stops being checkable the moment the two sit side
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
the table in `tools/import-aliases.mjs`, which is also read by
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
non-excluded `.vue` under either root as a root and follows everything it
*reaches* transitively — *in the layout the package ships*, and **that layout is
now a mirror of the source**: `dist/src/common/Button.vue` for
`src/components/common/Button.vue`, one file to one file. A reference that lands
outside the package fails the build and names itself.

**It ships as a mirror because it did not, and that cost a day.** `dist/src/`
used to re-insert codecave.pro's `src/components/` level, so a component under
`src/components/common/` imported `../../assets/…` — a path correct only *after*
the build re-rooted it. The sources were therefore unimportable by anything
without that resolver: Vite could not resolve them, and `astro dev` reported
them as missing npm packages. Mirroring makes `../assets/…` right in **both**
places, and `exports` absorbs the change — `./components/*` maps to `./dist/src/*`,
so `@codecavepro/brand/components/common/Button.vue` still resolves for a
consumer. `components` is a name in the export map now, not a directory. So a component is added by capturing it, and the only
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
resolves here anyway — this repo declares every one of them as a devDependency
so the storybook can compile — and fails in the consumer's build, the one place
nobody would look. So `build.mjs`
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

**Publishing is a pushed tag, and nothing else.** `git push origin 2.2.0` runs
[`.github/workflows/release.yml`](/.github/workflows/release.yml), which verifies
and then publishes as an npm **trusted publisher** — OIDC, so there is no token
in this repository, no `NPM_TOKEN` secret and no OTP. Two consequences worth
holding: **the workflow's FILENAME is part of the credential** (npmjs.com matches
org + repo + `release.yml`, so renaming the file revokes publishing and npm
reports it as a 404 on the PUT, which reads like a missing package), and **the
tag IS the version**.

`packages/brand/package.json` is committed as `0.0.0` and stays there.
`tools/stamp-version.mjs` writes the tag into it during the release — as its own
workflow step after `npm ci`, and again in `release:package` — so there is no
second place to bump and nothing to forget. **It is not a `prepack` hook,**
which is where it belongs by shape and is wrong by behaviour: npm resolves the
tarball's FILENAME from the manifest before prepack runs and packs the manifest
as prepack left it, so a prepack stamp yields `codecavepro-brand-0.0.0.tgz`
whose `package.json` says `2.3.0`. Which of the two the registry would believe
is not a thing to learn by burning a version number. The script carries the
measurement.

This replaced an assertion that the tag equalled the manifest, which a human
kept true with a hand-run `npm version`. It could only ever be a tripwire on a
step people forget, and 2.3.0 is where it caught one — tag 2.3.0, manifest
2.2.0, release refused. A manifest at `0.0.0` also means **a local build is
unpublishable by construction**, which is the right default for the one command
that cannot be undone.

The workflow reruns every check plus one that only makes sense against the
artifact: `tools/smoke-tarball.mjs` installs the packed tarball and asks it
eighteen questions — the last being that the stamped version reached the
artifact. That is not duplication of `npm run check` — `files`,
`exports` and npm's by-name pickup of `LICENSE`/`README.md` are all invisible to a
check that walks `dist/` in place, so a package can be correct on disk and broken
for everyone who installs it. Its reference walk **mirrors `referencesOf()` in
`build.mjs` by copy; keep the two in step.**

**The release has no capture gate, deliberately.** It briefly did; see the note
where that step used to be in `release.yml`. A release is the moment this
repository is furthest ahead of the site, so a check requiring the two to match
would fail every real release.

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

[WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) is the component and token review,
mirrored as CCWEB2-270…310. **Its findings are mostly OURS now** — it was
written when the components were the site's, and they now live in
`src/components/` and ship in the package, so a component remark is this
repository's to fix and reaches the site at its next bump. Only remarks about
files the site still owns are the site's.

**Its section numbers must not be renumbered.** They are cited by number from
the shipped `src/styles/colors_and_type.css` and from `docs/DESIGN.md`; the list
starting at section 2 is deliberate, because section 1's only finding was
fixed and deleted.

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