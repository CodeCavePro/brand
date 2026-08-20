# CODECAVE — brand guidelines

Canonical at <https://codecavepro.github.io/brand/>, published from `CodeCavePro/brand`.
Implementations conform to this document; where the live site differs, the site is what changes.

## Logo

The brand repository ships three source marks (`src/`), each exported to PNG at many sizes:

| Mark | Use |
|---|---|
| **Square** (`codecave.svg`) | Avatars, favicons, app icons — anywhere the container is square |
| **Wide** (`codecave-wide.svg`) | Site headers, letterheads, horizontal lockups |
| **Tall** (`codecave-tall.svg`) | Vertical lockups, portrait-oriented layouts |

Wide and tall marks are exported in four treatments: `text-white` (default, for dark backgrounds),
`text-black` (for light backgrounds), and `all-white` / `all-black` single-colour versions for
one-ink printing and stamping.

Because CODECAVE is dark-first, **`text-white` on `--color-surface-primary` is the default
pairing.** Reach for `text-black` only when the mark sits on a genuinely light surface.

The wordmark is outlined vector paths, not live text — it does not depend on a font being
installed, and it must never be re-typed by hand to fake a missing size. Export from `src/`.

## Colour

- The page is near-black (`--color-surface-primary`, #0A0A0B). Cards step up one level to
  `--color-surface-secondary` (#0F0F15). This narrow separation is deliberate — depth comes from
  radius and glow, not from strong contrast between surfaces.
- `--color-action` (#5F20FE) is the brand purple. It carries interaction: links, borders, eyebrow
  text, focus. Use it for emphasis, not for large fills.
- Large violet fills use `--color-glow-25` (#9980FF) with deep-navy `--color-brand-800`
  (#1B0D4E) text — that is the glow button, and it is the only place violet fills an area.
- The cyan #20EFFE is an imagery-only art literal since the 2026 rebuild — it survives in the
  orb artwork, never in UI chrome, and it is no longer a ramp step. The only token-layer cyan is
  the translucent technology wash (`--color-technology-gradient-0`, #077689).
- Never introduce a colour that isn't in the ramp. If a design seems to need one, it doesn't.

## Type

One family: **Satoshi**. Headings bold, long-form copy regular, lead paragraphs light.

The signature pattern is the **eyebrow**: short bold text in `--color-action`, directly above a
larger light lead line. Use it to open a section rather than inventing a new heading treatment.

The system uses three weights — 300, 400 and 700 — and nothing outside them. All six Satoshi
cuts ship in this package as real files; the production site still serves a single TTF, so *its*
300/700 text is browser-synthesized until it catches up.

## Shape

Corners are large and they are a brand signal:

- Cards: 24px (`--radius-card`)
- Feature and article cards: 36–44px
- Section panels: 64px, rising to 120px at ≥768px
- Buttons, pills, avatars: fully round

Small radii (2–4px) read as generic and off-brand.

Section panels carry an **upward** violet glow (`--shadow-section`) — the light source sits below
the panel edge. This is unusual; keep it, and don't replace it with a conventional drop shadow.

## Motion

Motion is slow and continuous rather than snappy. The reference implementation uses GSAP with
scroll-driven pinning and a Lenis smooth-scroll wrapper. All of it must collapse under
`prefers-reduced-motion: reduce` — `styles.css` enforces this globally. (Production currently
ships no reduced-motion path at all; that gap is flagged for the site in WEBSITE-REVIEW.md, and
the package keeps the collapse as the floor.)

## What not to do

- Don't hard-code hex values. Every brand colour has a token name.
- Don't put white text on the glow button's `--color-glow-25` fill — it takes `--color-brand-800` ink.
- Don't use small corner radii.
- Don't re-type the wordmark in a live font.
- Don't reach for weights outside 300/400/700.
