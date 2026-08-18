# CODECAVE Brand

This repository contains resources for the **CODECAVE** brand such as [logos](/logos), [icons](/icons), [color palettes](#color-palettes), [fonts](#fonts) and other media.

> **This repository is the source of truth for the CODECAVE brand.** The design system is published
> at **<https://codecave.pro/brand/>** from [docs/](/docs) and documented in
> [docs/DESIGN.md](/docs/DESIGN.md). Implementations — including <https://codecave.gay> — conform
> to it, not the reverse.

## Design System

Everything published lives under [docs/](/docs). Start at the front door and read down:

| | What | Where |
|---|---|---|
| 1 | **The rules** — foundations, the 26-step ramp, components, motion, anti-patterns, known divergences | [docs/DESIGN.md](/docs/DESIGN.md) |
| 2 | **The tokens** — every value as a CSS custom property, semantic layer over raw ramp | [docs/colors_and_type.css](/docs/colors_and_type.css) |
| 3 | **The brand kit** — lockups, clear space, palette, type scale, the glow CTA | [docs/brand-kit.html](/docs/brand-kit.html) |
| 4 | **The specimens** — 12 review cards, one concern each | [docs/preview/](/docs/preview/) |
| 5 | **The storybook** — 13 components with real prop signatures and variant matrices | [docs/storybook/](/docs/storybook/) |

Link one stylesheet and the whole system is live on `:root` — no build step, no provider, no theme
object:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

Also in `docs/`: [tokens/](/docs/tokens) (the same tokens as typed TS modules, for consumers that
cannot read a stylesheet), [fonts/](/docs/fonts) (six real Satoshi cuts), [assets/](/docs/assets)
and [build/](/docs/build) (marks, icons and favicons), [imagery/](/docs/imagery) (the decorative
line-and-glow layer), [system/](/docs/system) (deck, email, poster and landing templates),
[ui_kits/app/](/docs/ui_kits/app) (the system applied to a working interface), and
[source_examples/](/docs/source_examples) (the first-party source the rules were read out of).

`docs/README.md` is the package guide; `docs/SKILL.md` is the agent-facing entry point.

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
| Purple Fill  | ![#9980FF](https://www.singlecolorimage.com/get/9980FF/32x32) | `#9980FF` | `--color-brand-210` |
| Cyan Accent  | ![#20EFFE](https://www.singlecolorimage.com/get/20EFFE/32x32) | `#20EFFE` | `--color-brand-400` |
| Page         | ![#050505](https://www.singlecolorimage.com/get/050505/32x32) | `#050505` | `--color-surface-primary` |
| Card         | ![#0D0D0F](https://www.singlecolorimage.com/get/0D0D0F/32x32) | `#0D0D0F` | `--color-surface-secondary` |
| Border       | ![#2E2C33](https://www.singlecolorimage.com/get/2E2C33/32x32) | `#2E2C33` | `--color-surface-quaternary` |
| Text         | ![#E8E6F0](https://www.singlecolorimage.com/get/E8E6F0/32x32) | `#E8E6F0` | `--color-body-primary` |
| Muted        | ![#645F70](https://www.singlecolorimage.com/get/645F70/32x32) | `#645F70` | `--color-body-secondary` |

The full 26-step ramp is in [docs/DESIGN.md → Colors](/docs/DESIGN.md#3-color). Two of those steps
(`--color-brand-107` and `--color-brand-620`) are imagery-only and must never be used for UI or
text.

Violet is rationed: `#5F20FE` edges, links and marks, and never fills a large area. When a purple
*field* is genuinely needed the system switches to `#9980FF` with `#1B0D4E` text — the only
dark-on-light text anywhere in the brand. `#20EFFE` is a gradient and orb motif only, never a UI
colour.

> Superseded: this table previously listed `#9D26FF`, `#212121`, `#ABB4BD`, `#CFD4DA` and
> `#F3F6F9`. None of those appear anywhere in the brand — they predate the current dark theme.

## Fonts

| Use Case |                           Link                               |          Weights          |
|----------|--------------------------------------------------------------|---------------------------|
| Website  |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  | 300 (light), 400 (normal), 700 (bold) |
| Logo     |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  |       700 (bold)          |

The design system ships **six real cuts** — Light, Regular, Italic, Medium, Bold and Black — as
`woff2` with `woff` fallbacks in [docs/fonts/](/docs/fonts), each bound with a proper
`font-weight` descriptor.

> **The live site has not caught up.** `codecave.pro` still self-hosts a single
> `Satoshi-Regular.ttf` declared with no `font-weight`, so 300 and 700 are synthesized by the
> browser there rather than being real cuts. Shipping the files from `docs/fonts/` fixes that
> without changing the design. See [docs/DESIGN.md §10.3](/docs/DESIGN.md#103-synthesized-vs-real-font-weights).
>
> **The logo artwork predates Satoshi.** The wordmarks in [src/](/src) are outlined paths drawn in
> Montserrat Bold, so the PNGs in [logos/](/logos) are still Montserrat-shaped. This is carried
> forward deliberately — re-typing the wordmark without a new master would produce a mark that
> matches nothing in circulation.

## Other Things To Know

Coming soon...

## How to Build

Put 3 types of the logo: square, horizontal and vertical into the [source folder](/src).
Edit the list of desired sizes for logos and icons in the [build script file](build.sh).
