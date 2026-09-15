<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  id: string;
  label: string;
  placeholder: string;
  isRequired?: boolean;
  isError?: boolean;
  errorMessage?: string;
  modelValue?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const MAX_HEIGHT = 300;

const autoResize = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;

  textarea.style.height = "auto";

  const height = Math.min(textarea.scrollHeight, MAX_HEIGHT);
  textarea.style.height = `${height}px`;
  textarea.style.overflowY =
    textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";

  emit("update:modelValue", textarea.value);
};
</script>

<template>
  <div class="w-full relative">
    <div :class="`focus-area flex flex-col min-h-[7.5rem] p-3 rounded-lg bg-surface-secondary border border-surface-tertiary hover:bg-surface-tertiary transition-colors text-heading
      ${isError ? 'input-error' : ''}`"
    >
      <label :for="id" class="font-bold text-sm select-none">
        {{ label }}
      </label>

      <textarea
        ref="textareaRef"
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        @input="autoResize"
        :class="`w-full flex-grow resize-none placeholder:pt-1.5 placeholder:text-xs placeholder:text-body-secondary outline-none
        ${isError ? 'text-error focus:text-error' : 'text-hovered focus:text-hovered'}`"
      />
    </div>
    <span v-if="isError" class="text-error text-xs">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.focus-area:focus-within {
  box-shadow:
    0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.8);
}

.input-error {
  box-shadow:
    0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
</style>
