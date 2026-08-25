# Starlight spike — CCWEB2-374

A **spike, not a decision.** This branch (`spike/starlight-ccweb2-374`) exists to
replace a recommendation I made from reading with one made from building. It
should be read, argued with, and then either merged deliberately or deleted.

Everything below was measured on this branch, at `@astrojs/starlight` **0.41.8**
against `astro` **7.2.4**.

## The headline

**It works, and my earlier analysis was wrong.**

I previously said Starlight would collide with `build.format: 'preserve'`,
because Starlight branches on `format === 'file'`. Half of that is true and the
conclusion drawn from it was not. `preserve` is a **named strategy** in
Starlight's `createPathFormatter` — but it is aliased to `directory`, and *that*
is what breaks it, not a missing case:

```js
const formatStrategies = {
  file:      { addBase: fileWithBase, handleExtension: ensureHtmlExtension },
  directory: defaultFormatStrategy,
  preserve:  defaultFormatStrategy,   // ← same object as directory
};
```

Out of the box that yields **three disagreeing spellings of one page**:

| | value |
|---|---|
| file emitted | `dist/guides/spike.html` |
| sidebar link | `/guides/spike/` — **404** |
| `<link rel=canonical>` | `…/guides/spike.html/` — a trailing slash after `.html` |
| sitemap `<loc>` | `…/guides/spike` — a third spelling |

**And the build succeeds.** Nothing warns. Only clicking a link finds it. That
is the failure class this repo keeps writing checks for.

## One line fixes it

```js
build: { format: 'preserve' },
trailingSlash: 'never',
```

| | before | after |
|---|---|---|
| sidebar link | `/guides/spike/` | `/guides/spike` |
| canonical | `…/spike.html/` | `…/guides/spike.html` |
| sitemap | `…/spike` | `…/guides/spike` |
| build | 0 errors | 0 errors |

That relies on the host serving `/guides/spike` for `guides/spike.html`.
**Verified against the live host** rather than assumed — `brand.codecave.pro`
(Cloudflare in front of Pages):

```
200  /kitchen-sink/button.html   <title>Button — CODECAVE storybook
200  /kitchen-sink/button        <title>Button — CODECAVE storybook   ← same page
404  /kitchen-sink/definitely-not-a-page                              ← real 404
```

The 404 matters: it proves the 200 is a real file and not a catch-all.

## The two alternatives are worse, and the repo already knows it

Both formats that make Starlight work out of the box **fail this repo's own
passthrough check**, which is a pleasant confirmation that the guard earns its
keep:

| `build.format` | site | Starlight | build |
|---|---|---|---|
| `preserve` | fine | links 404 | **succeeds — silently wrong** |
| `directory` | 30 leaf pages move to `x/index.html` | fine | fails |
| `file` | 2 index pages move to `x.html` | fine | fails |

So `preserve` + `trailingSlash: 'never'` is not a compromise; it is the only
combination where both halves are correct.

## The header override — what you asked about

**It works.** `components: { Header: './docs/starlight-overrides/Header.astro' }`,
rendering `BrandNav.vue` with no client directive, exactly as `DsNav` does on the
34 hand-built pages:

```
rendered links:  ['Kitchen sink', 'Examples']
logo href:       ../index.html
leaked attrs:    none
```

One trap on the way: my first attempt guessed the prop names (`leftItems`,
`ctaHref`). Vue does not error on unknown props — it renders them as literal
lowercased HTML attributes, so the bar came out with `ctahref="…"` on the
element and **two empty `<ul>`s**. It looked plausible in a grep, because
`brand-nav-link` still appears three times in the scoped `<style>` block. The
real props are `left` / `right` / `logo` / `logoHref`.

## Visual integration is close to free

`customCss: ['./docs/colors_and_type.css']` and the page is CODECAVE:

| | value |
|---|---|
| `--color-surface-primary` | `#0a0a0b` — beats Starlight's `--sl-color-bg: #17181c` |
| body background | `rgb(10, 10, 11)` |
| body font | Satoshi |
| nav link height | `48px` — the `--control-height` grid |
| `h1` | 56px Satoshi — `--text-heading-lg` |

## The actual goal: rendering the real prose

This is the whole case for adopting Starlight — `DESIGN.md`, `README.md`,
`SKILL.md` and `guide.md` are **1,601 lines that render as no pages at all**
today, only as downloadable payload.

(That number is measured, not inherited. `CLAUDE.md` says 1,565 and is out of
date — a separate one-line fix on `development`, not this branch's business.)

**It works, with the files untouched.** All four now build:

```
/guides/design    117 KB   13 <h2>
/guides/readme     72 KB   10 <h2>
/guides/skill      31 KB    6 <h2>
/guides/guide      21 KB    4 <h2>
```

The obstacle, and it is real: **two of the four already have frontmatter, and it
is not Starlight's.**

- `docs/SKILL.md` — `name` / `description` / `user-invocable`. Claude Skill
  metadata; `user-invocable: true` is what makes it a slash command.
- `docs/DESIGN.md` — `name` / `category` / `surface` / `colors`. A token manifest.

`docsSchema()` requires `title`. Writing one into these files would edit blocks
other tools read, in files that ship as payload and are cited by name. So
`docs/content.config.ts` **synthesizes** the title in a custom loader instead.
Nothing on disk changes — verified with `git status` after a full build.

Two things that each cost a build to find, both recorded in that file:

1. **The data must go through `parseData()`.** Setting `data` on the store
   directly stores the entries — the loader reports four successes — and
   Starlight renders none of them, because the schema never ran. No error, no
   page, exit 0.
2. **Deriving the title from the first `# heading` is not good enough.** Three of
   the four open with `# CODECAVE Design System`, so three sidebar entries and
   three search results come out identically named. Left wrong on purpose in the
   loader so the finding stays visible. A real adoption needs a title map.

## Costs, all fixable, all silent by default

**1. It would have served this site's own source.** `publicDir` and `srcDir` are
both `docs/`, so `content.config.ts`, the collection markdown and the header
override were all copied to `dist/` and served — payload went 197 → 200. Fixed by
adding them to `OWNED` in `astro-passthrough.mjs`, which deletes Astro-owned
paths after the build. Back to exactly 197.

**2. It breaks `check:ports`.** Starlight pulls in `@types/mdx`, whose
`types.d.ts` references a `JSX` namespace nothing here provides — four errors in
a file no adapter imports. `skipLibCheck: true` would silence it and is
*precisely* what that tsconfig's comment says must not happen, since strict lib
checking is what makes the adapters ports rather than stubs. Fixed with
`"types": []`, which scopes auto-included `@types` without weakening
`skipLibCheck: false`.

**3. Starlight pages ship JavaScript.** 11 `<script>` tags against 3 on a
hand-built page — theme select, table of contents, mobile menu, Pagefind. The
repo's standing property that *"BrandNav needs no JavaScript by construction"*
holds for the bar itself but **not** for the page around it. It also adds a
Pagefind search index and a sitemap, neither of which existed before.

**3a. The search index does NOT swallow the rest of the site — checked, because
the build line reads as though it might.** Pagefind logs *"Found 44 HTML
files"*, which is every page in `dist/`: the 34 hand-built ones and the six raw
deliverables included. It **indexes four**, verified by decompressing
`dist/pagefind/fragment/` and reading the `url` out of each — the four guides and
nothing else. Starlight scopes indexing to its own `data-pagefind-body`, so a
storybook specimen or `examples/raw/poster.html` is scanned and discarded rather
than turned into a search result. Worth knowing that the alarming number is fine.

One genuine wrinkle underneath it: the indexed URL is `/guides/skill.html`, while
the sidebar links `/guides/skill`. Both resolve on the host, so nothing breaks —
but search results and navigation address the same page by different strings, and
a future canonical-URL rule would have to pick one.

**4. `check-links.mjs` cannot see Starlight routes.** It derives the route set
from `docs/pages/**`, and Starlight's come from a collection. So `/guides/*` is
invisible to the dead-link check, and the "every page imports DocPage" assertion
silently exempts them. A real adoption needs that check taught about the
collection, or the 35 citations it guards stop being fully guarded.

## What I would do

**Adopt it for `/guides/` only, or not at all — but the earlier "don't migrate"
was based on a blocker that turns out to be one config line.**

The case for: 1,601 lines of the best-written prose in this repository currently
render as nothing. Starlight gives them navigation, search and a table of
contents for roughly 40 lines of config, and the brand survives intact.

The case against, honestly: four silent failure modes had to be found by hand in
one afternoon, three of them invisible to a green build. That is the same tax
this repository has been paying down all week with checks, and adopting Starlight
adds surface that none of those checks currently cover — item 4 especially.

**Do not** let Starlight own the 34 hand-built pages. Nothing here suggests that
would be an improvement, and `format: 'preserve'` exists precisely because those
URLs are cited 35 times, once from inside the shipped `colors_and_type.css`.

## Reproducing

```bash
git checkout spike/starlight-ccweb2-374
npm install
npm run docs:build && npm run check
```

Then look at `/guides/design`, and at `docs/starlight-overrides/Header.astro`.
