import { onMounted, onUnmounted, ref } from 'vue';

export function carouselGestureLocker() {
  const carouselRoot = ref<HTMLElement | null>(null)

  let viewport: HTMLElement | null = null

  let startX = 0
  let startY = 0
  let gestureLocked = false
  let isVerticalGesture = false

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY

    gestureLocked = false
    isVerticalGesture = false
  }

  const onTouchMove = (e: TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - startX)
    const dy = Math.abs(e.touches[0].clientY - startY)

    if (!gestureLocked) {
      if (dx < 10 && dy < 10) return

      gestureLocked = true
      isVerticalGesture = dy > dx
    }

    if (isVerticalGesture) {
      e.stopImmediatePropagation()
    }
  }

  const onTouchEnd = () => {
    gestureLocked = false
    isVerticalGesture = false
  }

  onMounted(() => {

    viewport =
      carouselRoot.value?.querySelector('.carousel__viewport') ?? null

    if (!viewport) return

    viewport.addEventListener('touchstart', onTouchStart, {
      passive: true,
    })

    viewport.addEventListener('touchmove', onTouchMove, {
      passive: false,
    })

    viewport.addEventListener('touchend', onTouchEnd)

    viewport.addEventListener('touchcancel', onTouchEnd)
  })

  onUnmounted(() => {
    if (!viewport) return

    viewport.removeEventListener('touchstart', onTouchStart)
    viewport.removeEventListener('touchmove', onTouchMove)
    viewport.removeEventListener('touchend', onTouchEnd)
    viewport.removeEventListener('touchcancel', onTouchEnd)
  })

  return carouselRoot;
}