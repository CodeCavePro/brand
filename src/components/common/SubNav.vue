<script setup lang="ts">
import { computed } from 'vue';
import { type MenuItem } from './menu';

interface Props {
  /** The MAIN item name this page sits under. */
  section?: string;
  /** The SUB item name to mark current, if any. */
  current?: string;
  /** '../' repeated once per directory level below the docs root. */
  up: string;
  items: Record<string, MenuItem[]>;
  
}

const props = defineProps<Props>();

const subNavBarItems = computed<MenuItem[]>(() => {
  return (props.section && props.items[props.section]) || [];
});

/* An unknown `current` is a typo that would otherwise render a bar with
   nothing marked, which looks exactly like a page that is legitimately not
   in the bar, so fail early instead. */
if (
  props.current &&
  !subNavBarItems.value.some((item) => item.name === props.current)
) {
  throw new Error(
    `SubNav: no item named "${props.current}" in SUB["${props.section}"].\n` +
      `Available: ${subNavBarItems.value.map((item) => item.name).join(', ') || '(none)'}`
  );
}
</script>

<template>
  <nav
    v-if="subNavBarItems.length > 0"
    class="ds-subnav"
    aria-label="Section"
  >
    <div class="page-container ds-subnav-inner">
      <ul>
        <li
          v-for="item in subNavBarItems"
          :key="item.name"
        >
          <a
            class="btn btn-ghost"
            :href="`${up}${item.href}`"
            :aria-current="item.name === current ? 'true' : undefined"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>