# Starlight — CCWEB2-374

This started as a spike and is now a working adoption on
`spike/starlight-ccweb2-374`. The branch name is kept because CLAUDE.md and the
Jira ticket cite it.

**It is still not merged, and merging it is still a decision.** What changed is
what the decision is about: no longer "would this work" — it does — but whether a
third surface and a Starlight dependency are wanted. Everything below was
measured on the branch, at `@astrojs/starlight` **0.41.8** against `astro`
**7.2.4**.

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
ports (`types: []` instead).

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

## What I would still not do

**Do not let Starlight own the 34 hand-built pages.** Nothing here suggests it
would be an improvement, and `format: 'preserve'` exists precisely because those
URLs are cited 35 times, once from inside the shipped `colors_and_type.css`.

## Reproducing

```bash
git checkout spike/starlight-ccweb2-374 && npm install && npm run docs:build && npm run check
```

Then look at `/guides/`, `/guides/design-rules`, and `docs/starlight.css`, where
every reconciliation above is written next to the measurement that forced it.
