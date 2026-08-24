<script setup lang="ts">
/**
 * The CODECAVE top bar. Ghost-style links split around a centred wordmark.
 *
 * AUTHORED, not captured. Every other component this package ships is a copy of
 * a file codecave.pro builds from, and docs/source_examples/ holds nothing
 * anyone wrote here. This one is the exception and lives in docs/authored/
 * because it has no upstream: it is the site bar and the docs bar reconciled
 * into one, so neither repo owns it any more.
 *
 * WHY IT CAN SHIP WHEN THE MENUS COULD NOT. desktop-menu.vue and mobile-menu.vue
 * were excluded from this package (CCWEB2-371) because they reach the site
 * menu.ts -- installing one would put codecave.pro navigation behind an npm
 * release. This takes its items, its logo and its active state as PROPS, so it
 * reaches nothing. That is the whole difference, and it is why the same bar can
 * serve a marketing site and a documentation site without either one lending the
 * other its route table.
 *
 * NO CLIENT DIRECTIVE. Rendered from Astro without `client:*` this emits static
 * HTML and ships no JavaScript, which is what the docs bar already does and what
 * the site header does NOT -- it is `client:only`, so it renders nothing at all
 * until Vue boots. The dropdown below is CSS hover for the same reason.
 *
 * IT NEEDS tokens.css AND NOTHING ELSE. The links are styled here rather than
 * borrowed, and that is deliberate: the two ghost buttons this system already
 * has DISAGREE, so there was nothing to borrow. colors_and_type.css's
 * `.btn-ghost` renders 48px, because it cancels `height` while `.btn` sets
 * `min-height`; Button.vue's `ghost` variant renders 40px, because it drops the
 * `min-h-12` off its base class. Eight pixels, one of them a dead override of
 * the kind CCWEB2-331 records elsewhere. Neither is portable either -- a docs
 * page has the stylesheet and no Tailwind, a consumer site has Tailwind and not
 * the stylesheet. Standing on tokens instead means this bar renders the same in
 * both, and a consumer needs no global class layer to install it.
 */
export interface NavItem {
  /** Link text, and the value `current` is matched against. */
  name: string;
  /** Omitted for an item that only opens a dropdown. */
  href?: string;
  /** Names a slot to render as a hover dropdown under this item. */
  slot?: string;
}

withDefaults(defineProps<{
  /** Items left of the wordmark. */
  left?: NavItem[];
  /** Items right of it. */
  right?: NavItem[];
  /** Resolved URL of the wordmark. A path, not an import: the consumer owns
   *  its own asset pipeline, and this package ships no brand marks. */
  logo: string;
  logoHref?: string;
  /** Alt text of the wordmark image. */
  logoAlt?: string;
  /** Accessible name of the wordmark LINK, when it should differ from the alt
   *  text -- "CODECAVE design system, documentation home" reads better on a
   *  home link than the wordmark does. Left off, the link is named by the image
   *  alt, which is the right default and the reason this is not simply
   *  `logoAlt` twice. */
  logoLabel?: string;
  /** `name` of the item to mark aria-current="page". */
  current?: string;
}>(), {
  left: () => [],
  right: () => [],
  logoHref: "/",
  logoAlt: "CODECAVE",
});
</script>

<template>
  <nav class="brand-nav" aria-label="Main">
    <div class="brand-nav-inner">
      <ul>
        <li v-for="item in left" :key="item.name" :class="{ dropdown: item.slot }">
          <a
            v-if="item.href"
            class="brand-nav-link"
            :href="item.href"
            :aria-current="item.name === current ? 'page' : undefined"
          >{{ item.name }}</a>
          <span v-else class="brand-nav-link dropbtn">{{ item.name }}<slot name="chevron" /></span>
          <div v-if="item.slot" class="dropdown-content">
            <slot :name="item.slot" />
          </div>
        </li>
      </ul>

      <a class="brand-nav-logo" :href="logoHref" :aria-label="logoLabel">
        <img :src="logo" :alt="logoAlt" />
      </a>

      <ul>
        <li v-for="item in right" :key="item.name" :class="{ dropdown: item.slot }">
          <a
            v-if="item.href"
            class="brand-nav-link"
            :href="item.href"
            :aria-current="item.name === current ? 'page' : undefined"
          >{{ item.name }}</a>
          <span v-else class="brand-nav-link dropbtn">{{ item.name }}<slot name="chevron" /></span>
          <div v-if="item.slot" class="dropdown-content">
            <slot :name="item.slot" />
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* Every colour and nearly every length below is a token from tokens.css. The
 * literals that remain are the link padding and the blur radius, neither of
 * which the token set names. */
.brand-nav {
  --brand-nav-pad: 0.75rem;      /* the site header's py-3 */
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-surface-quaternary);
  background: var(--color-surface-primary-transparent);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.brand-nav-inner {
  box-sizing: border-box;   /* the site resets this globally; a docs page does not */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-width-desktop);
  margin: 0 auto;
  /* Pins the row, so the bar's height follows --control-height rather than
     whatever the links happen to measure. */
  min-height: calc(var(--control-height) + 2 * var(--brand-nav-pad));
  padding: var(--brand-nav-pad) var(--gutter-base);
}

/* The page gutter, stepped at the same two breakpoints .page-container steps at.
   It is repeated here rather than read off --gutter-base because that token does
   not change with the viewport -- the class switches to a different token
   instead. A bar that skipped this sat 20px inboard of every heading it topped. */
@media (min-width: 768px) {
  .brand-nav-inner { padding-left: var(--gutter-md); padding-right: var(--gutter-md); }
}
@media (min-width: 1280px) {
  .brand-nav-inner { padding-left: var(--gutter-xl); padding-right: var(--gutter-xl); }
}

.brand-nav ul {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}
.brand-nav li { margin: 0; }

/* The ghost button, declared rather than inherited. See the note in the script
   block: the two that exist disagree by 8px, and neither is available in both of
   the places this bar has to render. */
.brand-nav-link {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--control-height);
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-pill);
  color: var(--color-body-primary);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-body);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--transition-colors);
}
.brand-nav-link:hover,
.brand-nav-link:active { color: var(--color-hovered); }

.brand-nav-logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  transition: opacity var(--transition-base);
}
.brand-nav-logo:hover { opacity: 0.8; }
.brand-nav-logo img { height: 1.75rem; width: auto; }

/* The page you are on. The hovered violet, not a new colour and not a
   background: the bar stays quiet. */
.brand-nav a[aria-current="page"] { color: var(--color-hovered); }

/* Hover-only, so the bar needs no JavaScript. A dropdown that opened on click
   would, and that is the whole reason this renders without a client directive. */
.dropdown { position: relative; display: inline-block; }
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 12px;
  width: max-content;
  opacity: 0;
  visibility: hidden;
  border-radius: 1rem;
  padding: 1.25rem;
  background: var(--color-surface-primary-transparent);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  transition: opacity 0.2s ease, visibility 0.2s;
}
/* Bridges the 12px gap so the pointer can travel into the panel. */
.dropdown-content::before {
  content: "";
  position: absolute;
  top: -20px;
  left: 0;
  width: 100px;
  height: 20px;
}
.dropdown:hover .dropdown-content { opacity: 1; visibility: visible; }
.dropdown:hover .dropbtn { color: var(--color-hovered); }

/* Under 768 the centred wordmark would sit on top of the links, so it takes its
   own row. Same breakpoint and same wrap the docs bar already used. */
@media (max-width: 767px) {
  .brand-nav-inner { flex-wrap: wrap; justify-content: center; }
  .brand-nav ul { flex: 1; justify-content: center; }
  .brand-nav-logo {
    position: static;
    transform: none;
    order: -1;
    flex-basis: 100%;
    justify-content: center;
    padding: 0.5rem 0 0.75rem;
  }
}
</style>
