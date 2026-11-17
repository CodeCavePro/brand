<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import Shevron from "../assets/icons/shevron.vue";

type Option = {
    value: string | number
    label: string
    href?: string
    disabled?: boolean
}

const props = withDefaults(
    defineProps<{
        id: string
        label?: string
        options: Option[]
        placeholder?: string
        disabled?: boolean
        modelValue?: string | number
    }>(),
    {
        label: '',
        placeholder: '',
        disabled: false,
        modelValue: ''
    }
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const wrapperClass = 'relative inline-block'

const triggerClass = `
    flex gap-2.5
    min-w-45 w-auto h-full
    justify-center items-center
    appearance-none cursor-pointer
    h-11 px-6 rounded-full py-3.5
    bg-transparent text-body-primary text-base font-bold text-center
    border border-hovered
    transition-colors
`

const listClass = `
    absolute left-1/2 -translate-x-1/2 top-full z-10 mt-2 min-w-full
    flex flex-col gap-1 p-2 rounded-2xl
    max-h-65 overflow-y-auto overscroll-contain
    bg-surface-primary border border-surface-tertiary shadow-lg
`

const itemClass = (option: Option) => `
    flex items-center shrink-0 gap-2 py-3 px-4 rounded-lg border
    text-base whitespace-nowrap text-body-primary transition-colors
    bg-surface-secondary border-surface-tertiary
    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-tertiary'}
`

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedOption = computed(() =>
    props.options.find((o) => String(o.value) === String(props.modelValue))
)

const selectedLabel = computed(() => selectedOption.value?.label ?? props.placeholder)

const toggle = () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
}

const select = (option: Option) => {
    if (option.disabled) return
    emit('update:modelValue', String(option.value))
    isOpen.value = false
}

const handleOutsideClick = (event: PointerEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => document.addEventListener('pointerdown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsideClick))
</script>

<template>
    <div ref="root" :class="wrapperClass">
        <label v-if="label" :for="id" class="sr-only">{{ label }}</label>
        <input type="hidden" :name="id" :value="modelValue" />
        <button :id="id" type="button" :class="triggerClass" :disabled="disabled" aria-haspopup="listbox" :aria-expanded="isOpen" @click="toggle">
            <span>{{ selectedLabel }}</span>
            <Shevron class="w-5 h-5 shrink-0 transition-transform"  :class="isOpen ? 'rotate-180 text-hovered' : 'text-body-secondary-lighter'" aria-hidden="true" />
        </button>
        <div v-if="isOpen" role="listbox" :class="listClass">
            <component :is="option.href ? 'a' : 'div'" :href="option.disabled ? undefined : option.href" v-for="option in options" :key="option.value" role="option" :aria-selected="option.value === selectedOption?.value" :aria-disabled="option.disabled" :class="itemClass(option)" @click="select(option)">
                <span class="radio border-2 rounded-full" :class="option.value === selectedOption?.value ? 'border-action' : 'border-surface-quaternary'" :data-checked="option.value === selectedOption?.value" />
                <span>{{ option.label }}</span>
            </component>
        </div>
    </div>
</template>

<style scoped>
.radio {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    display: grid;
    place-content: center;
}

.radio::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    transform: scale(0);
    transition: var(--duration-control) transform ease-in-out;
    background: var(--color-action);
}

.radio[data-checked='true']::before {
    transform: scale(1);
}
</style>