<script setup lang="ts">
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { nextTick, onMounted, watch } from "vue";

const props = defineProps<{
  text1: string
  text2: string
}>()

const splitAnimation = () => {
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
