<script setup lang="ts">
import { paths } from "@helpers/paths.ts";
import Button from "@codecavepro/brand/components/common/Button.vue";

defineProps<{
  active: boolean
  name: string
  className?: string
  index?: number
}>()

const rotate = [
  '-rotate-4 left-2 top-10',
  '-rotate-1 left-1/4 top-20',
  'rotate-1 left-1/2 top-20',
  'rotate-4 right-2 top-10',
  '-rotate-2 right-2/3 top-3/5',
  'rotate-2 left-2/3 top-3/5',
]

const translate = [
  'xl:-translate-y-1/3',
  'xl:-translate-y-1/3',
  'xl:-translate-y-1/3',
  'xl:-translate-y-1/3',
  'xl:-translate-y-1/2',
  'xl:-translate-y-1/2',
]
const getTechnologyUrl = (name: string) => {
  switch (name) {
    case 'AR & VR':
      return paths.arVr
    case 'Autodesk plugins':
      return paths.autodesk
    case 'Automation & AI':
      return paths.automation
    case 'Cloud & DevOps':
      return paths.devops
    case 'E-Commerce':
      return paths.ecommerce
    case 'HubSpot':
      return paths.hubspot
    default:
      return ''
  }
}
</script>

<template>
  <div :class="`rounded-3xl card-wrapper cursor-pointer select-none absolute transform transition-transform duration-500
  ${rotate[index]} ${active ? `${translate[index]}` : ''} ${className || ''}`">
    <div class="card flex flex-col items-center justify-around">
      <h3 class="max-w-[8rem] text-center text-xl font-bold text-heading text-balance">
        {{ name }}
      </h3>
      <Button as="link" :href="getTechnologyUrl(name)" title="Explore service" variant="tertiary" :class="`${active ? 'block' : 'hidden xl:block xl:opacity-0'}`" />
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  background:
    linear-gradient(hsl(from var(--color-technology-gradient-25) h s l / 0.1),
      hsl(from var(--color-technology-gradient-0) h s l / 0.1),
      hsl(from var(--color-technology-gradient-50) h s l / 0.1)) border-box;
}

.card {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  position: relative;
  background: transparent;
  backdrop-filter: blur(14px);
}

.card::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  outline: 1px solid transparent;
  -webkit-backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  background: linear-gradient(hsl(from var(--color-brand-500) h s l / 0.35),
      hsl(from var(--color-brand-400) h s l / 0.675),
      var(--color-brand-500)) border-box;
  mask: linear-gradient(black, black) border-box,
    linear-gradient(black, black) padding-box;
  mask-composite: subtract;
}
</style>
