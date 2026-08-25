<script setup lang="ts">
import AsteriskIcon from "../../assets/icons/asterisk-icon.vue";

defineProps<{
  id: string
  label: string
  type: 'text' | 'email'
  autocomplete?: string
  placeholder: string
  isRequired?: boolean
  isError?: boolean
  errorMessage?: string,
  modelValue?: string
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full relative">
    <label :for="id" class="absolute flex items-center gap-0.5 pl-3 pt-3 font-bold text-heading text-sm">
      <span>{{ label }}</span>
      <AsteriskIcon v-if="isRequired" />
    </label>
    <input :id="id" :type="type" :autocomplete="autocomplete" :placeholder="placeholder" :required="isRequired" :value="modelValue"
    :aria-invalid="isError ? 'true' : undefined"
    :aria-describedby="isError ? `${id}-error` : undefined" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" 
    :class="`
        w-full p-3 pt-7 bg-surface-secondary rounded-lg placeholder:text-xs placeholder:text-body-secondary
        focus:outline-none transition-colors
        hover:bg-surface-tertiary
        ${isError ? 'text-error input-error focus:text-error' : 'text-hovered focus:text-hovered'}
       `" />
    <span v-if="isError" :id="`${id}-error`" role="alert" class="text-error text-xs">
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

input:focus {
  box-shadow: 0 0 16px 0 hsl(from var(--color-brand-500) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-brand-500) h s l / 0.6);
}

input.input-error:focus,
.input-error {
  box-shadow: 0 0 16px 0 hsl(from var(--color-error-200) h s l / 0.5),
    0 0 4px 0 hsl(from var(--color-error-100) h s l / 0.6);
}
</style>