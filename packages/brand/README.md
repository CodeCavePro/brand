# @codecavepro/brand

The CODECAVE design system as **CSS custom properties** and as a **typed module** —
colour, typography and layout tokens, with no runtime, no provider and no component
bundle.

Link one stylesheet and the whole system is live on `:root`.

> **Status: pre-1.0.** The token *values* are stable — they mirror what
> [codecave.pro](https://codecave.pro) ships. The package *layout* (export paths,
> module shape) may still move before 1.0. Pin an exact version if that matters to you.

## Install

```bash
npm install @codecavepro/brand
```

## Quick start

```css
@import "@codecavepro/brand/css";
```

That is the whole setup. Every token is now a custom property on `:root`:

```css
.card {
  background: var(--color-surface-secondary);
  border-radius: var(--radius-card);
  color: var(--color-body-primary);
}

.card a {
  color: var(--color-action);
}
```

**Consume the semantic layer** — `--color-action`, `--color-surface-secondary`,
`--color-body-primary`. The raw ramps (`--color-brand-500`, `--color-gray-1100`) exist
only so the semantic names have somewhere to point; using them directly is how a
redesign turns into a find-and-replace across your codebase.

### No build step, if you prefer

The same file is served, byte for byte, from the published design system:

```html
<link rel="stylesheet" href="https://brand.codecave.pro/colors_and_type.css">
```

The package build asserts that identity, so the file in your `node_modules` and the
file at that URL are provably the same bytes.

## Fonts: this package ships none

`@codecavepro/brand/css` declares six `@font-face` rules for **Satoshi**, but **no font
binaries are included** — that is a licensing question, not an oversight. Until you
supply the files, the faces 404 and the browser falls back down the stack
(`-apple-system`, `Segoe UI`, Roboto, …). Tokens, colours and the type *scale* are all
correct regardless; only the typeface is missing.

The two stylesheets expect the files in **different places**, because one is meant to be
dropped into a project on its own:

| Import | `@font-face` URLs | Put the `.woff2`/`.woff` files at |
|---|---|---|
| `@codecavepro/brand/css` | `./fonts/Satoshi-*.woff2` | a `fonts/` directory **beside** the stylesheet |
| `@codecavepro/brand/fonts.css` | `./Satoshi-*.woff2` | **beside** the stylesheet itself |

Get the cuts from [Fontshare](https://www.fontshare.com/fonts/satoshi) — Light 300,
Regular 400, Italic, Medium 500, Bold 700, Black 900. Bind each with a real
`font-weight` descriptor rather than letting the browser synthesize; the design system
documents why in [DESIGN.md §10.3](https://github.com/CodeCavePro/brand/blob/development/docs/DESIGN.md#103-synthesized-vs-real-font-weights).

## The typed module

For consumers that cannot read a stylesheet — design tooling, canvas/WebGL renderers,
PDF and email builders, native apps:

```ts
import { color, radius, fontSize, spacing, gradientBrand } from '@codecavepro/brand';

color.action;          // '#5F20FE'
color.surfaceSecondary; // '#0F0F15'
radius.card;           // '1.5rem'
fontSize.headingLg;    // { size: '3.5rem', lineHeight: '130%' }
spacing.sectionPaddingTop; // '12.5rem'
```

Everything is `as const`, so the values are literal types, and the key unions are
exported for building your own maps:

```ts
import type { SemanticColor, Radius, FontSizeStep } from '@codecavepro/brand';
```

| Module | Exports |
|---|---|
| colour | `brand`, `gray`, `accent`, `technologyGradient`, `error`, `color`, `gradientBrand` |
| layout | `radius`, `gutter`, `spacing`, `shadow`, `maxWidthDesktop`, `breakpointSm` |
| typography | `fontFamily`, `fontSize`, `fontWeight`, `eyebrow` |

Two things to know about it:

- **Size and line-height travel together.** `fontSize` steps are objects for that
  reason — never pair a size with a line-height from a different step.
- **The CSS is the source of truth.** This module is a faithful mirror of it. If the
  two ever disagree, the CSS wins and the module is the bug.

## Known divergence

`spacing.controlHeight` (and `--control-height`) is `2.75rem` / 44px, which is what the
design system specifies. **Production renders every button at 48px** — a `min-h-12`
floor out-cascades the declared height. The token is shipping at the documented value
rather than the observed one while that is settled upstream; if you are matching the
live site pixel-for-pixel, use 48px.

Tracked as [CCWEB2-319](https://codecave.atlassian.net/browse/CCWEB2-319).

## Documentation

This README covers installing and consuming the package. The design system itself —
the rules, the reasoning, the anti-patterns — is documented separately:

- **[brand.codecave.pro](https://brand.codecave.pro/)** — the published design system:
  brand kit, foundation specimens, and a storybook of real components.
- **[DESIGN.md](https://github.com/CodeCavePro/brand/blob/development/docs/DESIGN.md)** —
  the rules in full: the 26-step ramp, components, motion, anti-patterns, known
  divergences from what the site ships today.
- **[CodeCavePro/brand](https://github.com/CodeCavePro/brand)** — the repository.

## How this package is built

It authors nothing. Every byte is copied or compiled out of `docs/` in the repository
above: the CSS is copied verbatim, and the typed module is compiled from
`docs/tokens/*.ts`. `docs/` stays the single origin, and CI asserts the byte-identity
on every push.

Two editable copies of a palette is the exact failure this package exists to end, so it
would be self-defeating to introduce a second one on the way there. **Fixes go to
`docs/`, never to `packages/`.**

## Licence

[Unlicense](https://github.com/CodeCavePro/brand/blob/development/LICENSE). The
CODECAVE name and marks are not covered by it.
