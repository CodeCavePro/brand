<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  isDisabled?: boolean
  title?: string
  as?: 'link'
  href?: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'text' | 'link' | 'icon'
  type?: 'submit'
  class?: string
}>()
const buttonBaseClass = `flex items-center justify-center
${props.isDisabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}
w-fit max-w-full min-w-12 min-h-12 rounded-full text-body-primary font-bold transition-colors`
const linkBaseClass = 'flex transition-colors'
const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${buttonBaseClass} px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`
    case 'tertiary':
      return `${buttonBaseClass} px-6 py-1 border border-primary-500 hover:border-primary-700`
    case 'icon':
      return `${buttonBaseClass} p-5 border border-primary-500 hover:border-primary-700`
    case 'ghost':
      return `${linkBaseClass} text-body-primary hover:text-primary-200 active:text-primary-200 font-bold px-6 py-2`
    case 'text':
      return `${linkBaseClass} text-body-secondary-lighter hover:text-primary-200 active:text-primary-200`
    case 'link':
      return `${linkBaseClass} text-hovered underline`
    default:
      return `${buttonBaseClass} px-6 py-1 bg-primary-500 hover:bg-primary-700 active:bg-primary-900`
  }
})
</script>

<template>
  <a v-if="props.as === 'link'" :href="props.href" :class="[variantClass, props.class ?? '']">
    <span>{{ title }}</span>
    <slot />
  </a>
  <button v-else :class="[variantClass, props.class ?? '']">
    {{ title }}
    <slot />
  </button>
</template>
