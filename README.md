# CODECAVE Brand

This repository contains resources for the **CODECAVE** brand such as [logos](/logos), [logos](/icons), [color palettes](#color-palettes), [fonts](#fonts) and other media.

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

|     Web Colors   |                               Color                           |  HEX value |
|------------------|---------------------------------------------------------------|------------|
| Primary Purple   | ![#175DDC](https://www.singlecolorimage.com/get/5F20FE/32x32) |  `#5F20FE` |
| Accent Purple    | ![#9D26FF](https://www.singlecolorimage.com/get/9D26FF/32x32) |  `#9D26FF` |
| Deep Dark Gray   | ![#212121](https://www.singlecolorimage.com/get/212121/32x32) |  `#212121` |
| Medium Gray      | ![#ABB4BD](https://www.singlecolorimage.com/get/ABB4BD/32x32) |  `#ABB4BD` |
| Light Gray       | ![#CFD4DA](https://www.singlecolorimage.com/get/CFD4DA/32x32) |  `#CFD4DA` |
| Accent Gray      | ![#F3F6F9](https://www.singlecolorimage.com/get/F3F6F9/32x32) |  `#F3F6F9` |

## Fonts

| Use Case |                           Link                               |          Weights          |
|----------|--------------------------------------------------------------|---------------------------|
| Website  |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  | 400 (normal), 700 (bold)  |
| Logo     |  [Satoshi](https://www.fontshare.com/fonts/satoshi)  |       700 (bold)          |

> **Only one real cut ships.** The site self-hosts a single `Satoshi-Regular.ttf`, declared with no
> `font-weight` descriptor — so the 300 and 700 weights it renders are synthesized by the browser,
> not real cuts. Shipping the genuine Light and Bold files (and declaring `font-weight` on each
> `@font-face`) would fix that without changing the design.
>
> **The logo artwork predates Satoshi.** The wordmarks in [src/](/src) are outlined paths drawn in
> Montserrat Bold, so the PNGs in [logos/](/logos) are still Montserrat-shaped. Re-setting the
> wordmark in Satoshi Bold and re-running [build.sh](build.sh) would bring them in line.

## Design System

Everything below is observed from the production implementation at <https://codecave.gay>
(Astro v6.4.8 + Tailwind), read from computed styles rather than from source. It documents what
the site *does today* — where it disagrees with the brand definitions above, the sections above
are the intent and the site is the thing that needs to change.

### Design Tokens

The implementation exposes a single brand ramp as CSS custom properties on `:root`. Numbering runs
light to dark, with the accents parked mid-ramp.

| Token | HEX | Role observed |
|---|---|---|
| `--color-brand-0`   | `#e8e6f0` | Heading / primary text |
| `--color-brand-25`  | `#dfdde4` | — |
| `--color-brand-50`  | `#c6c4cc` | Secondary body text |
| `--color-brand-100` | `#645f70` | Muted / caption text |
| `--color-brand-105` | `#585461` | — |
| `--color-brand-110` | `#2e2c33` | — |
| `--color-brand-130` | `#2a2637` | — |
| `--color-brand-200` | `#b19afe` | Gradient stop |
| `--color-brand-210` | `#9980ff` | **Primary button fill** |
| `--color-brand-300` | `#8252fc` | Gradient stop |
| `--color-brand-400` | `#20effe` | Cyan accent |
| `--color-brand-450` | `#077689` | Deep cyan |
| `--color-brand-500` | `#5f20fe` | **Primary purple** — actions, borders, links |
| `--color-brand-580` | `#5206e3` | — |
| `--color-brand-600` | `#4004af` | — |
| `--color-brand-650` | `#33196e` | — |
| `--color-brand-660` | `#281470` | — |
| `--color-brand-670` | `#1b0d4e` | Text on light-purple fills |
| `--color-brand-700` | `#1a0452` | — |
| `--color-brand-800` | `#1e113b` | — |
| `--color-brand-900` | `#070312` | — |
| `--color-brand-910` | `#0d0d0f` | **Card / panel surface** |
| `--color-brand-920` | `#141319` | Raised surface |
| `--color-brand-950` | `#050505` | **Page background** |

| Error token | HEX |
|---|---|
| `--color-error-100` | `#fe9a9a` |
| `--color-error-200` | `#fe2020` |
| `--color-error-300` | `#b42318` |
| `--color-error-400` | `#ca1400` |

### Semantic Aliases

Tailwind utilities map onto the ramp, so components reference intent rather than raw hex:

| Utility | Resolves to |
|---|---|
| `text-heading` | `--color-brand-0` &nbsp;`#e8e6f0` |
| `text-action`, `border-action` | `--color-brand-500` &nbsp;`#5f20fe` |
| `text-error` | `--color-error-300` &nbsp;`#b42318` |

### Brand Gradient

```css
linear-gradient(to right, #5f20fe 0%, #8252fc 60%, #b19afe 75%, #e8e6f0 100%);
```

Purple-to-white sweep used for emphasis rules and accents. A separate radial white-to-transparent
glow (`#ffffff → rgba(223,212,249,.765) → rgba(153,128,255,0)`) backs the orb motifs.

### Type Scale

Dark-theme defaults; sizes in px with observed line-height.

| Size / LH | Weight | Usage |
|---|---|---|
| 56 / 72.8 | 700 | Hero headline |
| 44 / 50.6 | 700 | Section heading (`h2`) |
| 36 / 40   | 700 | Stat figures |
| 32 / 35.2 | 700 · 300 | Lead paragraph — 700 in `#5f20fe` as an eyebrow, 300 in `#e8e6f0` as prose |
| 24 / 32   | 700 | Subsection heading (`h3`) |
| 20 / 28   | 700 · 400 | Emphasis / intro copy |
| 18 / 28   | 400 · 700 | Names, labels |
| 16 / 24   | 400 · 700 | Base body, button text |
| 14 / 20   | 400 | Captions, attributions (`#645f70`) |

### Buttons

Both variants are fully rounded pills at `padding: 4px 24px`, `font-size: 16px`.

| Variant | Fill | Text | Border |
|---|---|---|---|
| Primary | `#9980ff` (`brand-210`) | `#000000` | none |
| Secondary | transparent | `#e8e6f0`, weight 700 | `1px solid #5f20fe` |

Disabled state is the secondary treatment at `opacity: .2` with `cursor: not-allowed`.

### Surfaces & Radii

Cards sit on `#0d0d0f` (`brand-910`) against the `#050505` page. Corner radii are unusually large
and vary by component family:

| Radius | Applied to |
|---|---|
| `24px` | Default card — the dominant radius sitewide |
| `36px` | Article / insight cards (`padding: 24px`) |
| `44px` | Feature cards (`padding: 24px 44px`) |
| `12px`, `8px`, `3px` | Inline chips, inputs, small elements |
| full | Buttons, pills, avatars |

Card padding is typically `32px 32px 48px` — heavier at the bottom to seat a footer action.

### Layout

| Property | Value |
|---|---|
| Container max-width | `1280px` |
| Content column | `1265px` |
| Section horizontal padding | `120px` (desktop) |
| Section vertical rhythm | `200px` top / `120px` bottom |

## Other Things To Know

Coming soon...

## How to Build

Put 3 types of the logo: squate, horizontal and vertical into the [source folder](/src).
Edit the list of desired sizes for logos and icons in the [build script file](build.sh).
