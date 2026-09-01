<script setup lang="ts">
import { computed } from 'vue';
import { type MenuItem } from '../lib/menus/menuTypes.ts';

interface Props {
  section?: string;
  current?: string;
  subMenu: Record<string, MenuItem[]>;
}

const props = defineProps<Props>();

const items = computed<MenuItem[]>(() => {
  return props.section ? props.subMenu[props.section] ?? [] : [];
});

if (
  props.current &&
  props.section &&
  !(props.subMenu[props.section] ?? []).some(i => i.name === props.current)
) {
  throw new Error(
    `SubNav: no item named "${props.current}" in SUB["${props.section}"]`
  );
}
</script>

<template>
  <nav
    v-if="items.length"
    class="ds-subnav"
    aria-label="Section"
  >
    <div class="ds-subnav-inner">
      <ul>
        <li
          v-for="item in items"
          :key="item.name"
        >
          <a
            class="ds-subnav-link"
            :href="item.href"
            :aria-current="item.name === current ? 'page' : undefined"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style>
.ds-subnav {
  border-bottom: 1px solid var(--color-surface-quaternary);
  background: var(--color-surface-primary-transparent);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
}

.ds-subnav-inner {
  box-sizing: border-box;
  max-width: var(--max-width-desktop);
  margin: 0 auto;

  overflow-x: auto;
  overflow-y: hidden;
}

@media (min-width: 768px) {
  .ds-subnav-inner {
    padding-left: var(--gutter-md);
    padding-right: var(--gutter-md);
  }
}

@media (min-width: 1280px) {
  .ds-subnav-inner {
    padding-left: var(--gutter-xl);
    padding-right: var(--gutter-xl);
  }
}

/* center links when there is enough space */
.ds-subnav ul {
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0;
  padding: 0;
  list-style: none;

  /* allow overflow while staying centered */
  width: max-content;
  min-width: 100%;

  /* prevents wrapping */
  flex-wrap: nowrap;
}

.ds-subnav li {
  margin: 0;
  flex-shrink: 0;
}

.ds-subnav-link {
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

.ds-subnav-link:hover,
.ds-subnav-link:active,
.ds-subnav-link[aria-current="page"] {
  color: var(--color-hovered);
}
</style>