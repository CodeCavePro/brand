<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  id: string
  label: string
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium'
}>()
const checkboxSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-4 h-4 before:w-[0.5em] before:h-[0.5em]'
    default:
      return 'w-6 h-6 before:w-[0.75em] before:h-[0.75em]'
  }
})
const labelSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-xs'
    default:
      return 'text-sm'
  }
})
const labelBaseClass = 'flex items-center w-fit text-body-primary cursor-pointer'
const labelVariantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${labelBaseClass} ${labelSize.value} gap-2 py-2 px-3 bg-surface-secondary rounded-lg`
    default:
      return `${labelBaseClass} ${labelSize.value} gap-3`
  }
})
const inputBaseClass = 'cursor-pointer transition-colors'
const inputVariantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${inputBaseClass} ${checkboxSize.value} outline-2 outline-surface-quaternary checked:bg-action checked:outline-none hover:outline-action`
    default:
      return `${inputBaseClass} ${checkboxSize.value} border-2 border-outline-primary-hover hover:border-action`
  }
})
</script>

<template>
  <label :for="id" :class="labelVariantClass">
    <input :id="id" type="checkbox" :autocomplete="id" :class="inputVariantClass" />
    <span>
      {{ label }}
    </span>
  </label>
</template>

<style scoped>
input {
  appearance: none;
  -webkit-appearance: none;
  display: grid;
  place-content: center;
  border-radius: var(--radius-sm);
}

input::before {
  content: '';
  transform: scale(0);
  transition: var(--default-transition-duration) transform ease-in-out;
  background-image: url("../../assets/images/checked-icon.svg");
  background-repeat: no-repeat;
  background-position: center center;
}

input:hover::before,
input:checked::before {
  transform: scale(1);
  transform-origin: center center;
}
</style>
