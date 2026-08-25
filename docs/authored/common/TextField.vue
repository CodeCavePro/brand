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

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

/* One handler, because a template cannot bind @input twice.
 *
 * This emitted on @change, which for a textarea means blur -- so the parent's
 * v-model lagged the visible text for as long as the caret stayed in the field,
 * while InputText beside it in the same form updated per keystroke. autoResize
 * was already on @input, so the component had the right event all along and
 * only the emit was on the wrong one. */
const onInput = (event: Event) => {
  autoResize()
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="w-full relative">
    <div :class="`focus-area flex flex-col min-h-[7.5rem] p-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors text-heading 
      ${isError ? 'input-error' : ''}`">
      <label :for="id" class="font-bold text-sm select-none">
        {{ label }}
      </label>
      <textarea 
        @input="onInput" 
        ref="textareaRef" 
        :id="id" :placeholder="placeholder" :value="modelValue"
        :aria-invalid="isError ? 'true' : undefined"
        :aria-describedby="isError ? `${id}-error` : undefined" 
        :class="`w-full flex-grow resize-none overflow-hidden placeholder:pt-1.5 placeholder:text-xs placeholder:text-body-secondary outline-none 
        ${isError ? 'text-error focus:text-error' : 'text-hovered focus:text-hovered'}`" />
    </div>
    <span v-if="isError" :id="`${id}-error`" role="alert" class="text-error text-xs">
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
