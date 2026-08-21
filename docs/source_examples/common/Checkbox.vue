<script setup lang="ts">
import { computed } from "vue";
import AsteriskIcon from "../../assets/icons/asterisk-icon.vue";

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    isRequired?: boolean
    isError?: boolean
    variant?: 'primary' | 'secondary'
    size?: 'small' | 'medium'
    modelValue?: boolean
  }>(),
  {
    isRequired: false,
    isError: false,
    variant: 'primary',
    size: 'medium'
  }
)

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
const borderClass = computed(() => {
  return props.isError ? 'border-error checkbox-error' : 'border-outline-primary-hover hover:border-action'
});

const inputVariantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${inputBaseClass} ${checkboxSize.value} outline-2 outline-surface-quaternary checked:bg-action checked:outline-none hover:outline-action`
    default:
       return `${inputBaseClass} ${checkboxSize.value} border-2 ${borderClass.value}`
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label :for="id" :class="labelVariantClass">
    <input 
      :id="id" 
      type="checkbox" 
      :autocomplete="id" 
      :class="inputVariantClass"
      :data-size="size"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"/>
    <span class="flex items-center">
      {{ label }}
      <AsteriskIcon v-if="isRequired" class="mx-1"/>
    </span>
  </label>
</template>

<style scoped>
input {
  appearance: none;
  -webkit-appearance: none;
  display: grid;
  place-content: center;
  border-radius: var(--radius-control);
}

/* The corner cannot be size-independent. The small box is 16px, and 8px on a
   16px box is exactly half its side -- a circle, which reads as a radio button
   for what is a pick-any control. Keyed off data-size rather than a utility
   class so it holds without a Tailwind build, same reason both custom
   properties are declared in :root. */
input[data-size="small"] {
  border-radius: var(--radius-control-sm);
}

input::before {
  content: '';
  transform: scale(0);
  transition: var(--duration-control) transform ease-in-out;
  background-image: url("../../assets/images/checked-icon.svg");
  background-repeat: no-repeat;
  background-position: center center;
}

input:checked::before {
  transform: scale(1);
  transform-origin: center center;
}

.checkbox-error {
  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
</style>
