<script setup lang="ts">
import AsteriskIcon from "../assets/icons/asterisk-icon.vue";

defineProps<{
  id: string
  label: string
  type: 'text' | 'email'
  autocomplete?: string
  placeholder: string
  isRequired?: boolean
  isError?: boolean
  errorMessage?: string
  modelValue?: string
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full relative">
    <!-- The box is this wrapper rather than the input, and the label sits in
         the flow above the input rather than floating over its top padding, as
         TextField's does: a label that wraps, as a translated one in half a
         form's width does, now pushes the input down instead of covering what
         was typed. -mb-1 keeps a one-line field 66px high with its text where
         it was. -->
    <div :class="`input-box flex flex-col bg-surface-secondary rounded-lg border border-surface-tertiary
      hover:bg-surface-tertiary transition-colors ${isError ? 'input-error' : ''}`">
      <label :for="id" class="flex items-center gap-0.5 px-3 pt-3 -mb-1 font-bold text-heading text-sm">
        <span>{{ label }}</span>
        <AsteriskIcon v-if="isRequired" />
      </label>

      <input
        :id="id"
        :type="type"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :required="isRequired"
        :value="modelValue"
        :aria-invalid="isError ? 'true' : undefined"
        :aria-describedby="isError ? `${id}-error` : undefined"
        :class="`
          w-full px-3 pb-3 bg-transparent rounded-b-lg placeholder:text-xs placeholder:text-body-secondary
          focus:outline-none
          ${isError ? 'text-error focus:text-error' : 'text-hovered focus:text-hovered'}
         `" />
    </div>
    <span v-if="isError" :id="`${id}-error`" class="text-error text-xs">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px var(--color-surface-tertiary) inset !important;
  -webkit-text-fill-color: var(--color-heading) !important;
  -webkit-background-clip: text !important;
}

/* The autofill colour above paints the input alone, so the label's strip of the
 * box takes the same colour. */
.input-box:has(input:-webkit-autofill) {
  background-color: var(--color-surface-tertiary);
}

.input-box:focus-within {
  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.6);
}

.input-error,
.input-error:focus-within {
  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
</style>
