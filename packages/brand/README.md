# @codecavepro/brand

The CODECAVE design system as **CSS custom properties** and as a **typed module** —
colour, typography and layout tokens, with no runtime, no provider and no component
bundle.

Link one stylesheet and the whole system is live on `:root`.

> **Status: stable.** The token *values* mirror what
> [codecave.pro](https://codecave.pro) ships, and the package *layout* — export paths,
> module shape — is settled under semver: an export will not move or disappear outside a
> major bump. Token *values* can change in a minor or patch release, because they track a
> living design system; pin an exact version if you need them frozen.

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

## Controls are 48px, and it is a floor

`spacing.controlHeight` / `--control-height` is `3rem` — 48px, what codecave.pro
actually renders. `.btn` applies it as `min-height` rather than `height`, so a button
whose label wraps grows instead of clipping. If you build your own controls from the
token, do the same.

48px clears WCAG 2.5.5 AAA outright rather than merely meeting 2.5.8 AA, so there is no
separate mobile size.

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
