<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";
</script>

<template>
  <section
  class="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-7 rounded-3xl bg-primary-800"
>
  <div class="flex-1">
    <h3 class="text-heading font-bold text-[32px]">
      Grab our AI trends research!
    </h3>

    <p class="md:mt-1 mt-4 text-body-secondary-lighter text-pretty">
      We’ve researched current state of the AI in 3 industries so you don’t have to.
      <br>
      Check what we’ve found about yours.
    </p>
  </div>

  <Button
    title="Grab Research"
    class="px-6"
  />
</section>
</template>