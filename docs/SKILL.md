---
name: codecave-design-system
description: The CODECAVE design system, extracted from first-party source (the CodeCavePro/brand repository and the production codecave.pro codebase). Use when designing, reviewing or building any CODECAVE-branded interface, page, deck or component — a near-black canvas with rationed violet, enormous radii, and an upward-throwing glow. Provides ready tokens, a component class layer, real Satoshi font files, preserved brand marks, ten review previews and a working applied UI kit.
user-invocable: true
---

# CODECAVE Design System

## What is inside

| Path | What it gives you |
|---|---|
| `colors_and_type.css` | **The deliverable.** Six `@font-face` bindings, the 26-step brand ramp, the semantic token layer, the type scale, radii, spacing, shadows, and a component class layer (`.btn*`, `.card*`, `.field`, `.checkbox`, `.chip`, `.eyebrow`, `.lead`, `.eyebrow-lead`, `.stat`, `.divider`, `.page-container`, `.section-container`). Link it and the system is live. |
| `tokens/` | The same tokens as typed TS modules — `colors.ts`, `layout.ts`, `typography.ts` — for consumers that cannot read a stylesheet. Mirrors the CSS; the CSS wins if they ever disagree. |
| `DESIGN.md` | The rules: product context, visual foundations, color, typography, spacing/radius/layout, components, motion, voice, twelve anti-patterns, known divergences, provenance. |
| `README.md` | Package guide, source references, the Preview Manifest, and the reuse workflow. |
| `preview/` | Eleven focused review cards plus a launcher. Static HTML, live tokens, no screenshots. |
| `imagery/` | The decorative line-and-glow art — seven stroke-only section backgrounds on their required `#050505` ground, with the byte-for-byte originals in `imagery/source/`. This is the brand's only non-photographic image system. |
| `assets/` | Brand marks and the raster lockup kit: 1024px masters plus 256px review cuts in all four finishes, wide and tall, the square app marks, the chevron, the checkbox tick, original font uploads. |
| `logos/` | Every lockup, once: the three vector masters (`codecave-wide.svg`, `codecave-tall.svg`, `codecave.svg`), the site header mark (`logo.svg`), and the raster ramp — 8 sizes × 4 finishes × 3 lockups. Rendered from `src/logos/`; do not redraw. |
| `icons/` | The seven-step square icon ramp, `16x16.png` → `512x512.png`. |
| `favicons/` | The web runtime set: `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, and both PWA manifest icons. `site.webmanifest` sits at the site root. |
| `fonts/` | Six real Satoshi cuts in woff2 + woff, bound by `colors_and_type.css`. |
| `src/components/` | Every Vue component the system documents, with the helpers and icons they reach for. These are the origin: the package is built from them and codecave.pro installs the result. |
| `src/captured/` | What is genuinely captured from elsewhere — the production `global.css` this repo reads but does not own, the wordmark, and snapshots of this repo's own earlier token CSS. |
| `storybook/` | One story per component, each mounting the real `.vue` single-file component with its props, variants and source path. |
| `examples/` | Whole surfaces composed from the system — pitch deck, contact form, marketing email, newsletter, landing page, print poster. One self-contained file each. |

## Source context

Extracted from first-party source, not from a rendered page:

- **`CodeCavePro/brand`** (GitHub, `main` and `development`) — published brand
  token files (`src/tokens/colors.css`, `layout.css`, `typography.css`), the
  `ds-bundle/` re-export, the three wordmark SVGs and the favicon. Evidence:
  `context/github/CodeCavePro-brand/`,
  `context/github/CodeCavePro-brand-development.md`.
- **`CodeCavePro/brand` working clone** — the binary trees the bounded GitHub
  intake does not materialize: `docs/logos/` (8 sizes × 4 finishes × 3 lockups),
  `docs/icons/` (7 square sizes), `docs/favicons/` (ICO, Apple touch, PWA manifest
  icons), and `tools/generate-brand-assets.sh`, the ImageMagick/Inkscape recipe
  that renders all three from `src/logos/`. Evidence: `context/local-code/brand/`.
- **`codecave.pro`** (production codebase) — the authoritative Tailwind 4
  `@theme` block in `src/styles/global.css`, plus 45 Vue components and 61 Astro
  pages. Evidence: `context/local-code/codecave.pro/`.
- **https://codecave.gay** — the live site, named in `.design-sync/config.json`
  as the measurement source. Steps below `--text-heading-sm`, section rhythm and
  card padding were measured here rather than read from a token file.
- The linked **Figma file was not decoded**; nothing in this package is
  Figma-derived.

CODECAVE is a software delivery studio. The captured surface is its marketing
site: dark, high-contrast, six outcome-titled services, and exactly one primary
action per page — a violet glow button leading to a free consultation.

## When to use this skill

Use it when the work is CODECAVE-branded and visual:

- Building or reviewing a page, screen, component, email or deck for CODECAVE.
- Choosing a color, radius, type step, shadow or spacing value in that context.
- Auditing existing work for drift — `DESIGN.md` §9 lists the twelve failure
  modes explicitly.
- Placing a logo, favicon or app icon. Take the file from `logos/`, `icons/` or `favicons/`;
  never redraw or re-type the wordmark.
- Writing UI copy: `DESIGN.md` §8 covers the voice.

Do **not** use it to derive a light theme. There is not one, and
`kitchen-sink/colors-theme-light.html` explains why the three light surfaces that
exist cannot be generalized into one.

## How to use

1. **Read `DESIGN.md` first** if you are making design decisions. It is the
   source of truth for the rules; this file is only the map.
2. **Link `colors_and_type.css`** — one stylesheet, no build step, no provider.
   Keep `fonts/` beside it so the `./fonts/Satoshi-*.woff2` URLs resolve.
3. **Consume the semantic tokens**: `--color-surface-primary/-secondary/
   -tertiary/-quaternary`, `--color-body-primary/-secondary/-secondary-lighter`,
   `--color-heading`, `--color-action`, `--color-hovered`, `--color-error*`.
   Only `glow-25`, `shadow-0` and `progress-0` may be consumed raw. Never
   hard-code a hex.
4. **Use the component classes** rather than rebuilding them — `.btn` + variant,
   `.card`, `.field`, `.checkbox`, `.chip`, `.eyebrow-lead`, `.section-container`.
5. **Open `kitchen-sink/index.html`** to see any rule rendered live before applying
   it. The Preview Manifest in `README.md` says what each card is for.
6. **Open `kitchen-sink/index.html`** when the target is a component and
   `examples/index.html` when it is a whole surface. The storybook mounts the
   genuine `.vue` files; the artifacts show the system at real page density.
7. **Take assets from `logos/`, `icons/` or `favicons/`.** Copy them; do not regenerate them.
8. **Check `DESIGN.md` §10** before matching production pixel-for-pixel — a
   few rules here intentionally improve on what the live site ships, and one
   former divergence (§10.1) is retired back to production behavior.

## Design system highlights

- **Four surfaces, one hair apart.** `#0A0A0B` page → `#0F0F15` card → `#1C1C27`
  raised → `#2B2848` hairline. Depth comes from radius and border, never from a
  lighter fill.
- **Enormous radii.** 24px is the *default* card corner; 36px for articles, 44px
  for feature cards, 64px for section panels and 120px above 768px. A 4px corner
  reads as generic admin UI and does not occur in source.
- **The inverted glow.** Every Y offset in `--shadow-section` is negative — panels
  throw violet light upward. Cards get no shadow at all. Normalizing this to a
  conventional drop shadow destroys the brand faster than changing the hue would.
- **Violet on edges only.** `#5F20FE` for borders, links, eyebrows and the focus
  halo. The single violet *field* is the glow button, at `#9980FF` with
  `#1B0D4E` text — the only dark-on-light text in the system.
- **One primary per action.** A long page may repeat the glow button once at the
  very end; two in a viewport is a defect.
- **The eyebrow is the typographic signature.** A bold violet line paired with a
  larger light lead, both `display: block` inside one heading. It opens nearly
  every section.
- **Nothing dims on hover.** Hover always raises contrast; only `:disabled`
  reduces it, to opacity 0.2.
- **One family, two weights in practice.** Satoshi at 400 and 700, with 300/500/900
  available. Headings 56/44/32px; body 16px.
- **Motion is entrance-only** — GSAP timelines with `stagger: 0.1` and
  `ease: 'circ.out'`, Lenis smooth scroll — and collapses entirely under
  `prefers-reduced-motion: reduce`. CSS owns state changes on three tokens
  only: 150ms `cubic-bezier(0.4, 0, 0.2, 1)` for anything that changes color,
  200ms ease for surfaces, 500ms ease for transform.
- **Two breakpoints, and that is all.** 768px is the one structural break;
  1280px only widens gutters against the fixed container. Below 768px
  everything is single-column. There is no tablet layout.
- **Decorative art is stroke-only.** Concentric orbs redrawn at
  `0.8 / 0.65 / 0.55 / 0.45` on growing radii — the opacity ladder *is* the
  falloff. Gradient stops are `#5F20FE`, `#20EFFE` and `#391398`. It renders
  only on the near-black canvas, because the ground is transparent.
