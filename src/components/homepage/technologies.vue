<script setup lang="ts">
import { computed, ref } from "vue";
import { Carousel, type CarouselConfig, Slide } from "vue3-carousel";
import "vue3-carousel/carousel.css";
import { BREAKPOINTS } from "@helpers/breakpoints.ts";
import GlowButton from "@codecavepro/brand/components/common/GlowButton.vue";
import TypingEffect from "@codecavepro/brand/components/common/effects/TypingEffect.vue";
import HeaderBrows from "@codecavepro/brand/components/common/HeaderBrows.vue";
import TechnologyCard from "./technology-card.vue";
import { carouselGestureLocker } from "@helpers/carousel-gesture-locker.ts";

/* See ArticlePreview.vue: the fields read here, not the generated Strapi
 * `Technology`, which a caller may still pass unchanged. This component
 * renders no images, so it needs no resolver. */
type TechnologySummary = {
  name: string
  title1: string
  title2: string
}

const props = defineProps<{
  technologies: TechnologySummary[]
  hideSelected?: boolean
  /* Where the consultation button goes. Was `paths.contactUs`, read straight
   * off this site's route table. */
  ctaHref?: string
  /* Technology name to service URL. Plain data rather than a resolver function
   * because every call site mounts this with `client:only`, and Astro can only
   * hand an island props it can serialise. @helpers/service-links.ts holds the
   * site's map; a name that is missing renders an inert button. */
  serviceLinks?: Record<string, string>
}>()

const activeIndex = ref(0)
const defaultAutoplayValue = 12000
const autoplay = ref(defaultAutoplayValue)
const handleMouseOver = (index: number) => {
  activeIndex.value = index
  autoplay.value = 0
}
const selectedTechnology = computed(() => {
  return props.technologies[activeIndex.value]
})
const handleMouseLeave = () => {
  activeIndex.value = 0
  autoplay.value = defaultAutoplayValue
}
const config = computed<Partial<CarouselConfig>>(() => ({
  gap: 8,
  itemsToShow: 'auto',
  autoplay: autoplay.value,
  wrapAround: true,
  height: 220,
  snapAlign: 'center',
  pauseAutoplayOnHover: true,
  transition: 500,
  breakpoints: {
    [BREAKPOINTS.md]: {
      gap: 16,
    },
    [BREAKPOINTS.xl]: {
      enabled: false,
    },
  }
}))
const carouselLocker = carouselGestureLocker()
</script>

<template>
  <section :class="`page-container
          ${hideSelected ? 'pt-8' : 'flex flex-col pt-4 md:pt-14 pb-20 xl:pb-0 swipe-over'}`">
    <div v-if="!hideSelected" class="flex flex-col items-center text-center">
      <div class="space-y-3">
        <HeaderBrows/>
        <TypingEffect
            :text1="selectedTechnology.title1"
            :text2="selectedTechnology.title2"
        />
      </div>
    </div>
    <div v-if="!hideSelected" class="self-center pt-10 pb-[4.5rem] md:pt-14 md:pb-16">
      <GlowButton title="Get a free consultation" :href="ctaHref" />
    </div>
    <div v-else class="pt-[7.5rem] pb-20 space-y-7 text-center">
      <h2 class="font-bold text-heading-md text-heading">
        Looking for something specific?
      </h2>
      <p class="text-xl mx-auto max-w-lg text-body-secondary-lighter">
        We offer a variety of services that might be a game-changer for your business.
      </p>
    </div>
    <div class="hidden xl:block relative h-80">
      <div
          v-for="(item, index) in technologies"
          :key="index"
          @mouseover="handleMouseOver(index)"
          @mouseleave="handleMouseLeave"
      >
        <TechnologyCard
            :name="item.name"
            :href="serviceLinks?.[item.name]"
            :active="activeIndex === index"
            className="w-72 h-72"
            :index="index"
        />
      </div>
    </div>
      <div ref="carouselLocker">
        <Carousel
            v-model="activeIndex"
            v-bind="config"
            class="-mx-4 xl:mx-0 xl:hidden"
        >
          <Slide v-for="(item, index) in technologies" :key="index">
            <div class="flex items-center w-[190px] h-[220px]">
            <TechnologyCard
                :name="item.name"
                :href="serviceLinks?.[item.name]"
                :active="activeIndex === index"
                :className="`w-full h-full ${activeIndex === index ? 'max-h-full' : 'max-h-[190px]'}`"
            />
            </div>
          </Slide>
        </Carousel>
    </div>
  </section>
</template>
