<script setup lang="ts">
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { nextTick, onMounted, watch } from "vue";

const props = defineProps<{
  text1: string
  text2: string
}>()

const splitAnimation = () => {
  /* Reduced motion means no split at all, not a gentler stagger.
   *
   * Checked here rather than in onMounted because this also runs from the watch
   * on the two texts, so the guard picks up a setting changed after mount. And
   * checked in JS at all because the movement is GSAP: a
   * `prefers-reduced-motion` block in a stylesheet cannot reach it.
   *
   * Skipping the whole function rather than just the tween is deliberate.
   * SplitText shatters the sentence into per-character elements, and that is
   * the markup a screen reader is left reading back -- so an unsplit heading is
   * both the correct reduced-motion rendering and the better one. WCAG 2.3.3. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.registerPlugin(SplitText)
  const split = SplitText.create('.split-text span', {
    type: "words, chars"
  })
  gsap.from(split.chars, {
    opacity: 0.5,
    duration: 0.1,
    stagger: 0.1,
  })
}
onMounted(() => {
  document.fonts.ready.then(() => {
    splitAnimation()
  })
})
watch(() => [props.text1, props.text2],
    () => nextTick(splitAnimation))
</script>

<template>
  <div class="flex flex-col items-center leading-[130%] text-heading-sm lg:text-heading-lg font-bold">
    <h2 :key="text1" class="split-text">
      <span class="block text-heading">{{ text1 }}</span>
      <span class="block text-action">{{ text2 }}</span>
    </h2>
  </div>
</template>
