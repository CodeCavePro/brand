<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  id: string
  label: string
  name: string
  isChecked?: boolean
  variant?: 'primary' | 'secondary'
}>()
const baseLabelClass = 'w-fit flex items-center cursor-pointer text-body-primary transition-colors'
const labelClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return `${baseLabelClass} gap-3 p-3 pr-4 bg-surface-primary-transparent rounded-custom border-2 border-surface-quaternary group-hover:bg-surface-tertiary`
    default:
      return `${baseLabelClass} gap-2 py-2 px-3 bg-surface-secondary rounded-lg`
  }
})
</script>

<template>
  <label
      :for="id"
      :class="[labelClass]"
  >
    <input
        type="radio"
        :id="id"
        :name="name"
        :value="id"
        class="bg-transparent border-[2px] border-surface-quaternary checked:border-action rounded-full hover:border-action"
        :checked="isChecked"
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
  transition: var(--default-transition-duration) transform ease-in-out;
  background: var(--color-action);
}

input:checked::before {
  transform: scale(1);
}
</style>