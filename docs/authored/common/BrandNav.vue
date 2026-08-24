<script setup lang="ts">
/**
 * The CODECAVE top bar. Ghost-button links split around a centred wordmark.
 *
 * AUTHORED, not captured. Every other component this package ships is a copy of
 * a file codecave.pro builds from, and docs/source_examples/ holds nothing
 * anyone wrote here. This one is the exception and lives in docs/authored/
 * because it has no upstream: it is the site bar and the docs bar reconciled
 * into one, so neither repo owns it any more.
 *
 * WHY IT CAN SHIP WHEN THE MENUS COULD NOT. desktop-menu.vue and mobile-menu.vue
 * are excluded from this package (CCWEB2-371) because they reach the site paths.ts
 * and menu.ts -- installing one would put codecave.pro navigation behind an npm
 * release. This takes its items, its logo and its active state as PROPS, so it
 * reaches nothing. That is the whole difference, and it is why the same bar can
 * serve a marketing site and a documentation site without either one lending the
 * other its route table.
 *
 * NO CLIENT DIRECTIVE. Rendered from Astro without `client:*` this emits static
 * HTML and ships no JavaScript, which is what the docs bar already does and what
 * the site header does NOT -- it is `client:only`, so it renders nothing at all
 * until Vue boots. The dropdown below is CSS hover for the same reason.
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
  logoAlt?: string;
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
            class="btn btn-ghost"
            :href="item.href"
            :aria-current="item.name === current ? &apos;page&apos; : undefined"
          >{{ item.name }}</a>
          <span v-else class="btn btn-ghost dropbtn">{{ item.name }}<slot name="chevron" /></span>
          <div v-if="item.slot" class="dropdown-content">
            <slot :name="item.slot" />
          </div>
        </li>
      </ul>

      <a class="brand-nav-logo" :href="logoHref" :aria-label="logoAlt">
        <img :src="logo" :alt="logoAlt" />
      </a>

      <ul>
        <li v-for="item in right" :key="item.name" :class="{ dropdown: item.slot }">
          <a
            v-if="item.href"
            class="btn btn-ghost"
            :href="item.href"
            :aria-current="item.name === current ? &apos;page&apos; : undefined"
          >{{ item.name }}</a>
          <span v-else class="btn btn-ghost dropbtn">{{ item.name }}<slot name="chevron" /></span>
          <div v-if="item.slot" class="dropdown-content">
            <slot :name="item.slot" />
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* Layout only. Every colour comes from colors_and_type.css, which ships beside
 * this file -- .btn-ghost included, so the links are the same ghost buttons the
 * rest of the system uses and a palette change moves the bar with it.
 *
 * The three values that used to differ between the site bar and the docs bar are
 * settled here on the docs side: 16px links on the 48px --control-height grid,
 * a 28px wordmark, and the 1px rule underneath. The site had shrunk all three
 * with a text-sm wrapper, which quietly took its ghost buttons off the control
 * grid every other control sits on. */
.brand-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-surface-quaternary);
  background: var(--color-surface-primary-transparent);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.brand-nav-inner {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-width-desktop);
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
}

.brand-nav ul {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

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
