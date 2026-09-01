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
      <ul class="flex w-max min-w-full flex-nowrap">
        <li
          v-for="item in items"
          :key="item.name"
        >
          <a
            class="btn btn-ghost whitespace-nowrap"
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