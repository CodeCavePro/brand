<script setup lang="ts">
import {menu} from "./menu.ts";
import Button from "../common/Button.vue";
import {onUnmounted, ref, watch} from "vue";
import {paths} from "../../helpers/paths.ts";
import Logo from "../../assets/images/logo.svg";
import BackIcon from "../../assets/icons/back-icon.vue";
import ServicesList from "./services-list.vue";

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
    <div
        :class="`fixed z-50 top-0 w-full bg-surface-primary-transparent backdrop-blur-3xl ${isMenuOpen ? 'rounded-b-3xl' : 'rounded-none'}`">
      <div :class="`h-full px-5 ${isMenuOpen ? 'pb-5' : 'pb-0'} flex flex-col gap-2 transition-all`">
        <div class="flex justify-between items-center py-1.5">
          <a :href="paths.home" class="px-1.5 hover:opacity-80 transition-opacity">
            <img :src="Logo.src" alt="CODECAVE"/>
          </a>
          <button
              @click="isMenuOpen = !isMenuOpen"
              :class="`burger-menu ${isMenuOpen ? 'text-action' : 'text-heading'} transition-colors`"
          >
            <span></span>
          </button>
        </div>
        <nav v-if="isMenuOpen" class="h-full">
          <div v-if="isServicesOpen">
            <h2 class="text-center font-bold text-body-primary py-2.5">
              {{ menu[0].submenuTitle }}
            </h2>
            <ServicesList/>
            <button class="pt-4" @click="isServicesOpen = false">
              <component class="w-11 h-11 text-action" :is="BackIcon"/>
            </button>
          </div>
          <ul v-else class="h-full flex flex-col items-center gap-3 justify-around px-4 pt-2">
            <li v-for="(item, index) in menu" :key="index">
              <Button
                  v-if="item.name === 'Services'"
                  :title="item.name"
                  variant="ghost"
                  @click="isServicesOpen = true"
                  class="transition-transform duration-150"
              />
              <Button
                  v-else-if="item.name === 'Workflow'"
                  as="link"
                  variant="ghost"
                  title="About us | Workflow"
                  :href="item.link"
              />
              <Button
                  v-else-if="item.name === 'Contact us'"
                  as="link"
                  :href="item.link"
                  title="Get a free consultation"
                  variant="tertiary"
                  @click="handleCloseMenu"
              />
              <Button
                  v-else
                  as="link"
                  variant="ghost"
                  :title="item.name"
                  :href="item.link"
              />
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div
        v-if="isMenuOpen"
        class="fixed z-0 inset-0"
        @click="handleCloseMenu"
    >
    </div>
  </div>
</template>

<style scoped>
.burger-menu {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  padding: 0.625rem;
  width: 2.75rem;
  height: 2.75rem;
}

.burger-menu::before,
.burger-menu::after,
.burger-menu span {
  content: '';
  width: 100%;
  height: 0.1rem;
  background-color: currentColor;
  border-radius: 2.75rem;
}
</style>