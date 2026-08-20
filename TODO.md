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

Everything still listed needs **a decision**, not an edit. The items that were
merely undone have been done; they are recorded at the bottom.

---

## 1. `brand.codecave.pro` is documented but not wired up

The design system now names <https://brand.codecave.pro/> as its canonical
location — in [.design-sync/config.json](/.design-sync/config.json), the
conventions header, both READMEs. **Nothing publishes there yet.** There is no
`CNAME` file, so `.github/workflows/static.yml` deploys to
`codecavepro.github.io/brand` and the documented URL does not resolve.

Three things are needed and only the first belongs to this repo:

1. `docs/CNAME` containing `brand.codecave.pro` (`docs/` is the Pages artifact
   root, so the file goes there, not at the top level).
2. A DNS `CNAME` record: `brand.codecave.pro` → `codecavepro.github.io`.
3. The custom domain set in the repo's Pages settings.

**Order matters.** Committing the `CNAME` file before DNS resolves makes Pages
serve the custom domain and redirect the `github.io` URL to it — so the site
goes dark until DNS catches up. Do DNS first.

**To do:** point DNS, then add the file. Not done here because doing it in the
wrong order breaks the published site.

## 2. Token names that collide with Tailwind's defaults

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
  Not yet filed in Jira. **This is a breaking rename of a published token**,
  which is why it has not been done unilaterally.

- **`--default-transition-duration`** — same class of problem, already filed:
  [CCWEB2-304](https://codecave.atlassian.net/browse/CCWEB2-304).

**To do:** keep the one-liner above as a check. Any third name appearing in that
diff is a new instance of this bug.

## 3. The two email templates still set the wordmark as type

[docs/artifacts/email.html](/docs/artifacts/email.html) and
[docs/artifacts/newsletter.html](/docs/artifacts/newsletter.html) render
"CODECAVE" in Satoshi Bold rather than the drawn lockup, which DESIGN.md §8
says must never be re-typed by hand. Every other artifact — deck, form, landing,
poster — now carries `assets/codecave-wide.svg`.

The blocker has **half** lifted. The site root is now settled
(<https://brand.codecave.pro/>), and because `docs/` is the Pages artifact root,
a file at `docs/assets/x.png` is served at `/assets/x.png`. So the URL is
derivable rather than invented — but only once item 1 is done. Until
`brand.codecave.pro` actually resolves, writing it into an email that may be
archived for years is still writing a dead link.

Outlook's Word engine also does not render SVG at all, so the asset has to be a
PNG at 2× or 3×.

**To do:** finish item 1, export the raster cuts of `codecave-wide` into
`docs/assets/`, then swap both templates. Until then the typed fallback stays
and this note explains why.

## 4. The README's "source of truth" claim contradicts how we actually work

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

## 5. Unanswered: navigation grouping for the CSS component layer

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

## 6. Not ours: inert Tailwind config on the site side

`tailwind.config.ts` in the website repo is never loaded: Tailwind 4 reads a JS
config only via `@config`, which no stylesheet declares, so `darkMode`,
`content` and `theme.extend` are all dead. Filed under
[CCWEB2-274](https://codecave.atlassian.net/browse/CCWEB2-274) (design-token and
typography cleanup) and recorded in [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §5.

Nothing for this repo to do beyond not mirroring the file. Listed here so the
next reader does not re-discover it as new.

---

## Recently closed

- **The storybook could not be verified or rebuilt anywhere but one laptop.**
  `tw-bridge.css` is generated from `docs/source_examples/`, but the generator
  needs the codecave.pro checkout's toolchain, so nothing verified the two were
  in step — and a stale bridge compiles, loads, and silently documents an older
  site. Now: the generator records a SHA-256 of every source file in the
  `tw-bridge.css` header, and [check-tw-bridge.mjs](/docs/tools/check-tw-bridge.mjs)
  verifies it with **nothing but node**, so it runs anywhere. Wired into
  `.github/workflows/static.yml`, which runs it on every deploy and rebuilds the
  storybook when the toolchain is reachable. *(The committed bridge turned out
  not to be stale — the 1420 generated lines were byte-identical.)*

- **The generator's output depended on where it was run from.** esbuild wrote
  path annotations relative to the invocation directory, so building from the
  repo root and from `docs/` produced twelve differing files. Pinning
  `absWorkingDir` makes the output reproducible, which is what lets CI diff a
  fresh build against the committed one and mean it.

- **The generator's own header described behaviour it does not have.** It
  claimed the bridge "adds utilities without redefining the brand"; the bridge
  deliberately scopes the *site's* palette over this package's inside the
  canvases, which is the only reason specimens are faithful. The canvas-scope
  code said "see header comment", pointing readers at the wrong explanation.

- **The root README linked two directories that do not exist** — `docs/system/`
  and `docs/ui_kits/app/`. The templates live in
  [docs/artifacts/](/docs/artifacts); there is no UI kit, so the claim is gone
  rather than repointed. Every repo-relative link in the top-level and `docs/`
  markdown now resolves.

- **`ds-bundle/` was entirely gitignored**, including 32K of files that exist
  nowhere else in the repo — the bundle README, `styles.css`, `guidelines/brand.md`
  and the four Foundations cards were untracked source. The derived half stays
  ignored and is materialized by
  [build-ds-bundle.sh](/docs/tools/build-ds-bundle.sh).

- **`.design-sync/conventions.md` had drifted out of the palette rebuild** —
  it is the configured `readmeHeader`, so it feeds the bundle README's first 86
  lines, and it still named `#050505` as the page ground and `--color-brand-210`,
  a token the rebuilt ramp does not define.
