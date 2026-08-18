/**
 * CODECAVE — color tokens as a typed module.
 *
 * A faithful mirror of `colors_and_type.css`, for consumers that cannot read a
 * stylesheet: design tooling, canvas/WebGL renderers, PDF and email builders,
 * native apps. The CSS file remains the source of truth — if the two ever
 * disagree, the CSS wins.
 *
 * Originals: source_examples/brand-repo-tokens/colors.css (CodeCavePro/brand)
 *            source_examples/styles/global.css            (codecave.pro @theme)
 */

/** The raw 24-step ramp: light to dark, accents mid-ramp.
 *  Do NOT consume these directly. Three exceptions are documented below. */
export const brand = {
  0: '#E8E6F0', //   headings, body text
  25: '#DFDDE4', //  icon default on dark
  50: '#C6C4CC', //  secondary body, lighter
  100: '#645F70', // muted metadata
  105: '#585461', // neutral
  110: '#2E2C33', // borders / quaternary surface
  130: '#2A2637', // surface hover
  200: '#B19AFE', // hover foreground
  210: '#9980FF', // RAW-OK — the glow button fill (takes #1B0D4E text)
  300: '#8252FC', // gradient mid
  400: '#20EFFE', // RAW-OK — cyan, gradient and orb motifs ONLY
  450: '#077689', // deep cyan, card gradient wash
  500: '#5F20FE', // ACTION — links, borders, eyebrows
  580: '#5206E3',
  600: '#4004AF', // primary button hover
  650: '#33196E',
  660: '#281470', // RAW-OK — seeds the upward section glow
  670: '#1B0D4E', // text ON the #9980FF button; production outline hover
  700: '#1A0452',
  800: '#1E113B', // primary button active
  900: '#070312',
  910: '#0D0D0F', // card surface — one hair off the page
  920: '#141319', // raised surface
  950: '#050505', // the page
} as const;

export const error = {
  100: '#FE9A9A', // error value + message text (8.4:1 on the page)
  200: '#FE2020', // error halo
  300: '#B42318', // --color-error: icons and rules, NOT body text (3.2:1)
  400: '#CA1400', // the pulsing navigation dot
} as const;

/** The semantic layer. Consume these. */
export const color = {
  heading: brand[0],
  action: brand[500],
  neutral: brand[105],
  hovered: brand[200],
  outlinePrimaryHover: brand[670],

  bodyPrimary: brand[0],
  bodySecondary: brand[100],
  bodySecondaryLighter: brand[50],

  surfacePrimary: brand[950],
  surfacePrimaryHover: brand[130],
  surfaceSecondary: brand[910],
  surfaceTertiary: brand[920],
  surfaceQuaternary: brand[110],

  defaultTransparent: brand[25],
  error: error[300],
} as const;

/** Violet to near-white, left to right. Display type and rule accents only. */
export const gradientBrand =
  `linear-gradient(to right, ${brand[500]} 0%, ${brand[300]} 60%, ${brand[200]} 75%, ${brand[0]} 100%)` as const;

export type BrandStep = keyof typeof brand;
export type SemanticColor = keyof typeof color;
