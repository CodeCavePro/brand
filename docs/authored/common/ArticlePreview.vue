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
  /* `alternativeText` is what a CMS calls the field an editor writes for screen
   * readers; `name` is the upload's filename. Optional because it is routinely
   * empty, and where it is, an empty alt is the honest render -- a filename
   * read out in full describes nothing and cannot be skipped. WCAG 1.1.1. */
  cover: { url: string; name: string; alternativeText?: string | null }
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
  <!-- A draft with no slug has nowhere to go, and `slug` is typed `string |
       null` precisely because a CMS leaves it null until publish. Interpolated
       unguarded this built `/insights/null/` -- a card that looked entirely
       normal and linked to a 404. Without a destination it is not a link. -->
  <component :is="article.slug ? 'a' : 'div'" :href="article.slug ? `${basePath ?? ''}${article.slug}/` : undefined" :class="`mx-1 lg:mx-2 w-full h-full self-start sm:self-auto p-6 flex flex-col gap-5 sm:gap-8
      rounded-[2.25rem] bg-surface-secondary hover:bg-surface-secondary transition-colors cursor-pointer border-surface-tertiary border
      ${className ?? ''}`">
    <div class="flex flex-col sm:flex-row gap-5 sm:gap-8 h-fit">
      <img loading="lazy" class="sm:w-[132px] sm:h-[132px] rounded-xl object-cover" 
        :src="imageUrl(article.cover.url)" 
        :alt="article.cover.alternativeText ?? ''" 
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
  </component>
</template>
