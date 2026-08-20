# Building `docs/` with Astro

A proposal, not a decision. It asks whether the documentation site should be
built with the same stack it documents — Astro 7 + Vue 3 + Tailwind 4 — instead
of being thirty hand-maintained HTML files.

Nothing here has been implemented. Read §6 for the phases and §7 for what could
go wrong.

---

## 1. Why

The doc pages have been copied from each other for long enough that the
duplication is now measurable, and it has started spreading into the comments.

| Duplicated thing | Where it lives today |
|---|---|
| The global nav | 14 lines of identical markup in **30 files**, varying only by `../` depth and which link carries `aria-current` |
| The callout | **four** implementations: `.pv-warn`, `.pv-note.is-warn` (same file, different rules), `.sb-note.is-warn`, `.bk-note` |
| The page header | three: `.pv-head`, `.sb-head`, `.bk-masthead` |
| The section block | three: `.pv-block` (56 uses), `.sb-section`, `.bk-section` |
| Recessive metadata | two: `.pv-meta` (151 uses across 12 files), `.bk-meta` |
| Swatches and tiles | `.pv-swatch` (111 uses, all in one file), `.pv-tile` (28 across 10), plus brand-kit's parallel `.bk-role` / `.bk-ramp` / `.bk-step-chip` |

`preview.css` says it plainly on line 55: *"Same idiom as `.sb-note.is-warn` in
the storybook."* The code already knows.

The sharper tell is that the *reasoning* is being copy-pasted, not just the
rules. `.pv-meta` carries "Preview chrome recedes by size and family, not by
contrast"; `.bk-meta` carries "Metadata recedes by size and family, not by
contrast". The DESIGN.md §10.5 eyebrow-contrast argument is written out twice,
in `preview.css` and again in brand-kit's `.bk-eyebrow`. When two files need the
same paragraph of justification, they are one component that has not been
written yet.

**Astro components render to static HTML at build time with no runtime JS.** The
nav becomes `<DsNav current="foundations" />` and emits exactly the markup that
ships today — no island, no flash, no JavaScript dependency. Vue islands stay
reserved for the storybook, where live components are the entire point.

---

## 2. What must not break

Ranked. The first one is the reason this document is long.

### 2.1 An unreachable `codecave.pro` must never take the docs site down

This is the existing workflow's central design decision, and it is stated in its
own header comment: *"losing the site because another repo is unreachable would
be a far worse outcome than publishing the committed output."*

Today the storybook rebuild is `continue-on-error`, and the deploy publishes the
committed `docs/` either way. Under Astro the build stops being optional — it is
how the site comes to exist. If the docs build needs `codecave.pro` for
anything, that safety property inverts: the neighbouring repo going private
takes this site offline.

**Therefore the docs build must have zero build-time dependency on
`codecave.pro`.** See §4.

### 2.2 The deliverable stays buildless

`README.md` opens with the promise: *link one stylesheet and the system is
live*, with no build step and no package to install. That promise is about
`colors_and_type.css`, `fonts/` and `build/` — what a consumer copies — and it
must survive untouched. The docs *site* gaining a build does not break it, as
long as those files ship byte-identical.

Most of `docs/` is payload rather than pages: `colors_and_type.css`, `fonts/`,
`build/`, `imagery/`, `assets/`, `tokens/`, `source_examples/`, `brand.json`,
`DESIGN.md`, `README.md`, `SKILL.md`, `guide.md`. Roughly thirty HTML pages sit
on top of it. The Astro project is thin; the passthrough is large.

### 2.3 `artifacts/` is never rendered by Astro

`artifacts/email.html`, `newsletter.html`, `deck.html`, `landing.html`,
`poster.html` and `form.html` **are the deliverable being shown**. `ds-nav.css`
is deliberately not linked into any of them — an HTML email with a documentation
bar welded to the top is no longer a valid email, and `ds-nav.css` says so in
its own header. DESIGN.md §10.6 further requires their CTAs stay literal-only,
because `bgcolor` cannot resolve `var()` and silently renders lime green.

They pass through as static files. Only `artifacts/index.html`, the gallery,
becomes a page.

### 2.4 The prose is the asset

`brand-kit.html` carries ~396 lines of hand-written CSS with the reasoning
attached, and CSS comments across the package cross-reference DESIGN.md section
numbers. That commentary is the most valuable content in the repository and the
hardest to regenerate. Any migration that treats it as boilerplate has failed
even if every page renders.

### 2.5 The repo currently needs nothing

There is no `package.json`, no lockfile and no `node_modules` anywhere in this
repository. `check-tw-bridge.mjs` runs on bare node. That is a genuinely nice
property for a design-system package and this proposal ends it. Worth saying out
loud rather than discovering later.

---

## 3. Proposed shape

```
site/                     the Astro project — the only new source tree
  astro.config.mjs        publicDir -> ../payload, outDir -> ../docs
  package.json            pinned to codecave.pro's versions (§4)
  src/
    layouts/
      Doc.astro           <head>, token stylesheets, DsNav, the shell
      Specimen.astro      Doc + .pv-head + .pv-shell + the back link
      Story.astro         Doc + .sb-head + props table + stories
    components/
      DsNav.astro         one nav, `current` prop  (replaces 30 copies)
      Note.astro          one callout, `variant` prop  (replaces 4)
      Swatch.astro  Tile.astro  Meta.astro  Label.astro
    pages/
      index.astro  brand-kit.astro
      preview/*.astro     13 pages
      storybook/*.astro   13 pages
      artifacts/index.astro

payload/                  everything that ships byte-identical (today's docs/
                          minus the HTML pages) — Astro's publicDir

docs/                     BUILD OUTPUT. The Pages workflow keeps uploading it.
```

Two notes on this layout:

- **Root `src/` is already taken** by the three logo SVGs that `build.sh`
  renders into `logos/`, `icons/` and `favicons/`. The Astro project cannot live
  at the repository root without moving those, which would break `build.sh`.
  Hence `site/`.
- **`outDir: '../docs'` means the deploy workflow does not change at all.**
  `upload-pages-artifact` keeps `path: './docs'`. Whether `docs/` stays
  committed is a real choice — see §7.

---

## 4. How the version guarantee survives

This is the part worth getting right, and it is what §2.1 turns on.

`tw-bridge.css` exists so the storybook compiles the captured components with
**the same vue / esbuild / tailwind versions the site builds with**. That is why
CI reaches into the `codecave.pro` checkout at all. If `site/` gains its own
Tailwind, the docs' version can drift from production's and the storybook would
quietly document utilities the site does not have — the exact failure
`check-tw-bridge.mjs` was written to prevent.

The resolution is to pin rather than to borrow. `site/package.json` declares the
versions read from `codecave.pro/package.json` today:

| Package | Version |
|---|---|
| `astro` | `^7.2.3` |
| `@astrojs/vue` | `^7.0.2` |
| `vue` | `^3.5.22` |
| `tailwindcss` | `^4.1.13` |
| `@tailwindcss/vite` | `^4.1.13` |
| `gsap` | `^3.13.0` |

The docs then build from their own lockfile, needing nothing external — §2.1
satisfied. Drift becomes a *reporting* problem rather than a build dependency,
and the workflow already has the idiom for exactly that: a `continue-on-error`
checkout of `codecave.pro`, a diff of the two manifests, and a line in
`$GITHUB_STEP_SUMMARY`. Unreachable neighbour, no report, site still deploys.

That is strictly better than today, where the guarantee is a SHA-256 over
generated output that can only be verified, never explained.

---

## 5. What disappears

- `docs/tools/build-storybook.mjs` — Astro imports `.vue` files directly through
  `@astrojs/vue`; no hand-rolled compile-to-JS step.
- `docs/storybook/compiled/` — build output, no longer committed.
- `docs/storybook/tw-bridge.css` — Tailwind scans `source_examples/` and emits
  the utilities itself. This is the thing the bridge was approximating by hand.
- `docs/tools/check-tw-bridge.mjs` and `source-digest.mjs` — they verify the
  bridge, and the bridge is gone.
- `docs/vendor/` — Astro bundles Vue and GSAP.
- The nav markup in 30 files; three page-header implementations; four callouts.

`source_examples/` **stays exactly as it is.** It is provenance capture, and it
becomes more load-bearing under this proposal, not less: it goes from being
input to a bespoke generator to being imported directly by the story pages.

---

## 6. Phases

Each phase is independently shippable and independently revertible.

1. **Scaffold.** `site/` with the pinned manifest, `astro.config.mjs`, the
   `payload/` move, `Doc.astro`, `DsNav.astro`, `Note.astro`. Port
   `preview/index.html` alone as proof. Nothing else changes; the other 29 pages
   still ship as static files through the passthrough.
2. **`preview/`** — 13 pages. The most formulaic set and the biggest duplication
   payoff: `colors-primary.html`'s 111 hand-written swatches collapse into a
   data array and a `map`.
3. **`storybook/`** — 13 pages. The consequential phase, because this is where
   §4 gets decided in practice and where Tailwind's preflight has to be scoped
   so it does not reset the doc chrome around the story canvases.
4. **`index.astro` and `brand-kit.astro`** — two one-offs that gain least.
   brand-kit's 396-line stylesheet moves as a component-scoped block, comments
   intact.
5. **Never: `artifacts/`.** Passthrough only, per §2.3.

Phases 1 and 2 answer the question of whether this is worth it. Stopping after
phase 2 leaves the repository in a coherent state.

---

## 7. Open questions

**Does `docs/` stay committed?** As build output it churns on every build and
every diff includes generated noise. Uncommitted, it must be built to be seen,
and `docs/preview/spacing-radius.html` stops opening from disk — which is how
these cards are reviewed today. Committing it keeps that and costs diff noise;
not committing it is cleaner and changes the review workflow. **This one needs a
decision before phase 1.**

**Does Tailwind's preflight leak?** The site's `global.css` opens
`@import "tailwindcss"`, whose preflight would reset the documentation chrome
around the story canvases. `tw-bridge.css` handles this today with a scoped
preflight equivalent. Astro's scoped styles are the likely answer but this is
unproven and belongs in phase 3, not assumed in phase 1.

**Is `.astro` enough, or is Vue needed for the chrome?** On current evidence the
nav, callout, header and swatches are all static — `.astro` with props, no
client directive, no JS shipped. Only the storybook needs `client:*`. If any
piece of chrome turns out to need state, it can become a Vue island in place
without disturbing the rest.

**What happens to `guide.md` and `brand.json`?** Both survive the Open Design
removal (`82e98b0`) and neither is a page. Passthrough. `guide.md` still lags
the package in detail, which is a content question, not a build one.

---

## 8. Recommendation

Do it, in the order above, and stop after phase 2 to judge.

The strongest argument is not the duplication — it is that a design system whose
documentation is built with a different stack than the product it documents
cannot dogfood its own components. Today the storybook goes to considerable
lengths to *simulate* mounting real components. Under Astro it would just mount
them.

The strongest argument against is §2.5: this repository currently needs nothing
but a browser, and that is worth something real.
