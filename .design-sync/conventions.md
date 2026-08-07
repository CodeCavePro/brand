# CODECAVE — how to build with this design system

**There is no component library here. Nothing is importable.** CODECAVE's site is built in Astro
and Vue, so no React components ship with this project — there is no `_ds_bundle.js` and no
`window.*` global to import from. Write your own markup and style it with the tokens below. That
is the whole idiom.

## Setup

No provider, no wrapper, no theme object. Link the stylesheet and the tokens are live on `:root`:

```html
<link rel="stylesheet" href="styles.css">
```

`styles.css` also sets the dark baseline on `html`/`body` (near-black background, near-white text,
Satoshi) and defines two layout classes you should reuse: `.page-container` (centred, max 1280px,
responsive gutters) and `.section-container` (the big rounded panel with CODECAVE's upward violet
glow).

## The idiom: semantic CSS custom properties

Style with `var(--token)`. **Never hard-code a hex value** — every colour in the brand has a name.

Use the **semantic** layer. The raw `--color-brand-*` ramp exists only so the semantic names have
somewhere to point; reach for it only when no semantic token fits (e.g. `--color-brand-210`, the
primary button fill).

| Family | Tokens |
|---|---|
| Surfaces | `--color-surface-primary` (page), `--color-surface-secondary` (cards), `--color-surface-tertiary` (raised), `--color-surface-quaternary` (borders) |
| Text | `--color-body-primary`, `--color-body-secondary-lighter`, `--color-body-secondary` (muted), `--color-heading` |
| Accent | `--color-action` (links, borders, eyebrows), `--color-hovered`, `--gradient-brand`, `--color-error` |
| Type size | `--text-heading-lg` / `-md` / `-sm`, `--text-stat`, `--text-lg`, `--text-md`, `--text-sm`, `--text-base`, `--text-caption` |
| Radius | `--radius-sm` 8, `--radius-md` 12, `--radius-card` 24, `--radius-article` 36, `--radius-custom` 44, `--radius-pill`, `--radius-section` 64 |
| Layout | `--max-width-desktop`, `--gutter-base` / `-md` / `-xl`, `--section-padding-top` / `-bottom`, `--card-padding`, `--shadow-section` |

Three rules that make a design read as CODECAVE:

1. **Dark first.** The page is `--color-surface-primary` (#050505); cards are one step lighter.
2. **Corners are large.** 24px is the default card radius; buttons and pills are fully round.
   Small radii look off-brand.
3. **The eyebrow move.** Bold text in `--color-action` sitting above a light (300) lead paragraph
   is the signature type pattern.

Only Satoshi Regular (400) is a real cut — 300 and 700 are browser-synthesized. Use them (that is
what production looks like), but don't design around weights that don't exist.

## Where the truth lives

- `styles.css` — the baseline and the layout classes; its `@import` closure is the whole system.
- `tokens/colors.css`, `tokens/typography.css`, `tokens/layout.css` — every token, with comments
  on intended use. Read these before styling.
- `components/Foundations/*.html` — rendered reference for colour, type, radius, and the
  button/card recipes. `Patterns.html` carries copy-paste CSS.
- `guidelines/brand.md` — voice, logo usage, and what not to do.

## A build looks like this

```html
<section class="section-container">
  <div class="page-container" style="padding-block: var(--section-padding-top) var(--section-padding-bottom)">
    <p style="color: var(--color-action); font-weight: 700; font-size: var(--text-heading-sm)">Tell us about</p>
    <h2 style="font-size: var(--text-heading-md); line-height: 115%">the product you want to build.</h2>

    <article style="background: var(--color-surface-secondary); border-radius: var(--radius-card); padding: var(--card-padding); max-width: 340px">
      <h3 style="font-size: var(--text-lg)">Cloud &amp; DevOps</h3>
      <p style="color: var(--color-body-secondary-lighter)">Infrastructure that scales with demand.</p>
      <button style="background: var(--color-brand-210); color: #000; border: 0; border-radius: var(--radius-pill); padding: 4px 24px; font: inherit">
        Discuss project
      </button>
    </article>
  </div>
</section>
```
