<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";
import type { Link } from "./links.ts";

defineProps<{
  groupName: string
  items: Link[]
}>()
</script>

<template>
  <div class="space-y-4">
    <p class="text-body-secondary uppercase font-bold text-xs">
      {{ groupName }}
    </p>
    <div class="space-y-3 xl:space-y-2 text-sm">
      <div :key="index" v-for="(item, index) in items">
        <Button
            :title="item.name"
            as="link"
            :href="item.href"
            variant="text"
        />
      </div>
    </div>
  </div>
</template>
