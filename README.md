# CODECAVE Brand

This repository contains resources for the **CODECAVE** brand such as [logos](/logos), [icons](/icons), [color palettes](#color-palettes), [fonts](#fonts) and other media.

> **This repository is the source of truth for the CODECAVE brand.** The design system is published
> at **<https://brand.codecave.pro/>** from [docs/](/docs) and documented in
> [docs/DESIGN.md](/docs/DESIGN.md). Implementations — including <https://codecave.gay> — conform
> to it, not the reverse.
>
> **That is the target state, and we are not there yet.** `docs/` began highly divergent from the
> shipped site, so the current phase runs the other way: the design system is converging *onto*
> the website, without giving up the brand identity in the process. **That convergence is
> reached and the direction has inverted** — the site installs this package and keeps no
> copies, so `docs/` is the reference and the paragraph above governs. Review findings live in
> [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md); the component ones are now this repository's to fix.
>
> **Convergence is reached when codecave.pro installs `@codecavepro/brand` and deletes its own
> copy of the palette.** Not when the two "look the same" — that is a judgement someone has to
> re-make every time anyone asks, and the answer drifted by nine files in one day the last time
> it was measured by hand. It is a fact you can check in the site's `package.json`. Getting there
> was [CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318), which closed on
> 2026-08-25; this criterion is
> [CCWEB2-316](https://codecave.atlassian.net/browse/CCWEB2-316).

## Design System

Everything published lives under [docs/](/docs). Start at the front door and read down:

| | What | Where |
|---|---|---|
| 1 | **The rules** — foundations, the 26-step ramp, components, motion, anti-patterns, known divergences | [docs/DESIGN.md](/docs/DESIGN.md) |
| 2 | **The tokens** — every value as a CSS custom property, semantic layer over raw ramp | [src/styles/colors_and_type.css](/src/styles/colors_and_type.css) |
| 3 | **The brand kit** — lockups, clear space, palette, type scale, the glow CTA | [docs/index.html](/docs/index.html) |
| 4 | **The specimens** — 12 review cards, one concern each | [docs/preview/](/docs/preview/) |
| 5 | **The storybook** — 13 components with real prop signatures and variant matrices | [docs/storybook/](/docs/storybook/) |

Link one stylesheet and the whole system is live on `:root` — no build step, no provider, no theme
object:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

Also in `docs/`: [tokens/](/src/tokens) (the same tokens as typed TS modules, for consumers that
cannot read a stylesheet), [fonts/](/src/fonts) (six real Satoshi cuts), [assets/](/docs/assets)
and [build/](/docs/build) (marks, icons and favicons), [imagery/](/docs/imagery) (the decorative
line-and-glow layer), [artifacts/](/docs/artifacts) (deck, email, newsletter, form, poster and
landing templates), and [src/components/](/src/components) (the component sources the
rules were read out of).

`docs/README.md` is the package guide; `docs/SKILL.md` is the agent-facing entry point.

**Changing any of it: [CONTRIBUTING.md](/CONTRIBUTING.md).** Read it before your first edit.
`docs/` is the origin and everything else is downstream of it, but two directories under
`docs/` must never be hand-edited either — and nothing in this repo fails loudly when a
derived copy goes stale.

## Logos

### Wide version

| Version | Preview |
|---|---|
| Inverse | ![Inverse](/logos/codecave-wide-256-text-white.png) |
| Default | ![Default](/logos/codecave-wide-256-text-black.png) |
| B/W White | ![Default](/logos/codecave-wide-256-all-white.png) |
| B/W Black | ![Default](/logos/codecave-wide-256-all-black.png) |

### Tall version

| Version | Preview |
|---|---|
| Inverse | ![Inverse](/logos/codecave-tall-128-text-white.png) |
| Default | ![Default](/logos/codecave-tall-128-text-black.png) |
| B/W White | ![Default](/logos/codecave-tall-128-all-white.png) |
| B/W Black | ![Default](/logos/codecave-tall-128-all-black.png) |

## Icons

| Version | Preview |
|---|---|
| 256px (png) | ![Icon 256](/icons/256x256.png "Icon 256")  |
| 128px (png) | ![Icon 128](/icons/128x128.png "Icon 128")  |
| 64px (png) | ![Icon 64](/icons/64x64.png "Icon 64")  |
| 32px (png) | ![Icon 32](/icons/32x32.png "Icon 32")  |
| 16px (png) | ![Icon 16](/icons/16x16.png "Icon 16")  |

[View more sizes](/icons)

## Color Palettes

### Branding

| Web Colors | Color | HEX value | Token |
|---|---|---|---|
| Brand Purple | ![#5F20FE](https://www.singlecolorimage.com/get/5F20FE/32x32) | `#5F20FE` | `--color-action` |
| Purple Fill  | ![#9980FF](https://www.singlecolorimage.com/get/9980FF/32x32) | `#9980FF` | `--color-glow-25` |
| Cyan Wash    | ![#077689](https://www.singlecolorimage.com/get/077689/32x32) | `#077689` | `--color-technology-gradient-0` |
| Page         | ![#0A0A0B](https://www.singlecolorimage.com/get/0A0A0B/32x32) | `#0A0A0B` | `--color-surface-primary` |
| Card         | ![#0F0F15](https://www.singlecolorimage.com/get/0F0F15/32x32) | `#0F0F15` | `--color-surface-secondary` |
| Border       | ![#2B2848](https://www.singlecolorimage.com/get/2B2848/32x32) | `#2B2848` | `--color-surface-quaternary` |
| Text         | ![#F4F4F6](https://www.singlecolorimage.com/get/F4F4F6/32x32) | `#F4F4F6` | `--color-body-primary` |
| Muted        | ![#9595BB](https://www.singlecolorimage.com/get/9595BB/32x32) | `#9595BB` | `--color-body-secondary` |

The full ramps — 12 violet brand steps and 13 grays, verbatim from the site's 2026 palette
rebuild — are in [docs/DESIGN.md → Colors](/docs/DESIGN.md#3-color). Two measured art literals
(`#391398` and `#4C4759`) are imagery-only and must never be used for UI or text.

Violet is rationed: `#5F20FE` edges, links and marks, and never fills a large area. When a purple
*field* is genuinely needed the system switches to `#9980FF` with `#1B0D4E` text — the only
dark-on-light text anywhere in the brand. Bright cyan `#20EFFE` lives only in the decorative orb
art since the rebuild; the token layer's sole cyan is the deep technology wash above.

> Superseded: this table previously listed `#9D26FF`, `#212121`, `#ABB4BD`, `#CFD4DA` and
> `#F3F6F9`. None of those appear anywhere in the brand — they predate the current dark theme.

## Fonts

| Use Case |                           Link                               |          Weights          |
|----------|--------------------------------------------------------------|---------------------------|
| Website  |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  | 300 (light), 400 (normal), 700 (bold) |
| Logo     |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  |       700 (bold)          |

The design system ships **six real cuts** — Light, Regular, Italic, Medium, Bold and Black — as
`woff2` with `woff` fallbacks in [src/fonts/](/src/fonts), each bound with a proper
`font-weight` descriptor.

> **The live site has not caught up.** `codecave.pro` still self-hosts a single
> `Satoshi-Regular.ttf` declared with no `font-weight`, so 300 and 700 are synthesized by the
> browser there rather than being real cuts. Shipping the files from `src/fonts/` fixes that
> without changing the design. See [docs/DESIGN.md §10.3](/docs/DESIGN.md#103-synthesized-vs-real-font-weights).
>
> **The logo artwork predates Satoshi.** The wordmarks in [src/](/src) are outlined paths drawn in
> Montserrat Bold, so the PNGs in [logos/](/logos) are still Montserrat-shaped. This is carried
> forward deliberately — re-typing the wordmark without a new master would produce a mark that
> matches nothing in circulation.

## The npm package

The same tokens install as **`@codecavepro/brand`** — the CSS and a typed module, no runtime and
no components:

```css
@import "@codecavepro/brand/css";
```

It authors nothing. `packages/brand/` copies `src/styles/colors_and_type.css` and `src/fonts/fonts.css`
byte-for-byte and compiles `src/tokens/*.ts`, so the file in your `node_modules` and the file at
<https://brand.codecave.pro/colors_and_type.css> are provably the same bytes. **`docs/` stays the
single origin — fixes go there, never to `packages/`.**

- [packages/brand/README.md](/packages/brand/README.md) — installing and consuming it.
- [RELEASING.md](/RELEASING.md) — how it gets published, and how to get out of a bad publish.

> **Published on public npm** as [`@codecavepro/brand`](https://www.npmjs.com/package/@codecavepro/brand).
> Releases go out from a pushed tag as an npm trusted publisher, so each one carries a
> provenance attestation naming the commit and the workflow run that built it.

## Other Things To Know

Coming soon...

## How to Build

Put 3 types of the logo: square, horizontal and vertical into the [source folder](/src).
Edit the list of desired sizes for logos and icons in the [build script file](tools/generate-brand-assets.sh).
