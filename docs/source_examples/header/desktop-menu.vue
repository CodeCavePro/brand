<script setup lang="ts">
import { menu } from "./menu.ts";
import Button from "@codecavepro/brand/components/common/Button.vue";
import Shevron from "@assets/icons/shevron.vue";
import { paths } from "@helpers/paths.ts";
import Logo from "@assets/images/logo.svg";
import ServicesList from "./services-list.vue";
</script>

<template>
  <div class="page-container py-3">
    <nav class="flex justify-between items-center relative text-sm">
      <ul class="flex">
        <li v-for="(item, index) in menu.slice(0, 3)" :key="index">
          <div v-if="item.name === 'Services'" class="dropdown">
            <Button variant="ghost" class="cursor-pointer dropbtn" :title="item.name">
              <Shevron class="ml-1" />
            </Button>
            <div class="dropdown-content bg-surface-primary-transparent backdrop-blur-3xl rounded-2xl p-5">
              <ServicesList :items="menu[0].submenu ?? []" />
            </div>
          </div>
          <Button v-else as="link" variant="ghost" :title="item.name" :href="item.link" />
        </li>
      </ul>
      <a :href="paths.home" class="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity">
        <img :src="Logo.src" alt="CODECAVE" />
      </a>
      <ul class="flex">
        <li v-for="(item, index) in menu.slice(3, 5)" :key="index">
          <Button as="link" variant="ghost" :title="item.name" :href="item.link" />
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
ul:last-of-type li:last-child {
  position: relative;
}

ul:last-of-type li:last-child::after {
  position: absolute;
  content: '';
  width: 10px;
  height: 10px;
  right: 8px;
  top: 11px;
  background: red;
  border-radius: 50%;
  box-shadow: 0 0 12px 0 var(--color-error-400),
    0 0 4px 0 hsl(from var(--color-error-400) h s l / 0.5);
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 12px;
  width: max-content;

  opacity: 0;
  visibility: hidden;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s;
}

.dropdown-content::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 100px;
  height: 20px;
  background-color: transparent;
}

.dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
}

.dropdown:hover .dropbtn {
  color: var(--color-hovered);
}
</style>
