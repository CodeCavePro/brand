---
name: "CODECAVE"
category: Brands
surface: web
colors:
  surface-primary: "#0a0a0b"
  heading-body: "#f4f4f6"
  action: "#5f20fe"
  surface-secondary: "#0f0f15"
  body-secondary: "#9595bb"
  surface-quaternary: "#2b2848"
---

# CODECAVE Design System

> Category: Brands · Surface: web · Canonical rules document

*CODECAVE is **dark, round, and violet** — in that order of importance.*

This file is the source of truth. `colors_and_type.css` is its machine-readable
half; every value below is traceable to a file under `context/`. Where the
evidence is thin or contradictory, this document says so rather than guessing.

---

## 1. Product context

CODECAVE (codecave.it) is a boutique software and digital solutions company
that helps businesses build, modernize, and support practical technology
products. It works with CEOs, CTOs, founders, and technical teams that need
custom software, cloud and DevOps support, QA, UX/UI, ETL, CAD and BIM add-ins,
and 3D or AR product experiences — delivered with predictable communication,
clean data, and reliable execution.

The company focuses on low-risk, high-impact, sustainable delivery, and applies
automation and AI where they speed things up without reducing quality. Typical
clients are software and SaaS companies, IT-led businesses, and teams in
healthcare, fintech, edtech, and manufacturing.

**The surface this system describes.** One responsive marketing and lead
generation website — `codecave.pro`, staged at `codecave.gay`. Astro 7 + Vue 3 +
Tailwind 4: 61 `.astro` files, 45 `.vue` files, **zero React**, no Storybook
(`.design-sync/NOTES.md`). The primary surfaces evidenced in source are:

| Surface | Source |
|---|---|
| Site header with a Services mega-dropdown | `common/BrandNav.vue`, `header/services-list.vue`, and the caller's own menu data |
| Mobile menu drawer | `header/mobile-menu.vue` |
| Service / hero heading block with the single glow CTA | `services/heading.astro` |
| Consultation lead form | `common/forms/ContactUsForm.vue` |
| Insight (article) cards | `common/ArticlePreview.vue` |
| Attributed testimonial cards | `common/Review.vue` |
| Rotated, gradient-bordered technology cards | `homepage/technology-card.vue` |
| Section panels with the upward glow | `.section-container` in `global.css` |

**Six services** are the product's information spine, and each is titled by the
outcome rather than the stack (`header/menu.ts`): Cloud & DevOps — *Optimize
costs. Protect your Data*; E-Commerce — *Maximize revenue, dominate Markets*;
Autodesk plugins — *10x efficiency with custom Plugins*; Automation & AI —
*Leverage virtual Workforce*; HubSpot — *Aggregate data from all your Tools*;
AR & VR — *Stunning visualisations for your business*.

### Correction to the previously registered palette

An earlier extraction registered `#aaccee` as the page background and `#5f20fe`
as the body-text foreground. **Neither is correct.** `#aaccee` appears nowhere
in the first-party source. `#5F20FE` is the *action* color — links, borders,
eyebrows — and is never used for body text. The palette in section 3 replaces
it and is taken verbatim from `global.css`.

### The 2026 palette rebuild

In August 2026 production rebuilt its palette wholesale, and this package
re-based onto it (the standing policy: **the package matches the live site;
site-side problems go to `WEBSITE-REVIEW.md`, not into a fork**). What moved:

- The page ground lightened from `#050505` to **`#0A0A0B`**, and every text
  color moved from the old violet-tinted steps to a new **gray ramp**
  (headings `#F4F4F6`, secondary `#9595BB`).
- **Cyan left the ramp.** `brand-400` is now a violet (`#5F3ABD`); the bright
  `#20EFFE` survives only inside the decorative SVGs (§8), and the deep
  `#077689` only inside the technology-card wash tokens.
- The ramp was renumbered, and several step names were **re-used with
  different hexes** — old `brand-300` `#8252FC` vs new `brand-300` `#735CAB`,
  old `brand-600` `#4004AF` vs new `brand-600` `#4705ED`. Never map old and
  new tokens by step name; map by hex or by role.

Every value in this document reflects the rebuilt palette. Where a contrast
verdict changed with the ground (§10.2, §10.5), the section says so.

---

## 2. Visual foundations — the four decisions

Everything else follows from these.

1. **Depth is not built from contrast.** The page is `#0A0A0B`; cards rise one
   barely-perceptible step to `#0F0F15`. That narrow separation is deliberate.
   If you find yourself lightening a card to make it read, you have made a
   layout mistake, not a color mistake.
2. **Corners are enormous.** 24px is the *default* card. Feature cards run
   44px, article cards 36px, section panels 64–120px. Buttons are fully round.
   A 4px radius is instantly off-brand.
3. **The light comes from below.** Section panels cast violet light *upward* —
   the source sits under the panel edge. It is physically wrong and instantly
   recognizable. Never replace it with a conventional drop shadow.
4. **Violet is rationed.** `#5F20FE` edges, links, and marks; it never fills a
   large area. When a genuine purple *field* is needed it switches to the
   lighter `#9980FF` and flips to near-black text — the only dark-on-light text
   in the entire system.

---

## 3. Color

Two layers. The raw ramps — a violet brand ramp and a gray ramp — exist only
so the semantic names have somewhere to point. **Always consume the semantic layer; never hard-code a hex.**

### Semantic tokens — use these

| Token | Value | Use |
|---|---|---|
| `--color-surface-primary` | `#0A0A0B` | the page |
| `--color-surface-secondary` | `#0F0F15` | cards |
| `--color-surface-tertiary` | `#1C1C27` | raised / hovered card, icon tiles |
| `--color-surface-quaternary` | `#2B2848` | borders, dividers, checkbox outline |
| `--color-surface-primary-hover` | `#232339` | surface hover |
| `--color-surface-primary-transparent` | `#0A0A0B` @ 30% | backdrop-blur dropdown |
| `--color-heading` | `#F4F4F6` | headings |
| `--color-body-primary` | `#F4F4F6` | body text |
| `--color-text-body-primary` | `#D5D5DD` | long-form article copy |
| `--color-body-secondary-lighter` | `#C7C7DB` | descriptions, secondary copy |
| `--color-body-secondary` | `#9595BB` | metadata, timestamps, placeholders |
| `--color-neutral` | `#6B6699` | muted metadata — 3.76:1, large text only |
| `--color-action` | `#5F20FE` | links, eyebrows, borders, focus glow — 2.94:1, so **not for text at any size** (§10.5) |
| `--color-hovered` | `#B19AFE` | hover foreground, focus ring |
| `--color-outline-primary-hover` | `#1B0D4E` | checkbox resting border; text on `#9980FF` |
| `--color-default-transparent` | `#DCDCE5` | resting icon color on dark |
| `--color-failureproof-0` | `#050505` | one full-black section ground |
| `--color-error` | `#B42318` | error text |

### Raw ramps

Verbatim from `global.css` after the 2026 rebuild — a violet brand ramp, a
gray ramp, and a handful of single-use accents.

**Brand (violet):** `-25` `#E8E6F0` · `-50` `#BBB9CB` · `-100` `#B8AFDB` ·
`-200` `#B19AFE` · `-300` `#735CAB` · `-400` `#5F3ABD` · `-500` `#5F20FE` ·
`-600` `#4705ED` · `-700` `#4004AF` · `-800` `#1B0D4E` · `-900` `#1E113B` ·
`-950` `#0A0A0B`

**Gray:** `-50` `#F4F4F6` · `-100` `#DCDCE5` · `-200` `#D5D5DD` · `-300`
`#C7C7DB` · `-400` `#A3A3C2` · `-500` `#9595BB` · `-600` `#6B6699` · `-700`
`#2B2848` · `-800` `#232339` · `-900` `#1C1C27` · `-950` `#15151E` · `-1000`
`#050505` · `-1100` `#0F0F15`

**Single-use accents:** `glow-25` `#9980FF` (the glow-button fill) ·
`shadow-0` `#281470` (the upward section glow) · `progress-0` `#8252FC` (the
brand-gradient mid stop). These three are the only values legitimately
consumed raw, because that is exactly how production consumes them.

**Technology-card wash:** `technology-gradient-0` `#077689` · `-25` `#1A0452`
· `-50` `#070312` — always at 0.1 alpha, and the only cyan left in the token
layer (see below).

**Error:** `-100` `#FE9A9A` · `-200` `#FE2020` · `-300` `#B42318` · `-400`
`#CA1400`

Two quirks are upstream facts, not package errors (WEBSITE-REVIEW.md §5): the
gray ramp is **non-monotonic past 950** — `gray-1100` `#0F0F15`, the card
surface, is *lighter* than `gray-1000` `#050505` — and `brand-500` is lighter
than `brand-400`. The semantic layer hides both, which is one more reason
never to consume the ramps raw.

**`#391398` and `#4C4759` are imagery-only.** Both were measured out of the
decorative SVGs in `src/assets/images/` — `#391398` is the mid stop of the orb
gradients, `#4C4759` the landmass stroke in `world-map.svg`. The rebuilt ramp
gives them no token name, so they remain what they always were: art literals,
documented in §8. **Neither may be used for UI or text.**

### The cyan

Bright cyan `#20EFFE` survives only in the decorative orb SVGs (§8). The 2026
rebuild removed it from the ramp entirely: the technology card's border
gradient still blends `brand-500 → brand-400 → brand-500` at low alpha
(`homepage/technology-card.vue`), but `brand-400` is now the violet `#5F3ABD`,
so the ring reads violet end to end. The only cyan in the token layer is the
deep `#077689` inside the technology-card *wash*
(`--color-technology-gradient-0`, 0.1 alpha). **Never use cyan for
photographic grading, body text, a CTA, or a large field.** It is a light
effect in the art, not a UI color.

### The brand gradient

```css
--gradient-brand: linear-gradient(to right,
  #5F20FE 0%, #8252FC 60%, #B19AFE 75%, #E8E6F0 100%);
```

Left-to-right violet resolving into near-white. The mid stop is the once-used
`progress-0` accent, **not** `brand-300` — the rebuilt ramp's `brand-300`
(`#735CAB`) is a different, muted violet. Used for display type and rule
accents, not as a page wash.

The gradient is permitted as a *field* in exactly one component — the rule and
progress line in §6 — and nowhere else. Everywhere else it clips to text.

### There is no light theme

The system is dark-first and ships no light mode. Three light-surface
*exceptions* exist and they are the complete set:

1. The primary button field `#9980FF` with `#1B0D4E` text.
2. The near-white type ramp (`#F4F4F6` / `#C7C7DB`) on dark.
3. The `codecave-*-text-black` wordmark variants, for print and genuinely light
   third-party surfaces only.

Do not invent a light theme. If a light surface is unavoidable, use the
wordmark's black-text variant and keep every other token unchanged.

---

## 4. Typography

**One family: Satoshi.** Display and body are the same face — this is a
utilitarian, data-dense brief by charter standards, and the single-family rule
is the brand's own austerity, not an oversight.

```
--font-sans: Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", "Noto Sans", Arial, sans-serif;
```

Only **two** weights are used in production: 400 regular and 700 bold. The
package binds real Light/Medium/Black cuts as well, but designs should stay on
400/700 to match the shipped site.

> **Known defect, carried forward.** Production declares one `@font-face` with
> no `font-weight` descriptor, so its 300 and 700 text is browser-synthesized.
> This package binds real cuts (`fonts/`). Package output at 700 will be
> slightly tighter than the live site until production ships the same files.

### Scale

| Token | Size | Line height | Use |
|---|---|---|---|
| `--text-heading-lg` | 56px | 130% | hero headline |
| `--text-heading-md` | 44px | 115% | section heading |
| `--text-heading-sm` | 32px | 110% | eyebrow + lead pair |
| `--text-stat` | 36px | 40px | stat figures |
| `--text-subhead` | 24px | 32px | subsection heading |
| `--text-md` | 20px | 28px | intro copy |
| `--text-label` | 18px | 28px | names, labels |
| `--text-body` | 16px | 24px | body, buttons |
| `--text-caption` | 14px | 20px | captions, form labels |

The hero steps down responsively: `text-heading-sm` on mobile →
`text-heading-md` at `md` → `text-heading-lg` at `xl` (`services/heading.astro`).

### The eyebrow — the one signature move

Bold violet line stacked over a larger light lead line. It opens nearly every
section, and it is the system's only typographic flourish. Do not add a second.

```html
<h2>
  <span class="lead">Our expertise</span>
  <span class="eyebrow">is part of their success</span>
</h2>
```

In source (`homepage/expertise.astro`, `services/heading.astro`) the two spans
are `block`-level inside a single heading, light line first, violet line
second. Both are bold. The pair is *one* sentence broken across two colors —
never two separate sentences.

---

## 5. Spacing, radius, and layout

### Radius — the loudest signal

| Token | Value | Applies to |
|---|---|---|
| `--radius-control-sm` | 4px | the 16px checkbox box, and nothing else |
| `--radius-control` | 8px | inputs, small chips |
| `--radius-tile` | 12px | inline chips, icon tiles |
| `--radius-card` | 24px | **default card, dominant sitewide** |
| `--radius-article` | 36px | article / insight cards |
| `--radius-custom` | 44px | feature and testimonial cards |
| `--radius-section` | 64px | section panel, `<768px` |
| `--radius-section-md` | 120px | section panel, `>=768px` |
| `--radius-pill` | 9999px | buttons, pills, avatars |

Measured radius census on the homepage: 24px on 42 blocks, 12px on 9, 44px on
8, 8px on 7, 120px on 2. The 4px step renders nowhere on the homepage — it
exists only for the small checkbox box, which the homepage does not use.

**Every name in that table describes what it wraps, and that is load-bearing.**
The two that were `--radius-sm` and `--radius-md` are also Tailwind default
theme names, at *different* values — 0.25rem and 0.375rem against this system's
0.5rem and 0.75rem. The site emits Tailwind's defaults (its `@theme` declares
one radius, `--radius-custom`), so any markup that named `--radius-sm` got 8px
here and 4px there with nothing to notice: no error, no warning, just a
different shape. Renamed 2026-08-20 so the collision is structurally impossible.

`Checkbox.vue` was the case that made it visible, and it is now **resolved on
both sides**: the site declares `--radius-control: 0.5rem` in its own `:root`
rather than inheriting a name it never defined, so the checkbox corner went 4px
→ 8px and the two systems agree on one value under one name
([CCWEB2-313](https://codecave.atlassian.net/browse/CCWEB2-313)). The site-side
change deliberately reuses this exact token name: any other name at the same
value would have recreated the original bug one layer over.

### Container

`.page-container` — centred, `max-width: 1280px`, gutters 8px (`<768px`) →
16px (`>=768px`) → 32px (`>=1280px`). Breakpoint `sm` is a non-standard
**457px**.

### Breakpoints

A census of every `@media` rule in the captured source returns exactly two
width breakpoints: **768px** (6 occurrences) and **1280px** (3). An earlier
revision of the source also carried `prefers-reduced-motion: reduce` (3
occurrences); the current source ships none — see §7 and WEBSITE-REVIEW.md §2.

That is the whole responsive contract, and it is deliberately coarse:

- Below **768px** everything is single-column. This is the mobile layout, not a
  squeezed desktop one.
- **768px** is the one structural break. The section-panel radius flips
  `64px → 120px` across it, gutters go `8px → 16px`, and the stat and service
  rails switch from stacked to `justify-evenly` rows.
- **1280px** only widens gutters to 32px against the fixed `max-width: 1280px`
  container. No new layout appears.

There is **no tablet-specific layout**, and adding one would be a change to the
system rather than an application of it. The non-standard `sm` at 457px noted
above is a Tailwind config value, not a layout break — nothing keys off it.

### Rhythm

Section padding is asymmetric: **200px top, 120px bottom**. Card padding is
`32px 32px 48px` — heavier at the bottom because it seats a footer action.

### Elevation

```css
--shadow-section:
  0 -64px 64px 0 hsl(from #281470 h s l / 0.20),
  0 -10px 24px 0 hsl(from #281470 h s l / 0.10),
  0 -6px   6px 0 hsl(from #281470 h s l / 0.08);
```

All three offsets are **negative on Y**. This is the inverted glow. It is the
system's strangest and best idea and it is not optional.

---

## 6. Components

Derived from real source; each entry names its file.

### Buttons — `common/Button.vue`, `common/GlowButton.vue`

Every button carries a **48 × 48px minimum box** — `min-w-12 min-h-12` on the
shared base class — with `padding: 4px 24px`, `border-radius: 9999px`,
`font-weight: 700`, `font-size: 16px`. Treat 48px as the floor for any control
a finger has to land on: the mobile burger was moved from 44px to 48px in the
same change, so this is a rule, not a one-off. It clears WCAG 2.5.5 AAA (44px)
rather than merely meeting 2.5.8 AA (24px).

The `secondary` and `tertiary` variants still declare `h-11` (44px) on top of
that base. They do not render at 44px — `min-height` beats `height` in CSS, so
every one of them is 48px tall and the `h-11` is dead.

`--control-height` is therefore `3rem` (48px), and `.btn` applies it as
**`min-height`**, not `height`. Both halves of that matter: the value is what
production actually renders, and the property is what lets a wrapped label grow
instead of being clipped — which a fixed height would not.

It said `2.75rem` until 2026-08-21, on the reasoning that it was what the
specimen markup set. That was circular — the specimen set 44px because the
token did — and it contradicted the paragraph directly above it in this file.
Settled under the standing policy: where the two disagree, the site wins and
`docs/` moves. The dead `h-11` is the site's to remove, and stays filed as
[CCWEB2-319](https://codecave.atlassian.net/browse/CCWEB2-319).

| Variant | Rest | Hover | Active |
|---|---|---|---|
| `glow` (the one true CTA) | fill `#9980FF`, text `#1B0D4E`, halo | cursor-tracked white glow sweep | `scale(0.98)` |
| `primary` | fill `#5F20FE`, text `#F4F4F6` | fill `#4004AF` | fill `#1E113B` |
| `secondary` | fill `#1E113B`, text `#F4F4F6` | fill `#1C1C27` | — |
| `tertiary` | 1px border `#5F20FE`, transparent | border `#4004AF` | — |
| `ghost` | text `#F4F4F6`, no box | text `#B19AFE` | text `#B19AFE` |
| `text` | text `#C7C7DB` | text `#B19AFE` | text `#B19AFE` |
| `link` | text `#B19AFE`, underlined | — | — |
| disabled | `opacity: 0.2`, `cursor: not-allowed` | none | none |

Every hover moves *toward* more contrast or more saturation — with one shipped
exception: the `tertiary` border hovers *down* to `#4004AF` (~1.75:1 on the
page). This package reproduces it faithfully (§10.1) and WEBSITE-REVIEW.md §4
flags the direction for a designer decision.

**One action, one primary.** The homepage repeats *"Learn more"* as the
bordered `tertiary` variant many times and reserves the glow button for the
single consultation CTA. Never place two glow buttons in one viewport.

### Text input — `common/InputText.vue`

64px tall, `--radius-control` (8px), fill `--color-surface-secondary`, hover fill
`--color-surface-tertiary`. A **floating label** sits absolutely at
`padding: 12px 0 0 12px`, bold, 14px, `--color-heading`; the input itself is
padded `28px 12px 12px` so the label never collides with the value. Required
fields append an asterisk icon. Placeholders are 12px `--color-body-secondary`.

Focus does not draw an outline — it draws a violet **halo**:

```css
input:focus {
  outline: none;
  box-shadow: 0 0 16px 0 hsl(from #5F20FE h s l / 0.5),
              0 0 4px  0 hsl(from #5F20FE h s l / 0.6);
}
```

Error swaps the halo to the red ramp and turns the value text `--color-error`.

### Checkbox and radio — `common/Checkbox.vue`, `common/Radio.vue`

Two variants. Default: 24px box, 2px border `#1B0D4E`, hover border
`--color-action`, gap 12px. Secondary (the chip form used for service
selection): wrapped in a `--color-surface-secondary` pill with
`--radius-control` (8px — `rounded-lg` in source), 2px outline
`--color-surface-quaternary`, checked fill `--color-action`, hover outline
`--color-action`. The tick is `assets/checked-icon.svg`, scaled `0 → 1` on
hover and check.

**The default box takes `--radius-control` (8px), same as every other input.**
It did not always. `Checkbox.vue` used to write `border-radius:
var(--radius-sm)` in its scoped style against a site that declared no such
name, so the box fell through to Tailwind's `0.25rem` — 4px, chosen by nobody,
and the only value this document ever carried that was not a CODECAVE
decision. Resolved 2026-08-20: the site now declares `--radius-control: 0.5rem`
in its own `:root` and the component reads that
([CCWEB2-313](https://codecave.atlassian.net/browse/CCWEB2-313)). One value,
one name, both systems.

**The 16px box takes `--radius-control-sm` (4px), and the corner cannot be
size-independent.** Half of 16 is 8, so applying the 8px control corner to the
small box renders a perfect circle — a radio button for a pick-any control.
`Checkbox.vue` keys the distinction off a `data-size` attribute rather than a
utility class, so it holds without a Tailwind build; `colors_and_type.css`
mirrors it on `.checkbox-chip input`.

Note the chip variant is currently **unreachable on the live site**:
`Checkbox.vue` types `variant?: 'primary'` and its `case 'secondary'` branch is
dead code that no caller passes, so the only checkboxes that render anywhere
are the contact form's two 24px ones. The specimen is kept because the branch
is still in source; see [WEBSITE-REVIEW.md](/WEBSITE-REVIEW.md) §4.

### Cards

| Card | Radius | Fill | Hover | Source |
|---|---|---|---|---|
| Default | 24px | `#0F0F15` | `#1C1C27` | sitewide |
| Article | 36px | `#0F0F15` + 1px `#1C1C27` hairline | `#1C1C27` | `common/ArticlePreview.vue` |
| Testimonial | 44px | transparent + `blur(32px)` | — | `common/Review.vue` |
| Technology | 24px | transparent + `blur(14px)`, 1px gradient border | rotates upright | `homepage/technology-card.vue` |

The article card is the only one that carries a border. It gained
`border-surface-tertiary border` on 2026-08-20 — the same `#1C1C27` the other
cards use as their *hover* fill, so at rest the hairline reads as the edge of
where the hover state will go. It is a 1px separator, not a frame: nothing else
in the system outlines a card, and adding a second one would turn a signature
into a pattern.

The technology card is the system's one piece of showmanship: cards sit at
`±1°/±2°/±4°` rotations and translate upright when active. Its border is a
masked gradient (`brand-500 → brand-400 → brand-500`), not a solid stroke.

### Section panel

`.section-container` — `--radius-section` / `--radius-section-md`,
`--color-surface-primary` fill, `--shadow-section`, `z-index: 50`,
`transform: translateZ(0)` and `contain: layout style` for paint containment.

### Navigation — `common/BrandNav.vue`, `header/services-list.vue`

Logo centred absolutely; three ghost links left, two right. The Services item
opens a dropdown on hover: `--color-surface-primary-transparent` fill with
`backdrop-blur(48px)`, 16px radius, 20px padding, holding a two-column grid of
icon-tile + name + outcome-description rows. Icon tiles are 12px-radius
`--color-surface-tertiary`. One nav item carries a red pulsing dot
(`box-shadow` on `--color-error-400`) — codecave.pro puts it on "Contact us".

The bar takes its items, its wordmark and its active state as props and reads no
route table, which is what lets one component serve both the marketing site and
this documentation site. It needs no JavaScript: the dropdown is CSS hover, so
rendered from Astro without a client directive it emits static HTML.

Until 2026-08-24 this described `header/desktop-menu.vue`, a second
implementation that codecave.pro owned and that differed in five numbers — 14px
links in 44px rows against 16px in 48px, a 24px wordmark against 28px, and no
bottom rule. The dot was a `ul:last-of-type li:last-child::after` rule, so it
marked a POSITION rather than an item and would have moved on its own the first
time the menu was reordered.

### Rule and progress — the gradient line

Source: the brand repository's previously published docs site, where it sat
under the masthead as `.rule`. It is the one element that site had which this
package did not, and it is kept.

```css
.rule     { height: 4px; max-width: 320px; border-radius: 9999px;
            background: var(--gradient-brand); }
.progress { height: 4px; max-width: 320px; border-radius: 9999px;
            background: var(--color-surface-quaternary); overflow: hidden; }
.progress > .progress-value { width: var(--progress, 0%);
            background: var(--gradient-brand);
            background-size: var(--progress-track-width, 320px) 100%; }
```

Three rules govern it, and each has a visible failure mode — all three are shown
side by side on `preview/components-progress.html`:

- **4px, never thicker.** At 16px the gradient stops being a line and becomes a
  violet field, which §9.4 forbids.
- **Capped at 320px.** Stretched across a container the four stops spread far
  enough apart that the gradient flattens into a pale wash and stops reading as
  brand. Widen it only by also widening `--progress-track-width`.
- **The gradient is sized to the track, not to the fill.** Sizing it to the fill
  paints near-white at 5% progress, so an almost-empty bar reads as finished.
  `background-size: var(--progress-track-width) 100%` anchors violet at 0% and
  keeps near-white meaning *done*.

`.rule` carries no value — use `<hr class="rule">` so it is a separator in the
accessibility tree. `.progress` is decorative markup rather than a native
`<progress>`, so it needs `role="progressbar"` with `aria-valuenow`.

`.progress.is-indeterminate` sweeps a 40% band for work with no measurable end;
prefer the determinate bar whenever a percentage exists. The global
reduced-motion collapse (§7) pins animations to 0.01ms, which would strand the
sweep off-screen, so the variant falls back to a filled track at 0.6 opacity.

---

## 7. Motion

Slow and continuous, never snappy. GSAP + ScrollTrigger, wrapped in Lenis
smooth scroll.

- **Durations** 0.5s for pointer-driven movement, 1–1.2s for entrances.
- **Easing** `power2.out` for pointer follow, `circ.out` for entrances.
- **Stagger** 0.1s across grouped items.
- **Entrances** translate from 100% with opacity 0, triggered `top bottom` →
  `bottom center`.
- **The glow button** tracks the cursor with `gsap.quickTo` — compositor-only
  transforms, never animated `left`/`top`. On leave it returns to rest after a
  1s delay over 1s.
- **Performance contract** anything GSAP touches declares `will-change` up
  front; `.section-container` gets `translateZ(0)` + `contain: layout style`;
  the footer uses `content-visibility: auto`.

GSAP owns entrances. **CSS owns state changes**, and it uses three tokens only:

```css
--transition-colors: 150ms cubic-bezier(0.4, 0, 0.2, 1); /* Tailwind's curve */
--transition-base:   200ms ease;   /* surfaces, shadows, focus halo */
--transition-slow:   500ms ease;   /* transform only */
```

The split is worth stating because it is easy to get wrong: **anything that
changes a color, border or fill uses the 150ms curve**; anything that moves
uses 500ms. Buttons transition `color`, `background-color` and `border-color`
together on `--transition-colors` so a hover can never land half-applied — the
one case where an inconsistent duration would be visible as a color tear.
Nothing in the system animates `opacity` and `transform` on different clocks.

Everything collapses under `prefers-reduced-motion: reduce` — in **this
package**. `colors_and_type.css` ships a global collapse with `!important` on
animation, transition, and scroll behavior — `animation-duration: 0.01ms`,
`animation-iteration-count: 1`, `transition-duration: 0.01ms`,
`scroll-behavior: auto`. That last declaration is load-bearing: it is what
disables the Lenis smooth scroll, so the block does not merely shorten
transitions, it stops scroll hijacking for users who asked for neither. An
earlier revision of `global.css` shipped the same block; the 2026 rebuild
dropped it, and production currently honors the preference **nowhere**
(WEBSITE-REVIEW.md §2, P0). This is the one place the package deliberately
keeps what the site lost — a best-practice floor, not a stylistic fork. The
block is non-negotiable and ships in `colors_and_type.css`.

---

## 8. Voice

Speaks as a small senior team talking straight to a decision-maker: first-person
plural, present tense, short declaratives. Leads with the business outcome, then
names the technology. Confident without superlatives — *"My consultation is
free. No strings attached."*, not *"world-class"*. Risk, cost, and ownership are
addressed head-on: *"We are ready to sign an NDA to protect your intellectual
property. Your idea stays yours."* Reassurance, not excitement, is what the
audience is buying.

**Use:** Discuss project for free · Get a free consultation · Discuss
partnership · Learn more · Tell us about your project · Optimize costs ·
payback · scope, milestones and outcomes upfront · Your idea stays yours.

**Avoid:** world-class · best-in-class · cutting-edge · industry-leading ·
revolutionary · game-changing · synergy · leverage *as a noun* · paradigm ·
ecosystem-speak · exclamation marks outside a single lead-magnet CTA ·
hard-sell urgency · **unattributed statistics or invented metrics** — every
figure on the site carries a named source.

### Imagery

Dark-ground product photography and flat vector illustration, always
composited onto the near-black canvas. Screenshots sit in device mockups or
run full-bleed, cropped into the system's large radii. Decorative art is
line-and-glow: thin violet strokes, concentric orbs, radial gradients fading to
transparent so they read as emitted light.

Avoid: white or light image backgrounds · square un-rounded corners ·
conventional downward drop shadows under imagery · stock handshake photography ·
competing saturated hues · icons and avatars treated as brand imagery.

**The decorative art, measured.** Seven section backgrounds were harvested into
`imagery/` during the deep pass; the untouched originals are in
`imagery/source/`. Every one is a stroke-only vector on a `fill="none"` root —
there is not a single filled shape in the set. Concentric circles and long arcs
are drawn at **0.05–0.8 opacity** with gradient strokes in `#5F20FE`, `#20EFFE`
and `#391398`. The opacity ladder is the technique: the same orb is redrawn at
`0.8 / 0.65 / 0.55 / 0.45` on descending radii, which is what produces the
falloff rather than an actual blur.

Because the ground is transparent and the strokes are low-opacity violet, this
art is **invisible on a light canvas** — it is not merely off-brand there, it
does not render. The copies in `imagery/` therefore carry an explicit
`#050505` ground rect so they reproduce correctly in any viewer; the originals
in `imagery/source/` are byte-identical to the production files and are the
ones to ship.

The `work-process-img-*.jpg` set was deliberately **not** taken as brand
imagery. Eleven of the thirteen are 400×400 squares, which by rendered size and
role are thumbnails or avatars, and the brand bars avatars as brand imagery. No
raster tooling was available in this environment, so their ground color is
*unmeasured* — the honest statement is that they were excluded on role, not
cleared on contrast.

### Logo

Primary lockup is the horizontal wordmark (`build/codecave-wide.svg`,
357×110). The chevron glyph is always `#5F20FE`; the wordmark paths are white,
so the default pairing is white-on-near-black. Use the black-text variant only
on a genuinely light surface, and the all-white variant for one-ink printing.
`build/codecave.svg` is the glyph-only mark; `build/favicon.svg` is the real
CODECAVE favicon.

**Three lockups, four finishes, eight sizes.** Everything raster is generated —
never hand-exported — by `build.sh` in the brand repository, which renders the
three vectors in `src/` through Inkscape and ImageMagick at 96, 128, 256, 300,
350, 500, 600 and 1024px:

| Lockup | Vector | Raster name |
|---|---|---|
| Square glyph | `src/codecave.svg` | `codecave-{size}x{size}.png` |
| Horizontal | `src/codecave-wide.svg` | `codecave-wide-{size}-{finish}.png` |
| Stacked | `src/codecave-tall.svg` | `codecave-tall-{size}-{finish}.png` |

| Finish | Composition | Use |
|---|---|---|
| `text-white` | white wordmark, violet chevron | **default** — the dark canvas |
| `text-black` | black wordmark, violet chevron | genuinely light third-party surfaces |
| `all-white` | flattened to white | one-ink reverse printing |
| `all-black` | flattened to black | one-ink positive printing |

App and web icons are the glyph, never the wordmark: `icons/` carries 16, 32,
64, 96, 128, 256 and 512px squares (preserved at `build/icons/`), and
`favicons/` carries the installable web set — `favicon.ico`, `favicon.svg`,
`favicon-96x96.png`, `apple-touch-icon.png`, and the 192/512px PWA icons
declared by `site.webmanifest`. Take these files; regenerate other sizes from
the vectors rather than upscaling a PNG.

> **Known defect.** The wordmark artwork predates Satoshi and is still drawn in
> outlined Montserrat Bold. The paths are outlined vector, not live text, and
> must never be re-typed by hand.

---

## 9. Anti-patterns

Ship-blocking, in rough order of how often they get attempted.

1. **A conventional drop shadow on a section panel.** The glow is inverted.
   Positive Y offsets destroy the single most recognizable thing in the system.
2. **Small radii.** Anything under 8px. 2–4px reads as generic admin UI.
3. **Lightening cards to create depth.** `#0F0F15` against `#0A0A0B` is the
   point. Reach for radius, border, and the glow instead.
4. **`#5F20FE` as a large fill.** It edges, links, and marks. Purple *fields*
   are `#9980FF` with `#1B0D4E` text.
5. **Cyan as a UI color.** `#20EFFE` lives only in the decorative orb art;
   the token layer's sole cyan is the technology-wash `#077689` at 0.1 alpha.
6. **A second glow button in one viewport.** One action, one primary. Secondary
   entry points are the bordered `tertiary` variant.
7. **Hover states that dim.** Never move a foreground toward `--color-body-
   secondary` on hover. Every hover in source gains contrast or saturation —
   except the tertiary border (§10.1), which is documented, not endorsed.
8. **A light theme.** None exists. Do not derive one.
9. **A second typographic flourish.** The eyebrow is the whole vocabulary.
10. **Invented metrics.** *15+ years*, *4.8 average rating* are real and
    sourced. Do not add unattributed figures, and do not fabricate client names.
11. **Motion that ignores `prefers-reduced-motion`.** The global collapse block
    is part of the system, not boilerplate.
12. **Emoji as functional icons**, purple gradient washes on every layer, and
    icons beside every heading — none of these appear in source.
13. **A thickened or full-width gradient rule.** Past 4px it becomes a violet
    field (see 4); past 320px the gradient flattens into a pale wash. Both
    failures are rendered as counter-examples in
    `preview/components-progress.html`.

---

## 10. Known divergences

The places where this package deliberately does **not** match what
`codecave.pro` ships today. Each is a considered correction, not a
transcription error, and each is reversible if the production behavior is
preferred. (One former entry, §10.1, has been retired back to production
behavior under the site-wins policy.)

**When the site-wins policy ends.** It ends when `codecave.pro` installs the
`@codecavepro/brand` npm package and deletes its own copy of the palette — at
which point this file stops describing a target and starts describing what
ships, and a divergence below becomes a bug in production rather than a
considered correction here. The criterion is deliberately a fact you can check
in the site's `package.json`, not a judgement about whether the two look the
same: measured by hand, that judgement moved by nine files in a single day. See
[CCWEB2-318](https://codecave.atlassian.net/browse/CCWEB2-318) for the work and
[CCWEB2-316](https://codecave.atlassian.net/browse/CCWEB2-316) for this
criterion.

### 10.1 `.btn-tertiary` hover — retired divergence

An earlier revision of this package brightened the tertiary border on hover to
`--color-hovered`, against production's hover-*down*. Under the standing
policy — **the package matches the live site; site-side problems go to the
designer report** — that fork is retired. `.btn-tertiary:hover` now ships
exactly what `Button.vue` does: the border drops to `brand-700` `#4004AF`,
~1.75:1 on the page, so the affordance dims at the moment the pointer confirms
it. The bordered button is the workhorse of the site, used dozens of times per
page, which is why WEBSITE-REVIEW.md §4 flags the direction for a designer
decision. If a brighter hover lands upstream, this package follows it.

### 10.2 Error text color

`--color-error` is `#B42318` (`error-300`), which measures **3.01:1** on
`#0A0A0B` — below the 4.5:1 floor for body text. The production site uses it for
form error messaging.

The 2026-08-20 resync gave that sentence a name: `common/TextField.vue` gained
an `isError` / `errorMessage` state and styles both the invalid value and the
12px message with `text-error`. On the field's own `--color-surface-secondary`
(`#0F0F15`) that measures **2.91:1**, against **9.37:1** for the `error-100`
that `InputText.vue` uses for the same job. Filed as CCWEB2-320.

This package keeps `#B42318` for icons, rules and non-text marks, and renders
error *messages* in `--color-error-100` `#FE9A9A` (**9.71:1**). The error halo
still uses `error-200`/`error-100` exactly as `InputText.vue` defines it, so the
field itself is unchanged. See `preview/components-inputs.html`.

### 10.3 Synthesized vs. real font weights — retired divergence

codecave.pro shipped one real cut — `Satoshi-Regular.ttf` at weight 400, with no
`font-weight` descriptor, which made that one file the match for every weight and
left 97 elements browser-synthesized. It now declares the same ten faces this
package does — 300/400/500/700/900, upright and italic — so the fork is retired
under the standing policy. Shipped in CCWEB2-309.

What remains true and is not a divergence: **the package ships no font binaries.**
It declares the faces and a consumer supplies the files. That is a redistribution
question, recorded in `packages/brand/scripts/build.mjs`, and no release changes it.

**Do not "simplify" the declarations by adopting the vendor's stylesheet.** The
Fontshare download ships a `stylesheet.css` that declares Bold and Black *both* as
`font-weight: bold`, and their italics likewise, so four cuts collide into two slots
and whichever is declared last silently wins. Binding explicit numeric weights is
what makes a 900 render as 900. It also uses `local()` lookups, which Fontshare's
own packaging defeats: Light, Medium and Black are separate families there, so three
of the italics carry no italic bit at all.

**Not a divergence:** the wordmark artwork is still drawn in outlined Montserrat
Bold rather than Satoshi. That defect is carried forward faithfully — the paths
are outlined vector, and re-typing the wordmark in Satoshi without a new master
would produce a mark that matches nothing in circulation.
### 10.4 The production favicon is not a CODECAVE mark

As captured, `codecave.pro/public/favicon.svg` is still the Astro starter's
default glyph — a stock framework mark that was never part of this brand. It
stays in the evidence snapshot
(`context/local-code/codecave.pro/files/public/favicon.svg`) and is deliberately
absent from `build/`, so nothing in this package can ship it by accident. The
real mark is `build/favicon.svg`, generated from `src/codecave.svg`. The fix
upstream is to replace the site's favicon with it.

### 10.5 The eyebrow now fails contrast at every size

`--color-action` `#5F20FE` measured **3.03:1** on the old `#050505` page —
enough, barely, for large bold type. The 2026 rebuild lightened the page to
`#0A0A0B`, and the same violet now measures **2.94:1** — a hair *under* the
3:1 large-text floor:

| Usage | Size | Floor | Result |
|---|---|---|---|
| `.eyebrow-lead .eyebrow` — the signature pair | 32px bold | 3:1 (large) | **2.94:1 — fails, barely** |
| `.eyebrow` at caption size | 14px bold | 4.5:1 (normal) | **2.94:1 — fails** |

The signature pair used to be the one place violet-on-black was defensible;
since the rebuild it no longer is, at any size. `.eyebrow` in
`colors_and_type.css` is still **left exactly as production ships it** — the
site wins on values — and the shortfall is recorded in WEBSITE-REVIEW.md §2
for a designer: the deficit is 0.06, so any slightly lighter violet clears it.

The package's own chrome does not inherit the problem: `.pv-head .eyebrow` and
`.bk-eyebrow` render in `--color-hovered` `#B19AFE` (**8.41:1**), which is
already the system's foreground accent. The rule to carry forward: **an
eyebrow in `--color-action` currently fails WCAG at every size; chrome and new
surfaces should use `--color-hovered`.**

This is the same shape of problem as §10.2 and is resolved the same way —
keep production's value in the components, substitute the in-palette lighter
step in the package's own chrome, and write down which is which.

### 10.6 Email artifacts render the CTA green

`artifacts/email.html` ships both CTAs as lime green. The cause is one
attribute:

```html
<td align="center" bgcolor="var(--brand-color-primary)">
```

`bgcolor` is a presentational attribute parsed with the HTML **legacy color
rules** - an algorithm with no access to CSS, so it cannot resolve a custom
property. It does not fail and fall back. It replaces every non-hex character
with `0`, pads to a multiple of three, and reads the result as a color:
`var(--brand-color-primary)` becomes **`#A0D000`**. The literal string is
choosing the color, not the token.

Both CTAs in `email.html` and both in `newsletter.html` are corrected to the
glow button written with literals end to end - `#9980FF` field, `#1B0D4E` text
(5.67:1), `9999px` radius, and `--shadow-glow-button` expanded verbatim.
Padding and font size are literal too, because Outlook's Word engine does not
support `var()` at all and the button would otherwise collapse to zero padding.

**The rule: never put `var()` inside `bgcolor`, and prefer literals over tokens
anywhere in an email artifact.** The token layer stops at the inbox boundary.

Outlook still squares the pill and drops the halo, leaving a flat `#9980FF`
field with `#1B0D4E` text. That degradation is intentional - the fill and the
text color are the parts carrying the brand.

The footer signature is corrected in the same pass. As first written these
files carried a placeholder postal address and a brand-guide host that is not
CODECAVE's website; the registered line is
**CODECAVE - 8 The Green, STE B, 19901 Dover DE, US - codecave.pro**.

Neither correction is expressible in `brand.json`. Both were defects in the
template that produced these files rather than in the values fed to it, which
is why no change to the palette or the voice summary fixes them. The artifacts
are hand-maintained now, so both fixes are permanent — but any future process
that re-emits these files from a template will reintroduce both, and this
section is the record of what to re-apply.

### 10.7 The email token layer stops at the inbox

The green CTA was the visible half of a larger problem: `email.html` is themed
entirely through `var()`. Custom properties are not part of any email client's
supported CSS. Outlook renders through the Word engine, which ignores them
outright; several webmail clients strip `<style>` before the message is shown.
Every color, size and font in the document therefore resolves to nothing, and
the message degrades to unstyled black-on-white.

The repair flattens all 29 custom properties to literals at every use site and
mirrors each resulting background onto a `bgcolor` attribute, which is the only
fill instruction a `<style>`-stripping client has left. `<body>` carries the
page color the same way, so no white band appears below a short message. Two
`color-scheme` meta tags declare the message already dark, which stops
Outlook.com and Apple Mail from relighting it.

The token values themselves were retuned first, because the generator's layer
is an Ant-derived *approximation* of CODECAVE rather than CODECAVE:

| Token | Generated | Corrected | Why |
|---|---|---|---|
| `--brand-color-primary` | `#7040da` | `#9980FF` | duller and bluer than the brand violet, and only 3.18:1 as text; `#9980FF` is the real primary and matches the button fill |
| `--brand-color-primary-bg` | `#0e0725` | `#0F0F15` | the hero panel. `#0e0725` belongs to no ramp step and reads as navy against the `#0A0A0B` page; gray-1100 is the documented card surface, one step off the page |
| `--brand-color-link` | `#7040da` | `#B19AFE` | brand-200, 8.41:1 |
| `--brand-color-text` | `#c6c4cd` | `#F4F4F6` | gray-50 |
| `--brand-color-text-secondary` | `#99979e` | `#C7C7DB` | gray-300 |
| `--brand-color-text-tertiary` | `#6b6a6f` | `#9595BB` | gray-500, 6.87:1; the generated value was 3.62:1 - below AA |
| `--brand-color-text-quaternary` | `#3e3d40` | `#9595BB` | was **1.9:1**, and it is the line carrying the postal address |

Every text-on-background pair in the corrected file was then measured against
its true nesting context. All 9 distinct pairs pass AA; the lowest is the
button itself at 5.67:1.

`newsletter.html` has since been flattened the same way - both artifacts now
carry literals end to end, updated to the rebuilt palette (page `#0A0A0B`,
panel `#0F0F15`, text `#F4F4F6` / `#C7C7DB` / `#9595BB`, borders `#2B2848`,
and the unchanged `#9980FF` / `#1B0D4E` CTA).

---

## 11. Provenance

| Evidence | Path | Read method |
|---|---|---|
| Brand repo (`main`) — tokens, wordmarks, favicon | `context/github/CodeCavePro-brand/` | `git-clone` |
| Brand repo (`development`) — `DESIGN.md`, `ds-bundle/` re-export | `context/github/CodeCavePro-brand-development.md` | `git-clone` |
| Brand repo binaries — `logos/`, `icons/`, `favicons/`, `build.sh` | `context/local-code/brand/files/` | `local-folder` |
| Production site — components, theme, assets | `context/local-code/codecave.pro/` | `local-folder` |
| Published brand site | https://codecavepro.github.io/brand | fetched, structural confirmation only |
| Live production site | https://codecave.gay | named in `.design-sync/config.json` as the measurement source |
| Figma design file | https://www.figma.com/design/IvwZHE6Iuo243QkdtR96L3/ | **linked but not decoded** — no snapshot captured, contributed nothing to this document |
| Uploaded brand assets | `assets/` (Satoshi cuts, 9 PNG lockups) | setup upload |
| Decorative section art — 8 SVGs | `imagery/source/` ← `codecave.pro/src/assets/images/` | `local-folder`, copied byte-for-byte |

**Uncertainties, stated rather than papered over.**

- Section rhythm (200/120), card padding, control heights, and the type steps
  below `--text-heading-sm` are *measured from the rendered site*, not read from
  a token file. They are accurate to the pixel but are not declared tokens
  upstream.
- No Figma snapshot was decoded, so nothing here is Figma-derived.
- `preview/colors-theme-light.html` documents light-surface *exceptions*; it is
  not a light theme, because none exists.
- The ground color of `work-process-img-*.jpg` is **unmeasured** — no raster
  decoder was available in this environment. Those files were excluded from
  `imagery.samples` on semantic role, not on a contrast measurement.
- `#4C4759` and `#391398` are *measured* from production SVGs. An earlier
  revision carried them as inferred ramp steps (`brand-107`/`brand-620`); the
  rebuilt ramp has no place for them, so they are recorded as imagery
  literals only (§3, §8). Upstream still never named them.
- The breakpoint census covers the captured source only. It is complete for
  what was captured, which is the homepage, workflow, project and header
  component set — not every route on the site.
