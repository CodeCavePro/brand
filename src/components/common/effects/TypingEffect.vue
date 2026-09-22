<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

const props = defineProps<{
  text1: string
  text2: string
}>()

const typingEffectContainer = ref<HTMLElement | null>(null)
const splitAnimation = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  if (!typingEffectContainer.value) {
    return
  }

  gsap.registerPlugin(SplitText)

  const split = SplitText.create(
    typingEffectContainer.value.querySelectorAll('.split-text span'),
    {
      type: 'words, chars'
    }
  )
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
  <div ref="typingEffectContainer" class="flex flex-col items-center leading-[130%] text-heading-md md:text-heading-lg font-bold">
    <h1 :key="text1" class="split-text text-heading text-[36px] md:text-[44px] xl:text-5xl ">
      <span class="block text-heading">{{ text1 }}</span>
      <span class="block text-action">{{ text2 }}</span>
    </h1>
  </div>
</template>
