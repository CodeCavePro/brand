<script setup lang="ts">
/* The submenu entries to render. This read menu.ts directly, which is this
 * site's navigation content -- the one thing keeping the component out of the
 * brand package. The caller passes the list instead. */
defineProps<{
  items: {
    icon: unknown
    name: string
    description: string
    link: string
  }[]
}>()
</script>

<template>
<ul
  class="grid gap-3.5
    sm:max-xl:grid-cols-2 sm:max-xl:w-fit sm:max-xl:max-w-full sm:max-xl:mx-auto sm:max-xl:gap-x-15 sm:max-xl:gap-y-4
    lg:max-xl:gap-x-42
    xl:grid-cols-2 xl:gap-x-8 xl:gap-y-4"
>
    <li v-for="item in items" :key="item.name" class="min-w-0">
      <a :href="item.link" class="flex items-center gap-3 group min-w-0">
        <div class="shrink-0 w-fit p-3 rounded-xl bg-surface-tertiary">
          <component
              class="w-5 h-5 text-default-transparent group-active:text-hovered group-hover:text-hovered transition-colors"
              :is="item.icon"
          />
        </div>
        <div class="text-sm min-w-0 sm:max-xl:whitespace-nowrap">
          <h3
            class="font-bold text-heading group-active:text-hovered group-hover:text-hovered transition-colors sm:max-xl:truncate"
            :title="item.name"
          >
            {{ item.name }}
          </h3>
          <p
            class="text-body-secondary-lighter sm:max-xl:truncate"
            :title="item.description"
          >
            {{ item.description }}
          </p>
        </div>
      </a>
    </li>
  </ul>
</template>