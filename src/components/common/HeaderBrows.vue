<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";

const props = defineProps<{
  brows: {
    header: string;
    description: string;
  }[]
}>()
</script>

<template>
    <div class="flex flex-col md:flex-row gap-4 md:gap-6 text-lg md:text-xl">
      <div v-for="brow in props.brows">
          <div class="space-x-1">
            <span class="font-bold text-body-primary">{{ brow.header }}</span>
            <span class="text-body-secondary">{{ brow.description }}</span>
          </div>
      </div>
    </div>
</template>