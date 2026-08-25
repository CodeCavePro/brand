# Starlight — CCWEB2-374

**Shipped.** This began as a spike to test a recommendation, became a working
adoption, and is on `development`. It was measured at `@astrojs/starlight`
**0.41.8** against `astro` **7.2.4**, and this file is the record of what was
measured rather than an argument for doing it.

It is worth reading before touching `docs/starlight.css`, `docs/content.config.ts`
or the overrides, because **every fault this integration hit was silent** — none
appeared in a build log, and four of them required measuring the rendered page.
That is the standing cost of running someone else's shell, not a set of bugs now
safely behind us.

*(It arrived on `development` by accident before it arrived by decision: a `git
pull` with `pull.rebase = true` rebased the branch onto it. The decision to keep
it was taken afterwards, deliberately.)*

## Why it was worth doing at all

`DESIGN.md`, `README.md`, `SKILL.md` and `guide.md` are **1,601 lines that
rendered as no pages at all** — the best-written material in the repository,
reachable only as a file download. They now render at four routes, from the files
where they already live, unmoved and unedited.

## The blocker that was not one

The ticket recommended against migrating because Starlight collides with
`build.format: 'preserve'`. That was wrong, and specifically wrong: `preserve` is
a **named strategy** in Starlight's `createPathFormatter` — aliased to
`directory`, and the aliasing is the whole fault:

```js
const formatStrategies = {
  file:      { addBase: fileWithBase, handleExtension: ensureHtmlExtension },
  directory: defaultFormatStrategy,
  preserve:  defaultFormatStrategy,   // same object as directory
};
```

Out of the box that gives one page four spellings:

| | value |
|---|---|
| file emitted | `dist/guides/x.html` |
| sidebar link | `/guides/x/` — **404** |
| `<link rel=canonical>` | `…/guides/x.html/` |
| sitemap `<loc>` | `…/guides/x` |

**And the build succeeds.** `trailingSlash: 'never'` reconciles all four.

That relies on the host serving `/guides/x` for `guides/x.html`. **Verified
against the live host** rather than assumed — `brand.codecave.pro`:

```
200  /kitchen-sink/button.html   <title>Button — CODECAVE storybook
200  /kitchen-sink/button        <title>Button — CODECAVE storybook   ← same page
404  /kitchen-sink/definitely-not-a-page                              ← real 404
```

The 404 matters: it proves the 200 is a real file and not a catch-all.

The two formats that make Starlight work unaided are worse, and this repo's own
passthrough check says so:

| `build.format` | site | Starlight | build |
|---|---|---|---|
| `preserve` | fine | links 404 | **succeeds — silently wrong** |
| `directory` | 30 leaf pages move | fine | fails |
| `file` | 2 index pages move | fine | fails |

## What the adoption is

**A third surface.** `guides` joins `kitchen-sink` and `examples` in `MAIN`, in
reading order — prose, then part, then composition — and gets a `SUB` bar of its
own. Before this the four rendered pages were **orphans**: nothing on the site
linked to them and they were reachable only by typing the URL. That is exactly
the failure CLAUDE.md warns about for a page that skips the layout, arrived at
from the other direction.

**`guides/index.html` is a hand-built `DocPage`, not a Starlight page.** Starlight
renders no section index, and autogenerating one would mean authoring prose inside
`content.config.ts` — the one thing that loader must not do. So the front door is
an ordinary gallery like `examples/index.astro`, and Starlight owns only the four
long-form pages beneath it. A static route beats Starlight's injected `[...slug]`,
and the passthrough check asserts it every build.

**The chrome is this site's, both tiers.** The `Header` override renders the same
`DsNav` and `SubNav` from the same `menu.ts` as the other 35 pages, and marks the
current guide. There is no second copy of the bar.

**Titles are a map, not the first heading.** Three of the four open with
`# CODECAVE Design System`. The heading is what each document calls the *system*;
the title is what it calls *itself*, and only one of those was written down.

**The files are never touched.** Two carry frontmatter belonging to other systems
— `SKILL.md`'s is Claude Skill metadata, where `user-invocable: true` is what
makes it a slash command, and `DESIGN.md`'s is a token manifest — so the loader
synthesizes the title instead. Verified with `git status` after a full build.

## Four faults found by measuring the rendered page

Not one was visible in a build log. Each was found by asking the browser.

**1. `--sl-nav-height` is the whole layout contract.** Not just the header's
height: also the content offset, the sidebar top, and `scroll-padding-top` for
every anchor. Starlight's default 4rem is *one* bar; this site has two, so it
under-reserved by 82px and **every guide's `h1` rendered underneath the sub-nav**
— h1 at y=136, bar ending at y=158 — on a page that otherwise looked deliberate.
It is derived from `--ds-bar` now, so the reserve cannot drift from the thing it
reserves for.

**2. Starlight's header is `position: fixed` at every width.** Below 768px
`nav.css` deliberately dissolves `.ds-nav-stack` so the two bars scroll away;
sticking them would pin the sub-bar over the content it navigates. The fixed
header reinstated exactly that bug: measured at 375px, the sub-nav wrapped to two
rows, ran 100px past the reserve, and stayed pinned over the article while the
page scrolled underneath. Below that breakpoint the header is an ordinary block
in the flow now, which needs no measured height — a wrapped sub-nav is 125px at
375px and something else at 420px.

**3. The autogenerated sidebar was empty, silently.** `autogenerate` filters
routes on `entry.filePath` relative to the collection directory, **not** on
`entry.id` (`utils/navigation.ts:234`). These entries have ids under `guides/`
and filePaths of `docs/DESIGN.md` — the real files, which is the entire point of
the loader — so every entry was filtered out and the group rendered with its
label and no links. It would have duplicated the sub-nav anyway, so `Sidebar`
renders nothing and the wrapper is collapsed. The theme select went with it,
which is correct: this system documents no light theme and `DESIGN.md` says so.

**4. Pagefind built a search index nothing could query.** Its only UI lives in
the header this site replaces. `pagefind: false` — an index with no way to reach
it is the kind of claim this repository checks rather than makes. Search is a
feature decision, not a side effect.

Two more, fixed earlier in the branch: `publicDir` was serving this site's own
source (`OWNED` in `astro-passthrough.mjs`), and `@types/mdx` broke `check:ports`
in a way `skipLibCheck: true` would have "fixed" by deleting the reason ports are
ports (`types: []` instead). That second one was fixed where it was *seen*, not
where it *was* — see below.

## What the checks learned

The spike's one unfixed cost was that `check-links.mjs` derives routes from
`pages/` and cannot see a collection, so `/guides/*` sat outside the dead-link
check. That is closed, and closing it turned up a gap that predates Starlight:

- It derives the four collection routes from `content.config.ts`, and asserts
  every prose file that config names still exists.
- It asserts `menu.ts` and the collection agree **in both directions** — a slug
  the bar names and the collection does not render, and a guide that renders and
  is in no bar.
- It checks navigation targets that are **pages** rather than anchors. Nothing
  did: the assertion only ever matched hrefs containing `#`, so the six
  `examples/*.html` targets had never been verified either.
- `DocPage` cannot run for a Starlight route, so it asserts the mechanism that
  replaces it: the config names the override, and the override renders both tiers.

All seven were verified by breaking them one at a time. Six failed on the first
try; **the seventh passed and should not have** — `includes('<SubNav')` is
satisfied by `<SubNavX`, so renaming the component slipped straight through the
assertion written to catch it. It is a tag test now. Same mistake `usesAlias()`
was fixed for, from the other side.

## What it costs

- **A dependency**, and its tree, for four pages.
- **JavaScript on those four pages.** 7 script tags against 1 on a hand-built
  page — down from 11 before the sidebar and Pagefind came out, but not zero;
  the table of contents is a custom element. *BrandNav needs no JavaScript by
  construction* still holds for the bar. It does not hold for the page around it.
- **A shell this repo does not own.** All four faults above were Starlight's
  layout assumptions meeting this site's, and all four were silent. That class of
  problem does not end here; it is the standing cost of the integration.
- **A dependency tree this repo does not own, in a shared workspace.** Its
  transitive `@types/mdx` broke the *package* build, which has nothing to do with
  the docs site. Loud rather than silent, and the second half of it was still
  missed — see below.

## What I would still not do

**Do not let Starlight own the 34 hand-built pages.** Nothing here suggests it
would be an improvement, and `format: 'preserve'` exists precisely because those
URLs are cited 35 times, once from inside the shipped `colors_and_type.css`.

## Three things that were fixed after it shipped

**Pagination is off.** Starlight's prev/next footer formats links through
`createPathFormatter`, which under `preserve` drops the extension —
`/guides/design-rules`, not `/guides/design-rules.html`. The live host resolves
that and I verified it does, but nothing else here does: every other link on this
site carries `.html` precisely so a page still opens from disk, which is how the
deliverable wrappers get reviewed. It was also a third navigation for four pages
the sub-nav already lists in the same order.

**`DESIGN.md` had a dead link.** It cited `WEBSITE-REVIEW.md` as
`/WEBSITE-REVIEW.md` — root-absolute to a repo-root file the site does not
serve. The same file names it three other times as plain text and now does so a
fourth. `check:links` did not catch it because it is not a `.html`.

**It was dead only in the rendered guide, and that is why it survived.** GitHub
rewrites a root-absolute markdown link against the REPOSITORY root — measured:
`/CONTRIBUTING.md` in `CLAUDE.md` renders as
`/CodeCavePro/brand/blob/development/CONTRIBUTING.md` — so this spelling works
everywhere these files were read before the guides had a surface, and works in an
editor too. It broke the moment `DESIGN.md` became a page on a site that serves
no `/WEBSITE-REVIEW.md`. Root-absolute is the right form in the repo-root
documents, which is why `CLAUDE.md`, `CONTRIBUTING.md` and `RELEASING.md` keep
using it; it is the wrong form in a file Starlight renders.

Both of those were found by fetching every reference on all 39 pages — 727 of
them — not by looking at pages. That sweep now reports zero broken references and
72 images that decode.

**`@types/mdx` was breaking the tarball build too, and blocking the publish.**
The branch fixed `check:ports`, which is where the four `Cannot find namespace
'JSX'` errors were seen. They were not confined to it: TypeScript auto-includes
every `@types/*` package it finds walking up from a tsconfig, and both tsconfigs
in this repo walk up to the same root, so `packages/brand/tsconfig.json` swallowed
it as well. `npm run build` failed on a file no token module imports — and since
`prepack` runs that build, so would `npm run release`. It carries the same
`types: []` now, and each config's comment names the other.

**This is the shape to expect from the dependency, not a one-off.** Nothing under
`packages/` changed; a docs-site integration reached across the workspace and
broke the package's build. That is the third bullet under *What it costs*, and
this is what it looks like when it is not a layout problem.

## Reproducing

```bash
npm run docs:build && npm run check
```

Then look at `/guides/`, `/guides/design-rules`, and `docs/starlight.css`, where
every reconciliation above is written next to the measurement that forced it.
