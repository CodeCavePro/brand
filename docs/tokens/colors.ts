/**
 * CODECAVE — color tokens as a typed module.
 *
 * A faithful mirror of `colors_and_type.css`, for consumers that cannot read a
 * stylesheet: design tooling, canvas/WebGL renderers, PDF and email builders,
 * native apps. The CSS file remains the source of truth — if the two ever
 * disagree, the CSS wins.
 *
 * Originals: source_examples/styles/global.css (codecave.pro @theme,
 *            2026 palette rebuild). Old and new ramps share step names with
 *            different values — never map by step name across the rebuild;
 *            map by hex or by role.
 */

/** The violet brand ramp: light to dark, 12 steps.
 *  Do NOT consume these directly — use the semantic layer below.
 *  Non-monotonic quirk: brand-500 is lighter than brand-400. */
export const brand = {
  25: '#E8E6F0', //  near-white tint — gradient endpoint
  50: '#BBB9CB',
  100: '#B8AFDB',
  200: '#B19AFE', // hover foreground
  300: '#735CAB',
  400: '#5F3ABD', // feature-card ring mid-stop (was cyan)
  500: '#5F20FE', // ACTION — links, borders, eyebrows
  600: '#4705ED',
  700: '#4004AF', // primary button hover; tertiary border hover
  800: '#1B0D4E', // text ON the glow button; outline hover
  900: '#1E113B', // primary button active; secondary fill
  950: '#0A0A0B', // THE PAGE — a neutral black kept in the brand ramp
} as const;

/** The gray ramp: light to dark, 13 steps.
 *  Non-monotonic quirk: gray-1100 (card) is lighter than gray-1000. */
export const gray = {
  50: '#F4F4F6', //   headings, body text
  100: '#DCDCE5',
  200: '#D5D5DD', //  long-form body copy
  300: '#C7C7DB', //  secondary body, lighter
  400: '#A3A3C2',
  500: '#9595BB', //  secondary body, placeholders
  600: '#6B6699', //  neutral — muted metadata, LARGE TEXT ONLY (3.76:1)
  700: '#2B2848', //  borders / quaternary surface
  800: '#232339', //  surface hover
  900: '#1C1C27', //  tertiary surface
  950: '#15151E',
  1000: '#050505', // one dark section ground ("failureproof")
  1100: '#0F0F15', // card surface
} as const;

/** Single-use accents (global.css calls them "once used"). RAW-OK. */
export const accent = {
  glow25: '#9980FF', //    GLOW BUTTON FILL (takes brand-800 text)
  shadow0: '#281470', //   seeds the upward section glow
  progress0: '#8252FC', // gradient mid — .rule / .progress
} as const;

/** Technology-card wash — the only place cyan survives (0.1-alpha wash).
 *  The old cyan #20EFFE is an imagery-only art literal since the rebuild. */
export const technologyGradient = {
  0: '#077689', //  deep cyan
  25: '#1A0452',
  50: '#070312',
} as const;

export const error = {
  100: '#FE9A9A', // error value + message text (9.71:1 on the page)
  200: '#FE2020', // error halo
  300: '#B42318', // --color-error: icons and rules, NOT body text (3.01:1)
  400: '#CA1400', // the pulsing navigation dot
} as const;

/** The semantic layer. Consume these. */
export const color = {
  heading: gray[50],
  action: brand[500],
  neutral: gray[600],
  hovered: brand[200],
  outlinePrimaryHover: brand[800],

  bodyPrimary: gray[50],
  textBodyPrimary: gray[200],
  bodySecondary: gray[500],
  bodySecondaryLighter: gray[300],

  surfacePrimary: brand[950],
  surfacePrimaryHover: gray[800],
  surfaceSecondary: gray[1100],
  surfaceTertiary: gray[900],
  surfaceQuaternary: gray[700],

  failureproof0: gray[1000],
  defaultTransparent: gray[100],
  error: error[300],
} as const;

/** Violet to near-white, left to right. Display type and rule accents only.
 *  The mid stop is the once-used progress accent, NOT brand-300 — the rebuilt
 *  ramp's brand-300 (#735CAB) is a different, muted violet. */
export const gradientBrand =
  `linear-gradient(to right, ${brand[500]} 0%, ${accent.progress0} 60%, ${brand[200]} 75%, ${brand[25]} 100%)` as const;

export type BrandStep = keyof typeof brand;
export type GrayStep = keyof typeof gray;
export type SemanticColor = keyof typeof color;
