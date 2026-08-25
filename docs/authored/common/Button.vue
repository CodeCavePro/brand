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
/* computed, not a plain const.
 *
 * This was a bare template literal, so props.isDisabled was sampled once during
 * setup and baked into a string that variantClass then interpolated -- leaving
 * the class list reactive to `variant` and completely inert to `isDisabled`.
 * Disabling a button while a request is in flight changed nothing at all. */
const buttonBaseClass = computed(() => `flex items-center justify-center
${props.isDisabled ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}
w-fit max-w-full min-w-12 min-h-12 rounded-full text-body-primary font-bold transition-colors`)
const linkBaseClass = 'flex transition-colors'
const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${buttonBaseClass.value} px-6 py-1 bg-primary-900 hover:bg-surface-tertiary`
    case 'tertiary':
      return `${buttonBaseClass.value} px-6 py-1 border border-primary-500 hover:border-primary-700`
    case 'icon':
      return `${buttonBaseClass.value} p-5 border border-primary-500 hover:border-primary-700`
    case 'ghost':
      return `${linkBaseClass} text-body-primary hover:text-primary-200 active:text-primary-200 font-bold px-6 py-2`
    case 'text':
      return `${linkBaseClass} text-body-secondary-lighter hover:text-primary-200 active:text-primary-200`
    case 'link':
      return `${linkBaseClass} text-hovered underline`
    default:
      return `${buttonBaseClass.value} bg-primary-500 hover:bg-primary-700 active:bg-primary-900`
  }
})
</script>

<template>
  <!-- A disabled anchor is a different mechanism from a disabled button: there
       is no `disabled` attribute for <a>, and adding one styles nothing and
       prevents nothing. Dropping href is what actually takes it out of the tab
       order and stops activation; aria-disabled is what says so out loud. -->
  <a
    v-if="props.as === 'link'"
    :href="props.isDisabled ? undefined : props.href"
    :aria-disabled="props.isDisabled ? 'true' : undefined"
    :class="[variantClass, props.class ?? '']">
    <span>{{ title }}</span>
    <slot />
  </a>
  <button v-else :disabled="props.isDisabled" :class="[variantClass, props.class ?? '']">
    {{ title }}
    <slot />
  </button>
</template>
