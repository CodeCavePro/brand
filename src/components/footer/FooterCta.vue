<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";

const props = defineProps<{
  header?: string;
  description?: string;
  subDescription?: string;
}>()
</script>

<template>
  <section
  class="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-7 rounded-3xl bg-primary-800"
>
  <div class="flex-1">
    <h3 class="text-heading font-bold xl:text-[32px] text-2xl">
      {{ props.header }}
    </h3>

    <p class="md:mt-1 mt-4 text-body-secondary-lighter text-pretty">
      {{ props.description }}
      <br>
      {{ props.subDescription }}
    </p>
  </div>

  <slot />

</section>
</template>