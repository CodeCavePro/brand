/**
 * CODECAVE — typography tokens as a typed module.
 *
 * Mirrors `colors_and_type.css`. Original:
 * source_examples/brand-repo-tokens/typography.css, whose named heading sizes
 * come from the production `@theme` block; the remaining steps were measured
 * from the rendered site.
 *
 * One family, no display face, no serif, no second sans.
 */

export const fontFamily = {
  sans: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

/**
 * Nine steps. Size and line-height travel together — never pair them freely.
 *
 * The body steps are named for what they are, not for a t-shirt size, and that
 * is load-bearing rather than stylistic. `lg`, `sm` and `base` are also Tailwind
 * default theme names, at 1.125rem, 0.875rem and 1rem — so while this scale used
 * them, importing the stylesheet into any Tailwind app silently resized every
 * `text-lg` and `text-sm` in it. See CCWEB2-323, and the identical reasoning
 * already recorded against `--radius-sm` / `--radius-md` in colors_and_type.css.
 *
 * `md` survives only because Tailwind happens to have no `--text-md`;
 * `npm run check:collisions` is what will notice if that ever changes.
 */
export const fontSize = {
  headingLg: { size: '3.5rem', lineHeight: '130%' }, //  56px — hero
  headingMd: { size: '2.75rem', lineHeight: '115%' }, // 44px — section heading
  headingSm: { size: '2rem', lineHeight: '110%' }, //    32px — eyebrow + lead pair
  stat: { size: '2.25rem', lineHeight: '2.5rem' }, //    36px — stat figures
  subhead: { size: '1.5rem', lineHeight: '2rem' }, //    24px — subsection heading
  md: { size: '1.25rem', lineHeight: '1.75rem' }, //     20px — intro copy
  label: { size: '1.125rem', lineHeight: '1.75rem' }, // 18px — names, labels
  body: { size: '1rem', lineHeight: '1.5rem' }, //       16px — body, buttons
  caption: { size: '0.875rem', lineHeight: '1.25rem' }, // 14px — captions, labels
} as const;

/**
 * Two weights carry the whole system. 300, 500 and 900 exist in `fonts/` and
 * are bound, but no captured source uses them: 400 for everything, 700 for
 * headings, eyebrows, labels and button text.
 *
 * Production ships only Satoshi-Regular and lets the browser synthesize 700.
 * This package binds the real cuts — see DESIGN.md section 10.3.
 */
export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
} as const;

/**
 * The eyebrow: the system's one typographic signature. A bold, uppercase-weight
 * violet line paired with a larger light lead line, both `display: block` inside
 * a single heading element — one heading, two voices. Never render the eyebrow
 * as a separate sibling paragraph, and never let it appear without its lead.
 */
export const eyebrow = {
  size: fontSize.body.size,
  weight: fontWeight.bold,
  colorToken: '--color-action',
  leadSize: fontSize.headingSm.size,
  leadWeight: fontWeight.regular,
  leadColorToken: '--color-heading',
} as const;

export type FontSizeStep = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
