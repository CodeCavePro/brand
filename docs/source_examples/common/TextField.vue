<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  id: string
  label: string
  placeholder: string
}>()

const textareaRef = ref(null)
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}
</script>

<template>
  <div class="flex flex-col min-h-[7.5rem] p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors text-heading">
    <label
        :for="id"
        class="font-bold text-sm select-none"
    >
      {{ label }}
    </label>
    <textarea
        @input="autoResize"
        ref="textareaRef"
        :id="id"
        :placeholder="placeholder"
        class="w-full flex-grow resize-none overflow-hidden placeholder:pt-1.5 placeholder:text-xs placeholder:text-body-secondary outline-none"
    />
  </div>
</template>

<style scoped>
div:focus-within {
  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),
  0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.8);
}

div:focus-within textarea {
  color: var(--color-hovered);
}
</style>
