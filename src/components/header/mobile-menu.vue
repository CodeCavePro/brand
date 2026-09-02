<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";
import Shevron from "@assets/icons/shevron.vue";
import { computed, onUnmounted, ref, watch } from "vue";
import BackIcon from "@assets/icons/back-icon.vue";
import ServicesList from "./services-list.vue";

/* Everything this drawer used to read out of menu.ts, paths.ts and the site's
 * logo asset now arrives as props, so it reaches no route table and no asset
 * pipeline of its own.
 *
 * The Services branch keys off `submenu` being present rather than off the
 * label being the string "Services"; mobileTitle and emphasis carry the two
 * other wordings that were hard-coded here. */
const props = defineProps<{
  items: {
    name: string
    link?: string
    submenuTitle?: string
    submenu?: { icon: unknown; name: string; description: string; link: string }[]
    mobileTitle?: string
    emphasis?: boolean
  }[]
  /** Resolved URL of the wordmark. */
  logo: string
  homeHref?: string
}>()

const servicesItem = computed(() => props.items.find((i) => i.submenu?.length))

const isMenuOpen = ref(false)
const isServicesOpen = ref(false)
let scrollPosition = 0

const lockScroll = () => {
  scrollPosition = window.scrollY || window.pageYOffset

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollPosition}px`
  document.body.style.width = '100%'

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
}

const unlockScroll = () => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.paddingRight = ''
  document.body.style.overflow = ''
  window.scrollTo(0, scrollPosition)
}

watch(isMenuOpen, (newVal) => {
  if (newVal) {
    lockScroll()
  } else {
    unlockScroll()
  }
})

onUnmounted(() => {
  if (isMenuOpen.value) {
    unlockScroll()
  }
})
const handleCloseMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div>
    <div class="fixed z-50 top-0 w-full bg-surface-primary-transparent backdrop-blur-3xl border-b border-surface-quaternary">
      <div :class="`px-5 ${isMenuOpen ? 'pb-5' : 'pb-0'} flex flex-col gap-2 transition-all max-h-screen`">
        <div class="flex justify-between items-center py-1.5 shrink-0">
          <a :href="homeHref" class="px-1.5 hover:opacity-80 transition-opacity">
            <img :src="logo" alt="CODECAVE" />
          </a>
          <button @click="isMenuOpen = !isMenuOpen" :class="`burger-menu ${isMenuOpen ? 'text-action' : 'text-heading'} transition-colors`">
            <span></span>
          </button>
        </div>
        <nav v-if="isMenuOpen" class="flex-1 min-h-0 overflow-y-auto text-sm">
          <div v-if="isServicesOpen" class="h-full flex flex-col min-h-0">
            <h2 class="text-center font-bold text-body-primary py-2.5 shrink-0">
              {{ servicesItem?.submenuTitle }}
            </h2>
            <div class="flex-1 min-h-0 overflow-y-auto">
              <slot name="services" />
            </div>

            <button class="pt-4 shrink-0" @click="isServicesOpen = false">
              <component :is="BackIcon" class="w-11 h-11 text-action" />
            </button>
          </div>
          <ul v-else class="flex flex-col items-center gap-3 px-4 pt-2 overflow-y-auto">
            <li v-for="(item, index) in items" :key="index">
              <div v-if="item.submenu?.length">
                <Button :title="item.name" variant="ghost" class="pr-1 transition-transform duration-150" @click="isServicesOpen = true">
                  <Shevron class="ml-1 rotate-270" />
                </Button>
              </div>
              <Button v-else-if="item.emphasis" as="link" :href="item.link" :title="item.mobileTitle ?? item.name" variant="tertiary" @click="handleCloseMenu" />
              <Button v-else as="link" variant="ghost" :title="item.mobileTitle ?? item.name" :href="item.link" @click="handleCloseMenu" />
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div v-if="isMenuOpen" class="fixed z-0 inset-0" @click="handleCloseMenu">
    </div>
  </div>
</template>

<style scoped>
.burger-menu {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  padding: 0.625rem;
  width: 3rem;
  height: 3rem;
}

.burger-menu::before,
.burger-menu::after,
.burger-menu span {
  content: '';
  width: 100%;
  height: 0.1rem;
  background-color: currentColor;
  border-radius: 3rem;
}
</style>