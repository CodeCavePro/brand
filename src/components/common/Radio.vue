<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  id: string
  label: string
  name: string
  modelValue?: string
  variant?: 'primary' | 'secondary'
}>()

const emit = defineEmits<{'update:modelValue': [value: string]}>()

const baseLabelClass = 'w-fit flex items-center cursor-pointer text-body-primary transition-colors'

const labelClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${baseLabelClass} gap-3 p-3 pr-4 bg-surface-primary-transparent rounded-custom border-2 border-surface-quaternary group-hover:bg-surface-tertiary`
    default:
      return `${baseLabelClass} gap-2 py-2 px-3 bg-surface-secondary rounded-lg  border border-surface-tertiary`
  }
})

const value = computed(() => props.id)
const isChecked = computed(() => props.modelValue === value.value)
</script>

<template>
  <label
      :for="id"
      :class="[labelClass]"
  >
    <input
      :id="id"
      type="radio"
      :name="name"
      :value="value"
      class="bg-transparent border-[2px] border-surface-quaternary checked:border-action rounded-full hover:border-action"
      :checked="isChecked"
      @change="emit('update:modelValue', value)"
    />
    <span class="text-xs whitespace-nowrap">
      {{ label }}
    </span>
  </label>
</template>

<style scoped>
input {
  width: 17px;
  height: 17px;
  appearance: none;
  -webkit-appearance: none;
  display: grid;
  place-content: center;
}

input::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transform: scale(0);
  transition: var(--duration-control) transform ease-in-out;
  background: var(--color-action);
}

input:checked::before {
  transform: scale(1);
}
</style>