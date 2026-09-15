<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  isDisabled?: boolean
  title?: string
  ariaLabel?: string
  as?: 'link'
  href?: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'text' | 'link' | 'icon'
  type?: 'button' | 'submit'
  class?: string
}>(), {
  type: 'button',
})

const buttonBaseClass = `flex items-center justify-center
${props.isDisabled
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer'}
w-fit max-w-full min-w-12 min-h-12 rounded-full text-body-primary font-bold transition-colors`

const linkBaseClass = `flex transition-colors
${props.isDisabled
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer'}`

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${buttonBaseClass} px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`
    case 'tertiary':
      return `${buttonBaseClass} px-6 py-1 border border-primary-500 hover:border-hovered`
    case 'icon':
      return `${buttonBaseClass} p-5 border border-primary-500 hover:border-hovered`
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

const preventDisabledLinkActivation = (event: Event) => {
  if (props.isDisabled) {
    event.preventDefault()
    event.stopPropagation()
  }
}
</script>

<template>
  <a v-if="props.as === 'link'" 
    :href="props.isDisabled ? '' : props.href" 
    :class="[variantClass, props.class ?? '']" 
    :aria-disabled="props.isDisabled ? 'true' : undefined" 
    :tabindex="props.isDisabled ? -1 : undefined" 
    @click="preventDisabledLinkActivation" 
    @keydown.enter="preventDisabledLinkActivation" 
    @keydown.space.prevent="preventDisabledLinkActivation">
    <span>{{ title }}</span>
    <slot />
  </a>

  <button v-else :type="props.type" :disabled="props.isDisabled" :class="[variantClass, props.class ?? '']" :aria-label="props.ariaLabel">
    {{ title }}
    <slot />
  </button>
</template>
