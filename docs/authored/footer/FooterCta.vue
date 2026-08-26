<script setup lang="ts">
const props =  defineProps<{
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
  }>()
</script>

<template>
  <section
    class="mx-auto max-w-[1120px] px-[clamp(20px,4vw,40px)] pb-[clamp(56px,8vw,88px)] pt-0"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-6 rounded-[clamp(12px,2vw,24px)] border border-(--color-brand-800) bg-(--color-brand-800) px-[clamp(24px,5vw,48px)] py-[clamp(24px,4vw,36px)]"
    >
      <div class="min-w-0">
        <h3 class="text-[clamp(20px,2.4vw,26px)] tracking-[-0.01em]">
          {{ title }}
        </h3>

        <p
          class="mt-1 text-body-secondary-lighter"
        >
          {{ description }}
        </p>
      </div>

      <a class="btn btn-primary" :href="buttonHref">
        {{ buttonText }}
      </a>
    </div>
  </section>
</template>