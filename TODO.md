# TODO

Open work on **this repository**. Two neighbouring lists exist and this one is
neither of them:

- [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) — designer-facing remarks on
  `codecave.pro/src`. Those are filed in Jira under
  [CCWEB2](https://codecave.atlassian.net/browse/CCWEB2) and belong to the
  website team.
- [docs/DESIGN.md](/docs/DESIGN.md) §"Known divergences" — places where the
  documented system and the shipped site knowingly disagree, with the reason.

What follows is work the brand repo owes itself. Nothing here is a defect on the
live site.

---

## 1. Token names that collide with Tailwind's defaults

The `.vue` sources in `docs/source_examples/` reference exactly two custom
properties that the site's own `global.css` never declares:

```bash
comm -23 <(grep -rhoE "var\(--[a-zA-Z0-9-]+" docs/source_examples --include=*.vue | sed 's/var(//' | sort -u) <(grep -oE "^\s*--[a-zA-Z0-9-]+" docs/source_examples/styles/global.css | tr -d ' ' | sort -u)
```

Both come from Tailwind's default theme, which the site build happens to emit.
Lift either component out of that build and the value changes or disappears.

- **`--radius-sm`** — `Checkbox.vue` sets `border-radius: var(--radius-sm)` on
  its box. On the site that is Tailwind's `0.25rem` (4px). In
  [docs/colors_and_type.css](/docs/colors_and_type.css) the same name is this
  system's own `0.5rem` (8px) — inputs and small chips. On a 16px box 8px is
  exactly half the side, so the small chip renders as a perfect circle and reads
  as a radio button: pick-one where the group is pick-any.

  Handled in three places, none of them general:
  - the storybook scopes the site's tokens to `.sb-canvas, .sb-mount`, so
    mounted components already resolve 4px (`docs/tools/build-storybook.mjs`
    names `--radius-sm` as its motivating example);
  - `.checkbox-chip input` in `colors_and_type.css` pins the literal `0.25rem`;
  - `docs/preview/components-inputs.html` explains why.

  **To do:** decide whether the DS should rename its 8px token (`--radius-input`?
  `--radius-chip`?) so the collision cannot recur, and whether to file the
  underlying fragility against the site — `Checkbox.vue` should declare the
  radius it wants rather than inherit whatever `--radius-sm` it lands beside.
  Not yet filed in Jira.

- **`--default-transition-duration`** — same class of problem, already filed:
  [CCWEB2-304](https://codecave.atlassian.net/browse/CCWEB2-304).

**To do:** keep the one-liner above as a check. Any third name appearing in that
diff is a new instance of this bug.

## 2. `docs/storybook/tw-bridge.css` cannot be regenerated here

The file is generated output (1420 lines) and correct by construction — its
`.sb-canvas, .sb-mount` block is *derived* from
`docs/source_examples/styles/global.css`, not hand-copied, which is what lets
the mounted components render as the live site does rather than as the docs
palette.

The problem is reproducibility. `docs/tools/build-storybook.mjs` resolves
`vue/compiler-sfc`, `esbuild` and `tailwindcss` from **the codecave.pro repo's
`node_modules`**, defaulting to a sibling `../codecave.pro` checkout:

```bash
node docs/tools/build-storybook.mjs ../codecave.pro
```

Consequences:

- Refresh `docs/source_examples/` without that checkout to hand and
  `tw-bridge.css` silently goes stale — the storybook then documents an older
  site than the sources beside it.
- Nothing verifies the two are in sync. No hash, no CI step, no note in
  `docs/README.md` telling a reader the file is downstream of `source_examples/`.

**To do:** either commit a sync check (hash the inputs into the generated
header and fail loudly on mismatch) or document the dependency prominently
wherever `source_examples/` is refreshed.

**Also:** the generator's file header still claims the bridge "adds utilities
without redefining the brand" and that `@theme` aliases resolve to
`colors_and_type.css`'s ramp. The canvas-scope comment 200 lines below says the
opposite and is the one that matches the code — the site's palette has moved
past the docs system and is scoped in deliberately. Fix the header.

## 3. Inert Tailwind config on the site side

`tailwind.config.ts` in the website repo is never loaded: Tailwind 4 reads a JS
config only via `@config`, which no stylesheet declares, so `darkMode`,
`content` and `theme.extend` are all dead. Filed under
[CCWEB2-274](https://codecave.atlassian.net/browse/CCWEB2-274) (design-token and
typography cleanup) and recorded in [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §5.

Nothing for this repo to do beyond not mirroring the file. Listed here so the
next reader does not re-discover it as new.

## 4. The two email templates still set the wordmark as type

[docs/artifacts/email.html](/docs/artifacts/email.html) and
[docs/artifacts/newsletter.html](/docs/artifacts/newsletter.html) render
"CODECAVE" in Satoshi Bold rather than the drawn lockup, which DESIGN.md §8
says must never be re-typed by hand. Every other artifact — deck, form, landing,
poster — now carries `assets/codecave-wide.svg`.

The templates are the exception on purpose: an `<img>` in an email needs an
absolute, permanently hosted URL, and inventing one is exactly what the
"never invent production URLs" rule forbids. Outlook's Word engine also does not
render SVG at all, so the asset would have to be a PNG at 2× or 3×.

**To do:** confirm a hosting location for `codecave-wide.png` (the brand site's
own `/brand/assets/` is the obvious candidate but is not verified), export the
raster cuts, then swap both templates. Until then the typed fallback stays and
this note explains why.

## 5. Root README points at directories that do not exist

[README.md](/README.md) lists `docs/system/` (deck, email, poster and landing
templates) and `docs/ui_kits/app/` (the system applied to a working interface).
Neither path exists. The templates live in [docs/artifacts/](/docs/artifacts)
and there is no UI-kit directory at all.

**To do:** repoint the `system/` link at `artifacts/`, and either restore the UI
kit or drop the claim. The specimen and component counts in the same table (12
review cards, 13 storybook components) are correct.

## 6. The README's "source of truth" claim contradicts how we actually work

README.md opens with:

> This repository is the source of truth for the CODECAVE brand. […]
> Implementations — including <https://codecave.gay> — conform to it, not the
> reverse.

The working rule for this repo is the opposite: the Design Sync follows the live
website, and where the site violates a design principle the finding goes to
WEBSITE-REVIEW.md for a human designer rather than being silently "corrected"
here. Both statements cannot stand.

**To do:** a product decision, not an editing one. Either the README is rewritten
to describe the repo as documentation-of-record that tracks the site, or the
direction of authority genuinely changes and the sync process changes with it.

## 7. Unanswered: navigation grouping for the CSS component layer

`docs/ds-nav.css` gives all 30 documentation pages a global bar with two groups.
The CSS component layer (the `.checkbox`, `.field`, `.btn` rules living directly
in `colors_and_type.css`) has no home in that bar, and
[docs/preview/index.html](/docs/preview/index.html) still presents its 12 cards
as one flat list.

Two options were on the table and neither was chosen: a third nav group for the
CSS layer, or regrouping the preview index under "Tokens & assets" / "CSS
components". Needs a decision before anyone starts.

*(The six artifact specimens are deliberately excluded from `ds-nav.css` — those
pages are the deliverable being shown, so they carry the site's chrome rather
than the package's. That is intended, not an omission.)*
