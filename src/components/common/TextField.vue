<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  id: string
  label: string
  placeholder: string
  isRequired?: boolean
  isError?: boolean
  errorMessage?: string,
  modelValue?: string
}>()

const textareaRef = ref(null)
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full relative">
    <div :class="`focus-area flex flex-col min-h-[7.5rem] p-3 rounded-lg bg-surface-secondary border border-surface-tertiary hover:bg-surface-tertiary transition-colors text-heading 
      ${isError ? 'input-error' : ''}`">
      <label :for="id" class="font-bold text-sm select-none">
        {{ label }}
      </label>
      <textarea 
        @input="autoResize" 
        ref="textareaRef" 
        :id="id" :placeholder="placeholder" :value="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" 
        :class="`w-full flex-grow resize-none overflow-hidden placeholder:pt-1.5 placeholder:text-xs placeholder:text-body-secondary outline-none 
        ${isError ? 'text-error focus:text-error' : 'text-hovered focus:text-hovered'}`" />
    </div>
    <span v-if="isError" class="text-error text-xs">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.focus-area:focus-within {
  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.8);
}

.input-error {
  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
</style>
