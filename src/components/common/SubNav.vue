<script setup lang="ts">
import { computed } from 'vue';
import { type MenuItem } from '../lib/menus/menuTypes';

interface Props {
  items: MenuItem[];
}
const props = defineProps<Props>();
</script>

<template>
  <nav
    v-if="items.length > 0"
    class="ds-subnav"
    aria-label="Section"
  >
    <div class="page-container ds-subnav-inner">
      <ul>
        <li
          v-for="item in items"
          :key="item.name"
        >
          <a
            class="btn btn-ghost"
            :href="`${item.href}`"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>