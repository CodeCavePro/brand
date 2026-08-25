<script setup lang="ts">
import LinkedinIcon from "../../assets/icons/linkedin-icon.vue";
import VerifiedIcon from "../../assets/icons/verified-icon.vue";
import LazyImage from "./images/LazyImage.vue"

/* See ArticlePreview.vue: the fields read here, not the generated Strapi
 * `Testimonial`, which a caller may still pass unchanged. */
type TestimonialCard = {
  name: string
  position: string
  review: string
  verification: string | null
  linkedinurl: string
  photo: { url: string; name: string }
}

const props = defineProps<{
  item: TestimonialCard
  className?: string
  /* Injected by the site; omit it when the URLs are already absolute. */
  resolveImage?: (url: string) => string
}>()

const imageUrl = (url: string) => props.resolveImage?.(url) ?? url
</script>

<template>
  <div :class="`mx-1 lg:mx-2 testimonial rounded-custom space-y-2 lg:space-y-3 py-10 px-6 lg:px-11 ${className}`">
    <div class="flex flex-col lg:flex-row gap-5 lg:items-center">
      <LazyImage v-if="item.photo.name !== 'no-image.svg'" 
            class="w-12 lg:w-16 h-12 lg:h-16" :src="imageUrl(item.photo.url)"
           :alt=item.photo.name />
      <div>
        <div class="flex items-center gap-2">
          <p class="text-heading text-lg lg:text-xl">{{ item.name }}</p>
          <a
              v-if="item.linkedinurl.length > 1"
              target="_blank"
              rel='noopener noreferrer'
              class="text-default-transparent hover:text-action transition-colors"
              :href="item.linkedinurl">
            <component
                :is="LinkedinIcon"
            />
          </a>
        </div>
        <p class="text-sm text-body-secondary">{{ item.position }}</p>
      </div>
    </div>
    <p class="text-sm text-body-secondary-lighter whitespace-pre-wrap">
      {{ item.review }}
    </p>
    <div v-if="item.verification" class="flex items-center gap-1 text-action">
      <VerifiedIcon />
      <span>{{ item.verification }}</span>
    </div>
  </div>
</template>

<style scoped>
.testimonial {
  backdrop-filter: blur(32px);
}
</style>
