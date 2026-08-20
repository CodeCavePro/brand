# CODECAVE — how to build with this design system

**There is no component library here. Nothing is importable.** CODECAVE's site is built in Astro
and Vue, so no React components ship with this project — there is no `_ds_bundle.js` and no
`window.*` global to import from. Write your own markup and style it with the tokens below. That
is the whole idiom.

This project **is** the CODECAVE source of truth — canonical at
<https://brand.codecave.pro/>, published from `CodeCavePro/brand`. Implementations conform
to it, not the reverse.

That is the target state. These docs began highly divergent from the shipped site and are still
converging onto it, so *today* the live site at <https://codecave.gay> is the reference wherever
the two disagree. Design to what is written here regardless: this is where the system is landing,
and once convergence is reached implementations follow it.

**Convergence is reached when codecave.pro installs the `@codecavepro/brand` npm package and
deletes its own copy of the palette** — a fact you can check in the site's `package.json`, rather
than a judgement about whether the two "look the same" that someone has to re-make on request.
Until then, treat the site as the reference and this as the destination.

## Setup

No provider, no wrapper, no theme object. Link the stylesheet and the tokens are live on `:root`:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

`colors_and_type.css` is the whole system in one file: six `@font-face` blocks, the token layer on
`:root`, the dark baseline on `html`/`body` (near-black background, near-white text, Satoshi), and
a component class layer on top. It defines two layout classes you should reuse — `.page-container`
(centred, max 1280px, responsive gutters) and `.section-container` (the big rounded panel with
CODECAVE's upward violet glow) — plus `.btn` and its eight variants, `.card`, `.field`,
`.checkbox`, `.chip`, `.eyebrow`, `.stat`, `.divider`, and `.rule` / `.progress`.

## The idiom: semantic CSS custom properties

Style with `var(--token)`. **Never hard-code a hex value** — every colour in the brand has a name.

Use the **semantic** layer. The raw `--color-brand-*` ramp exists only so the semantic names have
somewhere to point; reach for it only when no semantic token fits (e.g. `--color-glow-25`, the
glow-button fill).

| Family | Tokens |
|---|---|
| Surfaces | `--color-surface-primary` (page), `--color-surface-secondary` (cards), `--color-surface-tertiary` (raised), `--color-surface-quaternary` (borders) |
| Text | `--color-body-primary`, `--color-body-secondary-lighter`, `--color-body-secondary` (muted), `--color-heading` |
| Accent | `--color-action` (links, borders, eyebrows), `--color-hovered`, `--gradient-brand`, `--color-error` |
| Type size | `--text-heading-lg` / `-md` / `-sm`, `--text-stat`, `--text-lg`, `--text-md`, `--text-sm`, `--text-base`, `--text-caption` |
| Radius | `--radius-control-sm` 4 (the 16px checkbox box only), `--radius-control` 8, `--radius-tile` 12, `--radius-card` 24, `--radius-article` 36, `--radius-custom` 44, `--radius-pill`, `--radius-section` 64 |
| Gradient | `--gradient-brand` — display type only, plus the one sanctioned field: `.rule` / `.progress` |
| Layout | `--max-width-desktop`, `--gutter-base` / `-md` / `-xl`, `--section-padding-top` / `-bottom`, `--card-padding`, `--shadow-section` |

Three rules that make a design read as CODECAVE:

1. **Dark first.** The page is `--color-surface-primary` (#0A0A0B); cards are one step lighter.
2. **Corners are large.** 24px is the default card radius; buttons and pills are fully round.
   Small radii look off-brand.
3. **The eyebrow move.** Bold text in `--color-action` sitting above a light (300) lead paragraph
   is the signature type pattern.

The system designs to three weights — 300, 400, 700. All six Satoshi cuts now ship as real files
in `docs/fonts/`, properly bound, so nothing is browser-synthesized here; the live site still
serves one TTF and lags behind. Design to 300/400/700 and do not reach for 500, 600 or 900.

## Where the truth lives

- `docs/DESIGN.md` — the canonical rules: foundations, the full ramp, components, motion, voice,
  logo usage, anti-patterns and the known divergences. Read this first.
- `docs/colors_and_type.css` — every token with comments on intended use, then the component
  layer. Each block names the source file it was transcribed from.
- `docs/tokens/*.ts` — the same tokens as typed modules, for consumers that cannot read a
  stylesheet.
- `docs/preview/` — twelve review cards, one concern each, rendering live tokens and real
  components. `docs/storybook/` — thirteen components with variant matrices.
- `docs/brand-kit.html` — lockups, clear space, palette and type scale on the real dark ground.

## A build looks like this

```html
<section class="section-container">
  <div class="page-container" style="padding-block: var(--section-padding-top) var(--section-padding-bottom)">
    <p style="color: var(--color-action); font-weight: 700; font-size: var(--text-heading-sm)">Tell us about</p>
    <h2 style="font-size: var(--text-heading-md); line-height: 115%">the product you want to build.</h2>

    <hr class="rule">

    <article class="card" style="max-width: 340px">
      <h3 style="font-size: var(--text-lg)">Cloud &amp; DevOps</h3>
      <p style="color: var(--color-body-secondary-lighter)">Infrastructure that scales with demand.</p>
      <button class="btn btn-primary">Discuss project</button>
    </article>
  </div>
</section>
```

---

# What is in this project

| Path | Contents |
|---|---|
| `styles.css` | Root stylesheet — a re-export. Rendered designs receive only this file's import closure; since the package rebuild that closure is one file: |
| `colors_and_type.css` | **The whole system.** Six `@font-face` bindings, the two raw ramps (12 violet brand steps and 13 grays, verbatim from the site's 2026 rebuild), the single-use accents, the semantic token layer, the type scale, radii, spacing, shadows, the dark `html`/`body` baseline, and the component class layer (`.btn` + variants, `.card`, `.field`, `.checkbox`, `.chip`, `.eyebrow`, `.lead`, `.stat`, `.divider`, `.rule`/`.progress`, `.page-container`, `.section-container`). Verbatim copy of `docs/colors_and_type.css`. |
| `tokens/colors.ts`, `tokens/typography.ts`, `tokens/layout.ts` | The same tokens as typed TS modules, for consumers that cannot read a stylesheet. Mirrors of the CSS; the CSS wins if they ever disagree. |
| `fonts/` | Six real Satoshi cuts in woff2 + woff (300/400/500/700/900 + italics), bound by `colors_and_type.css`. `fonts/fonts.css` is a standalone binding for dropping `fonts/` into another project alone. |
| `components/Foundations/` | Four rendered reference cards: Colors, Typography, Spacing, Patterns. Reference sheets, not components — they render with plain HTML against `styles.css`, so they double as proof the token layer resolves. |
| `guidelines/brand.md` | Logo usage, colour and type rules, shape language, motion, and what not to do. |

## Foundation cards

These are **reference sheets, not components.**

- **Colors** — every semantic token as a labelled swatch, the brand gradient, and the raw ramps.
- **Typography** — the full scale rendered at size, including the eyebrow + lead pattern.
- **Spacing** — radii compared side by side, container breakpoints, section rhythm, the glow panel.
- **Patterns** — button variants, a card, and the eyebrow, each with copy-paste CSS. Prefer the
  real classes in `colors_and_type.css` (`.btn`, `.card`, …) over the copy-paste equivalents.

## Authority and provenance

These values are **canonical**. They were originally recovered from
`codecave.pro/src/styles/global.css` and cross-checked against computed styles on the live site at
<https://codecave.gay>, so the two largely agree today — but that is provenance, not authority.
Changes start here and propagate outward. Nothing here is estimated from a screenshot.

## Known gaps

- **No React components.** CODECAVE builds in Astro and Vue. There is no `_ds_bundle.js`, so
  nothing can be imported — designs must be composed from markup styled with these tokens.
- **The live site's fonts lag the system.** All six Satoshi cuts ship here as real files; the
  production site still serves a single TTF with no `font-weight` descriptor, so *its* 300/700
  text is browser-synthesized. Design to 300/400/700 regardless.
- **Figma not consulted.** The Figma frames for this system could not be read when this project
  was built (seat quota), so nothing here derives from them. If the frames diverge from this
  project, this project wins.
