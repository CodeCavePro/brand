# CODECAVE Design System

A complete, reusable design system extracted from first-party CODECAVE source —
the `CodeCavePro/brand` repository and the production `codecave.pro` codebase.
Every token, component rule, asset and font file in this package was read out of
captured source, not inferred from a screenshot or a marketing page.

Link one stylesheet and the system is live:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

There is no build step, no package to install, no theme provider and no
component bundle. `colors_and_type.css` declares the tokens on `:root` and ships
a component class layer on top of them.

---

## Product context

CODECAVE is a software delivery studio. The captured surface is its marketing and
lead-generation site: a dark, high-contrast presentation whose entire job is to
turn a visitor into one booked consultation.

**Six services**, and the site titles every one of them by the *outcome* it
produces rather than the technology it uses:

| Service | Outcome line, verbatim |
|---|---|
| Cloud & DevOps | Optimize costs. Protect your Data |
| E-Commerce | Maximize revenue, dominate Markets |
| Autodesk plugins | 10x efficiency with custom Plugins |
| Automation & AI | Leverage virtual Workforce |
| HubSpot | Aggregate data from all your Tools |
| AR & VR | Stunning visualisations for your business |

**Production stack.** Astro 7 + Vue 3 + Tailwind 4, GSAP 3.13 with ScrollTrigger,
Lenis 1.3.11 smooth scroll, vue3-carousel, Strapi as the content backend. 61
`.astro` files, 45 `.vue` components, zero React, no Storybook. The Tailwind 4
`@theme` block in `src/styles/global.css` is the authoritative token source; the
brand repository's `docs/tokens/*.css` publish the same ramp independently.

**Conversion shape.** Exactly one primary action per page — a violet glow button
reading "Get a free consultation" — supported by a consultation form that asks
for one required field (e-mail) and treats everything else as optional. The
voice is plain, specific and non-promotional: *"Scope, milestones and outcomes
upfront."* / *"We are ready to sign an NDA — your idea stays yours."*

**What defines the visual system** (the long version is `DESIGN.md`):

1. **Depth without contrast.** The page is `#0A0A0B` and a card is `#0F0F15` —
   one hair apart. Separation comes from radius and a 1px `#2B2848` border, never
   from a lighter fill.
2. **Enormous radii.** 24px is the *default* card corner. Feature cards take
   44px; section panels reach 64px, and 120px above 768px. Nothing in the system
   has a small corner.
3. **The inverted glow.** Section panels cast violet light *upward* — every Y
   offset in `--shadow-section` is negative. It is physically wrong and instantly
   recognizable, and it is the single most important thing not to normalize.
4. **Violet is rationed.** `#5F20FE` lives on edges, links and marks and never
   fills a large area. When a violet *field* is genuinely needed the system
   switches to `#9980FF` with `#1B0D4E` text — the only dark-on-light text
   anywhere in the system.

---

## Source references

| Source | Where the evidence lives | Read method |
|---|---|---|
| `CodeCavePro/brand` (GitHub, `main`) | `context/github/CodeCavePro-brand/` + `files/` snapshots | `git-clone` |
| `CodeCavePro/brand` (GitHub, `development`) | `context/github/CodeCavePro-brand-development.md` — tokens, `DESIGN.md`, `ds-bundle/` | `git-clone` |
| `CodeCavePro/brand` working clone — the binary logo/icon/favicon trees | `context/local-code/brand/` + `files/logos/`, `files/icons/`, `files/favicons/`, `files/build.sh` | `local-folder` |
| `codecave.pro` production codebase | `context/local-code/codecave.pro/` + `files/` snapshots | `local-folder` |
| https://codecavepro.github.io/brand | reviewed; structural confirmation only | fetched |
| https://codecave.gay | live site, named in `.design-sync/config.json` as the measurement source | measured |
| Figma design file | **linked but not decoded** — no snapshot captured, contributed nothing | — |

**The `context/` intake tree is not published in this repository.** It is the
capture workspace's raw evidence — full snapshots of the `codecave.pro` and
brand-repo working trees — and the table above cites it so each claim stays
traceable to where it was read, not because the folder ships here. The
component sources are preserved in `authored/` instead, so the code behind the
rules can be read without re-running intake: 38 files — every Vue component this
system documents, with the helpers and icons they reach for. What is genuinely
captured from elsewhere stays in `source_examples/`: the production
`global.css`, the wordmark, and this repository's own earlier token CSS in
`source_examples/brand-repo-tokens/`.

`tokens/` is the one derived artefact rather than a copy: `colors.ts`,
`layout.ts` and `typography.ts` mirror `colors_and_type.css` as typed modules
for consumers that cannot read a stylesheet — design tooling, canvas renderers,
PDF and email builders, native apps. The CSS remains the source of truth.

---

## Package contents

```
├── index.html                 dark front door, and the brand page it absorbed:
│                              lockups, palette, type scale, voice, posture
├── DESIGN.md                  THE rules — canonical source of truth
├── colors_and_type.css        THE deliverable: tokens + component class layer
├── README.md                  this file — package guide and preview manifest
├── SKILL.md                   agent-facing entry point
├── guide.md                   short orientation note
├── tokens/                    the same tokens as typed TS modules, for non-CSS consumers
├── brand.json                 machine-readable palette, type and voice summary
├── assets/                    UI icons, the checkbox tick, font originals
├── logos/                     the 3 vector masters + the 72-file raster ramp
├── icons/                     the 7-step square icon ramp
├── favicons/                  ICO, Apple touch, PWA icons, site.webmanifest
├── fonts/                     6 Satoshi cuts (woff2 + woff) + fonts.css
├── imagery/                   decorative line-and-glow art, on its #050505 ground
│   └── source/                the same 8 SVGs untouched, byte-for-byte
├── authored/                  every component, helper and icon — edit here
├── source_examples/           the eight files captured from elsewhere — never edit
├── pages/                     every route on the site, as .astro
│   ├── kitchen-sink/          25 specimens + the index that gathers them
│   └── examples/              6 wrapper pages + the gallery
├── kitchen-sink/              the three stylesheets those specimens share
├── storybook/                 build inputs, not routes — nothing here is served
│   ├── compiled/              the real component bundles the specimens mount
│   ├── ports/                 interfaces + docs-build adapters for what a
│   │                          component depends on outside itself
│   └── placeholders.js        local stand-ins for the CMS-hosted media the
│                              captured components ask for
└── examples/
    ├── raw/                   6 standalone deliverables — Astro never renders these
    └── examples.css           the chrome around them
```

**There are two browsable surfaces, and they answer two different questions.**
`kitchen-sink/` asks whether a **part** is right — a token, a specimen, a live
component — and `examples/` asks whether the parts **compose** into something a
client receives. `DESIGN.md` and `colors_and_type.css` sit underneath both as
the rules and their machine-readable half.

It used to be five: a brand page, `preview/` for tokens, `storybook/` for
components, `artifacts/` for compositions, and two separate indexes over them.
The split was real but nobody navigating it could hold five surfaces in mind, so
the brand page folded into the front door as anchors, `preview/` and
`storybook/` merged into one kitchen sink, and `artifacts/` became `examples/`.
Route counts went from 30 to 34 — the surfaces collapsed, the content did not.

**`storybook/` is now inputs rather than a surface**, which is worth knowing
before looking for a page there. It holds the compiled bundles the specimens
mount, their ports and their placeholders; the specimen PAGES live under
`pages/kitchen-sink/`. The directory kept its name because every specimen
identity — scoped style ids, `__file` — is derived from it, and renaming it
would rewrite every `data-v-` attribute in every bundle for nothing.

**`logos/`, `icons/` and `favicons/` are the rendered brand assets**, and they
are the only home each one has. They are output: `tools/generate-brand-assets.sh`
renders all three from the vector masters in the repository's `src/logos/`, and
they are tracked so a consumer can take a PNG without owning a rasteriser.

They used to exist three times over — at the repository root as the script's
output, and again under `build/` and `assets/` as hand-made copies. The copies
were byte-identical and nothing derived them, so a re-render updated one home
and left the other two silently saying something else. 43 files were duplicated
that way. `build/` is gone; its two files that were not copies are `logos/logo.svg`
(codecave.pro's header lockup, which this repository does not draw) and
`site.webmanifest`, now served from the site root where its absolute icon paths
resolve — they pointed at `/icons/` and 404'd from the day it was captured.

**`imagery/source/` is the same contract for the decorative art** — eight SVGs
copied byte-for-byte out of `codecave.pro/src/assets/images/`. The seven files
one level up in `imagery/` are the *presentation* copies: identical artwork
with a single `#050505` ground rect added, because the originals are
stroke-only on a transparent root and therefore do not render on a light
canvas. Ship from `imagery/source/`; review from `imagery/`.

| Group | Files | Source |
|---|---|---|
| Vectors | `logos/codecave-wide.svg`, `logos/codecave-tall.svg`, `logos/codecave.svg` | `src/logos/`, copied on render |
| Site marks | `logos/logo.svg` | `codecave.pro` production |
| Raster lockups | `logos/codecave-{wide,tall}-{size}-{finish}.png`, `logos/codecave-{size}x{size}.png` (8 sizes × 4 finishes × 3 lockups) | rendered from `src/logos/` |
| Icon ramp | `icons/16x16.png` … `icons/512x512.png` (7 sizes) | rendered from `src/logos/codecave.svg` |
| Web runtime | `favicons/favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, and `site.webmanifest` at the site root | rendered from `src/logos/codecave.svg` |

**The production site's own `public/favicon.svg` is not shipped here.** As
captured, `codecave.pro` still serves the Astro starter's default favicon — a
stock framework glyph, not a CODECAVE mark. It is left in the evidence snapshot
(`context/local-code/codecave.pro/files/public/favicon.svg`) and deliberately
kept out of the rendered ramps. Use `favicons/favicon.svg`, the real brand mark.

`assets/` holds what is not rendered from a master: the UI icons, the checkbox
tick, and the original font uploads. The lockups and app marks it used to
duplicate now live once, in `logos/`.

**Every lockup exists in eight sizes × four finishes.** The brand repo's
`build.sh` renders `src/codecave.svg`, `src/codecave-wide.svg` and
`src/codecave-tall.svg` at 96/128/256/300/350/500/600/1024 into
`codecave-{wide|tall}-{size}-{text-white|text-black|all-white|all-black}.png`.
`text-white` is the default on dark; `text-black` is for genuinely light
surfaces; the two `all-*` finishes are one-ink print. This package preserves a
representative subset — regenerate any other size from the vectors rather than
upscaling a PNG.

**Fonts are real and bound.** `colors_and_type.css` opens with six `@font-face`
blocks pointing at `./fonts/Satoshi-*.woff2` with `.woff` fallbacks. Nothing is
described in prose only.

---

## Preview Manifest

Twelve cards, one concern each — the foundations half of the kitchen sink. Open
`kitchen-sink/index.html` and work down from the *Tokens* and *CSS components*
sections, or open any card directly. Every card links
`../colors_and_type.css` and renders live tokens, live components and real
preserved files: there are no screenshots and no redrawn marks anywhere in the
set.

| Card | What to inspect | What it demonstrates |
|---|---|---|
| `kitchen-sink/index.html` | The hub over both halves. Confirm every card and story opens, and that the lockup renders. | `logos/codecave.svg`, `.divider`, `.eyebrow` |
| `kitchen-sink/colors-primary.html` | That `#5F20FE` never fills a large area, and that cyan appears nowhere as a UI color. | `--color-action`, `--color-hovered`, `--color-glow-25`, `--gradient-brand`, the 12-step brand ramp, the 13-step gray ramp, the single-use accents, the technology wash, the 4-step error ramp. Source: `source_examples/styles/global.css`, `tokens/colors.css` |
| `kitchen-sink/colors-theme-dark.html` | Four surfaces one hair apart — check they still separate. Read the contrast ratios on the foreground ramp. | `--color-surface-primary/-secondary/-tertiary/-quaternary`, `--color-body-*`, `.card` in situ |
| `kitchen-sink/colors-theme-light.html` | The three light surfaces that legitimately exist, and why no light theme may be derived from them. | `gray-50` as ink vs. as a field, inverse lockup usage, `error-100` rationale |
| `kitchen-sink/typography-specimens.html` | Whether the six Satoshi cuts render distinctly. If they look identical, the `@font-face` binding is broken. | `fonts/Satoshi-*.woff2`, the nine-step scale at true size, `.eyebrow` / `.lead` / `.eyebrow-lead` with a counter-example. Source: `tokens/typography.css`, `homepage/expertise.astro` |
| `kitchen-sink/spacing-tokens.html` | The asymmetric section rhythm (200px above, 120px below) and bottom-heavy card padding. | `--gutter-*`, `--section-padding-top/-bottom`, `--card-padding`, `--control-height`, `--input-height`. Source: `tokens/layout.css` |
| `kitchen-sink/spacing-radius.html` | Eight radii at true size, the measured homepage census, and the same card at 4px and 0px for comparison. | `--radius-control` → `--radius-section-md`, `.card`, live `.section-container` across the 768px breakpoint |
| `kitchen-sink/spacing-shadows.html` | The space **above** the panel — that is where the violet has to appear. Then the conventional-shadow counter-example beside it. | `--shadow-section` (three negative-Y layers), `--shadow-glow-button`, `--shadow-input-focus`, `--shadow-input-error` |
| `kitchen-sink/components-buttons.html` | Rest, hover, active, focus and disabled shown together; tab through the focus row. | `.btn` + `-glow/-primary/-secondary/-tertiary/-ghost/-text/-link/:disabled`, and the one sanctioned CTA pairing. Source: `common/Button.vue`, `common/GlowButton.vue` |
| `kitchen-sink/components-inputs.html` | Click into the fields. The floating label must never collide with the value, and focus must be a halo rather than an outline. | `.field`, `.field.is-error`, `.error-message`, `label .required`, `.checkbox`, `.chip`, radios, the assembled consultation form. Source: `common/InputText.vue`, `TextField.vue`, `Checkbox.vue`, `Radio.vue`, `common/forms/ContactUsForm.vue` |
| `kitchen-sink/components-progress.html` | That the bar is violet at 15% and near-white only at 100%. If early progress reads near-white, the gradient is being sized to the fill instead of the track. | `.rule`, `.progress`, `.progress-value`, `.progress.is-indeterminate`, `--gradient-brand` as a field, and three counter-examples: stretched full width, gradient sized to the fill, thickened to 16px. Source: the brand repository's previously published `docs/index.html` |
| `kitchen-sink/brand-imagery.html` | Every plate must show visible strokes. A plate that reads as flat near-black means the `#050505` ground rect is missing from that file, not that the art is subtle. | The seven harvested section backgrounds on their required ground, the `0.8 / 0.65 / 0.55 / 0.45` opacity ladder that produces the falloff, the three gradient stops, and the two imagery-only literals recovered in the deep pass (`#391398`, `#4C4759`). Source: `codecave.pro/src/assets/images/` |
| `kitchen-sink/brand-assets.html` | Every frame must contain artwork. An empty frame means a missing file, not a styling bug. Check the 16px icon still reads as a chevron. | Real files from `logos/`, `icons/` and `favicons/` loaded via `<img>`, `<object>` and CSS `url(...)`: both lockups, the chevron, all four raster finishes at 256px, the seven-step `icons/` ramp at native size, the web runtime set (`favicon.ico`, `apple-touch-icon.png`, both PWA manifest icons), the production `logo.svg`, the 1024² app icon, and the six font specimens |

These cards no longer sit on a surface of their own. `kitchen-sink/index.html`
gathers them and the component stories below on one page, and the main menu
carries the only other surface, `examples/index.html`.

---

## Component Storybook

Thirteen components extracted from `codecave.pro` — twelve Vue islands and one
Astro component. The components half of the same page: open
`kitchen-sink/index.html` and read down to *Live components*.

The stories **mount the real components**: `tools/build-storybook.mjs`
compiles each `.vue` source verbatim (vue/compiler-sfc + esbuild) into
`storybook/compiled/`, and generates `storybook/tw-bridge.css` — the site's
own Tailwind theme plus every utility the components use, scoped to the story
canvases with a preflight equivalent. Pages render them with the vendored Vue
and GSAP runtimes; no external network, no build step at view time. The one
`.astro` component cannot run in a browser, so `kitchen-sink/components.css`
survives only as its hand-translated port (`.cc-chip`). Where the storybook
deviates from production — Strapi-hosted images swapped for local
placeholders, positioning stages for absolutely-positioned cards — the gap is
written on the story page rather than silently papered over.

| Group | Components |
|---|---|
| Primitives | `Button` (7 variants), `GlowButton`, `InputText`, `TextField`, `Checkbox` (2×2), `Radio` (2 variants) |
| Content | `ArticlePreview`, `Review`, `TechnologyCard`, `ProjectChip`, `TypingEffect`, `PainPointsItem` |
| Compositions | `LinkGroup` |

Each story page carries the real `defineProps` signature, a variant/state
matrix rendered live, and a findings section. **55 findings are recorded — 29
flagged as defects, 26 as design observations.** The ones that change runtime
behavior:

- **`--default-transition-duration` is not the project's variable.**
  `Checkbox.vue`:75 and `Radio.vue`:61 both use it in a `transition` shorthand.
  It appears nowhere in the project's own code — it resolves to 150ms from
  Tailwind's default theme, emitted because `transition-colors` is in use.
  Inside a Tailwind build the indicators ease; lift either component out and
  the shorthand collapses and they snap.
- **`Button`'s `isDisabled` does not disable.** It sets opacity and cursor only;
  the `disabled` attribute is never bound.
- **`TextField` syncs its model on `change`, not `input`** — so `v-model`
  updates on blur while `InputText` in the same form updates per keystroke.

The storybook is static HTML and needs no build. It is **not** a Storybook
(`@storybook/*`) install: `codecave.pro` is linked read-only, so nothing was
written into that repo.

---

## Email CTAs

`examples/raw/email.html` shipped its two CTAs as green buttons. The cause
is a single attribute:

```html
<td align="center" bgcolor="var(--brand-color-primary)">
```

`bgcolor` is a presentational attribute, parsed with the HTML **legacy color
rules** — a fixed-width algorithm that has no access to CSS at all, so it cannot
resolve a custom property. It does not fail and fall back; it substitutes `0`
for every non-hex character and reads what is left as a color. For
`var(--brand-color-primary)` that yields **`#A0D000`**, a lime green. The
literal string is doing the choosing, not the token.

Both CTAs in `email.html` and both in `newsletter.html` are now the glow button,
written with literals end to end:

| Property | Value | Why a literal |
| --- | --- | --- |
| `bgcolor` / `background` | `#9980FF` | The one violet field in the system. |
| `color` | `#1B0D4E` | The only dark-on-light text in the system — 5.67:1. |
| `border-radius` | `9999px` | Pill, per the radius rules. |
| `box-shadow` | `0 0 64px 0 #7A58FFA8, 0 0 16px 0 #4F22FFA6, 0 0 4px 2px #5B34FA` | The halo, verbatim from `--shadow-glow-button`. |
| `padding` / `font-size` | `16px 32px` / `18px` | Outlook's Word engine ignores `var()`; the button would collapse to zero padding. |

**Never use `var()` inside `bgcolor`, and prefer literals over tokens anywhere
in an email artifact.** Custom properties are unsupported in Outlook on Windows
and unreliable elsewhere; the design system's token layer stops at the inbox
boundary.

Known limits, not defects: Outlook squares the pill and drops the halo, leaving
the flat `#9980FF` field with `#1B0D4E` text. That degradation is intentional —
the fill and the text color are the parts that carry the brand.

### Footer signature

The generator emits a placeholder postal address and the brand-guide host. The
registered line, in both email artifacts, is:

```
CODECAVE · 8 The Green, STE B, 19901 Dover DE, US · codecave.pro
```

The other four artifacts — `deck`, `landing`, `poster`, `form` — name
`codecave.pro` in their footers too. The generated files pointed every one of
those at the brand-guide host instead; that host is not CODECAVE's website, so
all six artifacts now carry the company address.

---

## Reuse workflow

1. **Copy `colors_and_type.css`, `fonts/` and `favicons/`** into the target project,
   keeping the relative layout — the stylesheet resolves fonts as
   `./fonts/Satoshi-*.woff2`.
2. **Link it once**, at the root of the document. The tokens land on `:root` and
   the baseline sets the page to `#0A0A0B` with `#F4F4F6` text.
3. **Consume the semantic layer**, never the raw ramp: `--color-surface-*`,
   `--color-body-*`, `--color-heading`, `--color-action`, `--color-hovered`.
   Exactly three raw values are legitimate — `glow-25` (glow fill), `shadow-0`
   (the upward glow) and `progress-0` (the gradient mid). **Never hard-code a
   hex.**
4. **Use the component classes** rather than re-deriving them: `.btn` + variant,
   `.card`, `.card-article`, `.card-feature`, `.field`, `.checkbox`, `.chip`,
   `.eyebrow`, `.lead`, `.eyebrow-lead`, `.stat`, `.divider`, `.page-container`,
   `.section-container`. These are the public API.
5. **Read `DESIGN.md` §9 before shipping.** The twelve anti-patterns are the
   fastest way to catch work that has drifted off-system — a downward shadow, a
   small radius, a second glow button, a purple wash, or a light theme.
6. **Check §10, Known divergences.** Two rules here intentionally differ from
   what `codecave.pro` ships today (error text contrast, real vs. synthesized
   font weights). Each is documented with the production value if you need to
   match live exactly. **Buttons are not among them:** the `.btn*` layer is a
   transcription of `Button.vue` and `GlowButton.vue`, down to the halo hex
   literals and the 150ms `transition-colors` — including the tertiary hover
   that darkens its border to `#1B0D4E`. The only addition is the
   `:focus-visible` ring, which production never implemented.
7. **Start from `examples/`** when building a whole surface rather than a
   control. Those six files show the system carrying real page density, which is
   where the 200/120 rhythm and the one-primary-action rule actually get tested.

---

## Superseded setup output

`guide.md` and the former `system/` tree are artefacts of the original
`/design-systems/create` registration run, which read the palette from the brand
site's README rather than from source. That palette was wrong — it mapped
`#aaccee` to the page background and `#5F20FE` to body text; `#aaccee` appears in
no first-party file, and `#5F20FE` is the action color and is never body text.
`DESIGN.md` §1 documents the correction in full.

`brand.json` was then corrected to the source-backed values (`#5F20FE` action,
near-black canvas, near-white ink, 24px radius — re-seeded again after the
2026 palette rebuild) and the generator re-run against them. The seed is right; **the generator's derivation is not.** Feeding it
`#5F20FE` produced a ten-step palette whose primary is `#7040da`, and the
resulting token layer — `system/variables*.css`, `system/tokens.*.json`,
`system/theme.json`, `system/kit*.html` and `system/index.html` — contained
**zero occurrences of `#5F20FE`**. It also shipped a light theme, which this
brand does not have. That layer has been removed rather than corrected: a second
set of custom properties on a different primary is worse than none, because a
consumer who links it gets a brand that is not CODECAVE and no error to tell
them so.

What survived the removal is `examples/`, promoted to the top level and re-based
on `colors_and_type.css`. `brand.json` and `guide.md` stay — both are on the real
palette — though `guide.md` remains a short generated orientation note and lags
this package in detail.

This package — `colors_and_type.css`, `DESIGN.md`, `tokens/`, `preview/`,
`storybook/`, `examples/` — is the source of truth.

## Verifying the package

One check, and it needs nothing but node. Run it from the repository root:

```bash
node docs/tools/check-tw-bridge.mjs
```

It proves `storybook/tw-bridge.css` is still in step with both component roots,
comparing a SHA-256 recorded in the generated header against the sources on
disk. A stale bridge does not announce itself: it compiles, it loads, and the
storybook goes on documenting an older site than the sources sitting beside it.
The same check runs on every push in `.github/workflows/static.yml`, ahead of
the deploy, and it is the one guarantee that always runs.

That check proves the bridge matches the sources. **Nothing proves those sources
match codecave.pro, and as of 2026-08-25 nothing tries.** `check:captures` did,
and was removed: the site installs this package and pins it with
`--frozen-lockfile`, so it lags between releases by design. Components are
developed here, tried in the storybook here, published, and the site bumps
afterwards — a check demanding the two be equal was red for exactly the changes
it existed to protect.

The reading that goes with it: a specimen on this site is a record of what **this
repository** ships, which is what codecave.pro will get at its next bump, not
necessarily what it renders today. Treat any claim of the form "production does
X" about a component with that in mind.

Regenerating the bridge is the other half, and it needs the `codecave.pro`
checkout — the storybook compiles the real components with the same
vue/esbuild/tailwind versions the site builds with, which is the whole point:

```bash
node docs/tools/build-storybook.mjs ../codecave.pro
```

That checkout must have its dependencies installed, and **it uses pnpm** — its
lockfile is `pnpm-lock.yaml` and there is no `package-lock.json`:

```bash
pnpm install --frozen-lockfile
```

Reaching for `npm install` there instead produces an ERESOLVE failure on an
unrelated peer conflict, which looks like a broken dependency graph and is
really just the wrong package manager. `--frozen-lockfile` is what keeps a build
of this package from quietly rewriting the site's lockfile.

### Ports — what a component depends on outside itself

A captured component sometimes imports something a static docs page cannot
resolve the way production does. One does today: `project/pain-points-item.vue`
sanitises its markdown with `isomorphic-dompurify`, whose job is to pair
DOMPurify with `jsdom` so the call also works during SSR.

Those dependencies are **inverted, not stubbed**. `storybook/ports/ports.d.ts`
declares the narrow interface the component actually needs; an adapter beside it
implements that interface for a static build; the `PORTS` table in
`tools/build-storybook.mjs` is the only place a specifier is wired to an
adapter. Everything else still compiles from the real source.

**An adapter substitutes the environment, never the behaviour.** The sanitiser
port really sanitises — it is plain `dompurify` at the version the isomorphic
wrapper resolves to, minus the jsdom half that only matters on a server. The
third story on the `PainPointsItem` page proves it rather than asserting it:
hostile markdown goes in, and the verdict under it is generated after mount from
the DOM the real component produced. It was an identity function for about a day
in August 2026, which was wrong — it made that page the one place in the
storybook where the component on screen was not the component in production, in
exactly the behaviour anyone visits that page to check.

Where an adapter genuinely cannot reach production, the specimen says so on its
face. No specimen needs that today: since CCWEB2-332 the CMS-shaped components
resolve media through an injected `resolveImage()` that defaults to identity, so
a fixture's `/uploads/foo.png` reaches the `<img>` unchanged and 404s on whatever
origin serves the page. Every page therefore swaps in a local placeholder after
mount — via `storybook/placeholders.js`, which knows that `LazyImage` reads
`data-src` and that assigning `.src` to one of those loses a race with its
`IntersectionObserver`.

The distinction is not vocabulary. A stub is unchecked — it fails as an
`undefined` in someone's browser, at the one moment the specimen was supposed to
be proving something. An adapter is typechecked against its interface, so it
fails at build time instead:

```bash
npm run check:ports
```

which `npm run check` runs for you. The bar for adding a port is narrow, and
`ports.d.ts` states it: if swapping the implementation would change what the
specimen **looks like**, it is not a port — it belongs in the bundle.

The bar for keeping one is just as narrow, and it is the build that holds it.
`check:ports` typechecks an adapter whether or not a specimen imports it, so a
green check on its own can be coverage of nothing — which is what `StrapiPort`
quietly became once the CMS-shaped components took an injected `resolveImage()`
and stopped reaching for a Strapi base URL. Every `build-storybook.mjs` run
therefore ends by naming the specimens each port stood in for:

```
SanitizerPort stood in for 1 specimen(s): project/pain-points-item.vue
```

and names any port nothing reached for, which is the cue to delete it or to
capture the component that needs it.
