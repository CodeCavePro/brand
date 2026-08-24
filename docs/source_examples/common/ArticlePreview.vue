<script setup lang="ts">
import { formattedDate } from "@helpers/date-formatter.ts";

/* The fields this component actually reads, instead of the generated Strapi
 * `Article`. TypeScript is structural, so a real Article still satisfies this
 * -- callers pass exactly what they passed before -- but the component no
 * longer carries the CMS schema with it. */
type ArticleSummary = {
  slug: string | null
  title: string
  excerpt: string
  date: Date | null
  locale: string | null
  readingtime: unknown
  cover: { url: string; name: string }
}

const props = defineProps<{
  article: ArticleSummary
  className?: string
  /* CMS media URLs arrive relative ("uploads/x.png"). The site injects its own
   * resolver; a caller whose URLs are already absolute passes nothing. */
  resolveImage?: (url: string) => string
  /* Prefix the slug is appended to. Was `paths.insights`, read straight off
   * this site's route table -- the last thing keeping this component from
   * being installable. The caller owns where its articles live. */
  basePath?: string
}>()

const imageUrl = (url: string) => props.resolveImage?.(url) ?? url
</script>

<template>
  <a :href="`${basePath ?? ''}${article.slug}/`" :class="`mx-1 lg:mx-2 w-full h-full self-start sm:self-auto p-6 flex flex-col gap-5 sm:gap-8
      rounded-[2.25rem] bg-surface-secondary hover:bg-surface-secondary transition-colors cursor-pointer border-surface-tertiary border
      ${className ?? ''}`">
    <div class="flex flex-col sm:flex-row gap-5 sm:gap-8 h-fit">
      <img loading="lazy" class="sm:w-[132px] sm:h-[132px] rounded-xl object-cover" 
        :src="imageUrl(article.cover.url)" 
        :alt="article.cover.name" 
        :width="100" 
        :height="100"/>
      <div class="space-y-2 sm:space-y-3">
        <time class="text-body-secondary text-xs sm:text-sm" :datetime="article.date?.toString()">
          {{ formattedDate(article.locale, article.date) }}
        </time>
        <h3 class="font-bold text-lg md:text-xl text-heading">
          {{ article.title }}
        </h3>
      </div>
    </div>
    <div class="text-sm flex flex-col justify-between h-full">
      <p class="text-body-secondary-lighter">
        {{ article.excerpt }}
      </p>
      <p class="text-xs sm:text-sm text-body-secondary mt-6 sm:mt-7">
        Reading time: {{ article.readingtime }} m.
      </p>
    </div>
  </a>
</template>
