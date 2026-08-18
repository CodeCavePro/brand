<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  isDisabled?: boolean
  title: string
  as?: 'link'
  href?: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'text' | 'link'
  type?: 'submit'
  class?: string
}>()
const buttonBaseClass = `flex items-center justify-center
${props.isDisabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}
w-fit max-w-full h-11 px-6 py-1 rounded-full text-body-primary font-bold transition-colors`
const linkBaseClass = 'flex transition-colors'
const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${buttonBaseClass} bg-primary-910 hover:bg-primary-920`
    case 'tertiary':
      return `${buttonBaseClass} border border-primary-500 hover:border-primary-670`
    case 'ghost':
      return `${linkBaseClass} text-primary-0 hover:text-primary-200 active:text-primary-200 font-bold px-6 py-2`
    case 'text':
      return `${linkBaseClass} text-body-secondary-lighter hover:text-primary-200 active:text-primary-200`
    case 'link':
      return `${linkBaseClass} text-hovered underline`
    default:
      return `${buttonBaseClass} bg-primary-500 hover:bg-primary-600 active:bg-primary-800`
  }
})
</script>

<template>
  <a
      v-if="props.as === 'link'"
      :href="props.href"
      :class="[variantClass, props.class ?? '']"
  >
    <span>{{ title }}</span>
    <slot />
  </a>
  <button
      v-else
      :class="[variantClass, props.class ?? '']"
  >
    {{ title }}
  </button>
</template>
