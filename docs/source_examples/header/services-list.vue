<script setup lang="ts">
import {menu} from "./menu.ts";
</script>

<template>
  <ul class="grid xl:grid-cols-2 gap-3.5 xl:gap-x-8 xl:gap-y-4">
    <li v-for="item in menu[0].submenu" :key="item.name">
      <a :href="item.link" class="flex items-center gap-3 group">
        <div class="w-fit p-3 rounded-xl bg-surface-tertiary">
          <component
              class="w-5 h-5 text-default-transparent group-active:text-hovered group-hover:text-hovered transition-colors"
              :is="item.icon"
          />
        </div>
        <div class="text-sm">
          <h3 class="font-bold text-heading group-active:text-hovered group-hover:text-hovered transition-colors">
            {{ item.name }}
          </h3>
          <p class="text-body-secondary-lighter group-active:text-hovered group-hover:text-hovered transition-colors">
            {{ item.description }}
          </p>
        </div>
      </a>
    </li>
  </ul>
</template>
