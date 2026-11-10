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
    <div class="flex flex-col gap-1 md:flex-row md:gap-6 items-center justify-center text-lg md:text-xl">
      <div v-for="brow in props.brows">
          <div class="space-x-1 text-body-primary">
            <span>{{ brow.header }}</span>
            <span>{{ brow.description }}</span>
          </div>
      </div>
    </div>
</template>