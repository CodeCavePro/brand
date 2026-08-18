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
// Compositor-only movement: quickTo reuses a single transform tween instead
// of spawning a layout-invalidating left/top tween on every mousemove.
let glowX = null
let glowY = null

const restingPosition = () => {
  const rect = link.value.getBoundingClientRect()
  return { x: rect.width * 0.2, y: rect.height * 0.5 }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isTouchDevice.value) return

  const rect = link.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const percentX = x / rect.width
  glowX?.(x)
  glowY?.(y)
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
  const rest = restingPosition()
  leaveTween = gsap.to(glow.value, {
    x: rest.x,
    y: rest.y,
    duration: 1,
    delay: 1,
    ease: 'power2.out',
  })
}
onMounted(() => {
  isTouchDevice.value = window.matchMedia("(pointer: coarse)").matches
      || "ontouchstart" in window
      || navigator.maxTouchPoints > 0

  // Re-anchor at top-left, position purely via transforms from here on
  const rest = restingPosition()
  gsap.set(glow.value, { left: 0, top: 0, xPercent: -50, yPercent: -50, x: rest.x, y: rest.y })
  glowX = gsap.quickTo(glow.value, 'x', { duration: 0.5, ease: 'power2.out' })
  glowY = gsap.quickTo(glow.value, 'y', { duration: 0.5, ease: 'power2.out' })
})
</script>

<template>
  <div :class="`relative inline-block ${props.class ?? ''}`">
    <div ref="edgeLeft" class="edge-glow -left-2"></div>
    <a ref="link"
       :href="href"
       @mousemove="handleMouseMove"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave"
       :class="`cursor-pointer flex items-center justify-center relative z-[1] overflow-hidden w-full h-11 px-6 py-1 rounded-full bg-primary-210 ${props.class ?? ''}`"
    >
      <span class="relative z-[2] text-primary-670 font-bold select-none">
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
  will-change: transform;
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
  will-change: opacity;
  background: radial-gradient(
      55.23% 55.23% at 50% 50%,
      #FFFFFF 27.88%,
      rgba(223, 212, 249, 0.762963) 51.92%,
      rgba(153, 128, 255, 0) 100%
  );
  filter: blur(12px);
}

.glow {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  top: 50%;
  left: 20%;
  /* resting position before hydration; JS re-anchors to 0/0 + transforms */
  transform: translate(-50%, -50%);
  will-change: transform;
  width: 50%;
  height: 200%;
  background: radial-gradient(
      ellipse at left center,
      #FFFFFF 27.88%,
      rgba(223, 212, 249, 0.76) 51.92%,
      rgba(153, 128, 255, 0) 100%
  );
  filter: blur(12px);
}
</style>
