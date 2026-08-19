<script setup lang="ts">
import { onMounted, ref } from "vue";
import { gsap } from "gsap";

const props = defineProps<{
  title: string
  class?: string
  href?: string
}>()
const isTouchDevice = ref(false)
const link = ref(null)
const glow = ref(null)
const edgeLeft = ref(null)
const edgeRight = ref(null)
let leaveTween = null
const handleMouseMove = (e: MouseEvent) => {
  if (isTouchDevice.value) return

  const rect = link.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const percentX = x / rect.width
  gsap.to(glow.value, {
    left: x,
    top: y,
    duration: 0.5,
    ease: 'power2.out',
  })
  const edgeZone = 0.1
  let leftOpacity = 0
  let rightOpacity = 0
  if (percentX < edgeZone) {
    leftOpacity = 1 - percentX / edgeZone
  } else if (percentX > 1 - edgeZone) {
    rightOpacity = (percentX - (1 - edgeZone)) / edgeZone
  }
  edgeLeft.value.style.opacity = leftOpacity
  edgeRight.value.style.opacity = rightOpacity
}
const handleMouseEnter = () => {
  if (isTouchDevice.value) return
  if (leaveTween) {
    leaveTween.kill()
    leaveTween = null
  }
}
const handleMouseLeave = () => {
  edgeLeft.value.style.opacity = 1
  edgeRight.value.style.opacity = 0
  if (leaveTween) leaveTween.kill()
  leaveTween = gsap.to(glow.value, {
    left: '20%',
    top: '50%',
    duration: 1,
    delay: 1,
    ease: 'power2.out',
  })
}
onMounted(() => {
  isTouchDevice.value = window.matchMedia("(pointer: coarse)").matches
    || "ontouchstart" in window
    || navigator.maxTouchPoints > 0
})
</script>

<template>
  <div :class="`relative inline-block ${props.class ?? ''}`">
    <div ref="edgeLeft" class="edge-glow -left-2"></div>
    <a ref="link" :href="href" @mousemove="handleMouseMove" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" :class="`cursor-pointer flex items-center justify-center relative z-[1] overflow-hidden w-full h-11 px-6 py-1 rounded-full bg-glow-25 ${props.class ?? ''}`">
      <span class="relative z-[2] text-primary-800 font-bold select-none">
        {{ title }}
      </span>
      <div ref="glow" class="glow"></div>
    </a>
    <div ref="edgeRight" class="edge-glow -right-2 opacity-0"></div>
  </div>
</template>

<style scoped>
a {
  box-shadow: 0 0 64px 0 #7A58FFA8,
    0 0 16px 0 #4F22FFA6,
    0 0 4px 2px #5B34FA;
  transition: transform 0.5s ease;
}

a:active {
  transform: scale(0.98);
}

.edge-glow {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  top: 50%;
  width: 100%;
  height: 80%;
  transform: translateY(-50%);
  transition: opacity 0.2s ease;
  background: radial-gradient(55.23% 55.23% at 50% 50%,
      #FFFFFF 27.88%,
      rgba(223, 212, 249, 0.762963) 51.92%,
      rgba(153, 128, 255, 0) 100%);
  filter: blur(12px);
}

.glow {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  top: 50%;
  left: 20%;
  transform: translateY(-50%) translateX(-50%);
  width: 50%;
  height: 200%;
  background: radial-gradient(ellipse at left center,
      #FFFFFF 27.88%,
      rgba(223, 212, 249, 0.76) 51.92%,
      rgba(153, 128, 255, 0) 100%);
  filter: blur(12px);
}
</style>