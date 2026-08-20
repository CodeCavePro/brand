/**
 * CODECAVE — layout, radius and elevation tokens as a typed module.
 *
 * Mirrors `colors_and_type.css`. Original:
 * source_examples/brand-repo-tokens/layout.css and the production
 * `.section-container` rule in source_examples/styles/global.css.
 */

import { brand } from './colors';

export const maxWidthDesktop = '1280px' as const;
export const breakpointSm = '457px' as const;

/**
 * Radii. CODECAVE runs unusually large corners — this is the loudest brand
 * signal in the system, louder than the violet. Nothing here is small; the one
 * 4px corner in the package is the checkbox box, which is Tailwind's default
 * leaking through an undeclared name on the site (CCWEB2-313), not a CODECAVE
 * value, so it is deliberately not a token.
 *
 * Every key is named for what it wraps rather than for a t-shirt size. `sm` and
 * `md` used to be here, and `--radius-sm` / `--radius-md` are also Tailwind
 * default theme names at *different* values (0.25rem, 0.375rem) — so markup
 * authored against one system and rendered in the other changed shape with
 * nothing to notice. The semantic names cannot collide.
 */
export const radius = {
  control: '0.5rem', //   8px — inputs, small chips
  tile: '0.75rem', //    12px — inline chips, icon tiles
  card: '1.5rem', //     24px — the DEFAULT card, dominant sitewide
  article: '2.25rem', // 36px — article / insight cards
  custom: '2.75rem', //  44px — feature and testimonial cards
  section: '4rem', //    64px — section panel below 768px
  sectionMd: '7.5rem', // 120px — section panel at and above 768px
  pill: '9999px', //          buttons, pills, avatars
} as const;

/** Page gutters, by breakpoint. */
export const gutter = {
  base: '0.5rem', // <768px
  md: '1rem', //    >=768px
  xl: '2rem', //    >=1280px
} as const;

/**
 * Section rhythm is deliberately asymmetric — a section carries far more air
 * above it than below, so a heading always arrives with space in front of it.
 */
export const spacing = {
  sectionPaddingTop: '12.5rem', //   200px
  sectionPaddingBottom: '7.5rem', // 120px
  cardPadding: '2rem 2rem 3rem', //  bottom-heavy: seats a footer action
  controlHeight: '2.75rem', //       44px — every button
  inputHeight: '4rem', //            64px — every text field
} as const;

/**
 * Elevation. Every Y offset is NEGATIVE: section panels throw violet light
 * upward, as if the source sat beneath the panel edge. It is physically wrong
 * and it is the single most recognizable thing in the system. Cards receive no
 * shadow at all — they separate with radius and a 1px `brand.110` hairline.
 */
export const shadow = {
  section: [
    `0 -64px 64px 0 hsl(from ${brand[660]} h s l / 0.20)`,
    `0 -10px 24px 0 hsl(from ${brand[660]} h s l / 0.10)`,
    `0 -6px 6px 0 hsl(from ${brand[660]} h s l / 0.08)`,
  ].join(', '),
  glowButton: '0 0 64px 0 #7A58FFA8, 0 0 16px 0 #4F22FFA6, 0 0 4px 2px #5B34FA',
  inputFocus: [
    `0 0 16px 0 hsl(from ${brand[500]} h s l / 0.5)`,
    `0 0 4px 0 hsl(from ${brand[500]} h s l / 0.6)`,
  ].join(', '),
} as const;

export type Radius = keyof typeof radius;
