<script setup lang="ts">
import { formattedDate } from "../../helpers/date-formatter.ts";
import { getImageUrl } from "../../helpers/image-url.ts";
import { paths } from "../../helpers/paths.ts";
import type { Article } from "../../lib/strapi/types";

defineProps<{
  article: Article
  className?: string
}>()
</script>

<template>
  <a :href="`${paths.insights}/${article.slug}`" :class="`mx-1 lg:mx-2 w-full h-full self-start sm:self-auto p-6 flex flex-col gap-5 sm:gap-8
      rounded-[2.25rem] bg-surface-secondary hover:bg-surface-secondary transition-colors cursor-pointer border-surface-tertiary border
      ${className ?? ''}`">
    <div class="flex flex-col sm:flex-row gap-5 sm:gap-8 h-fit">
      <img loading="lazy" class="sm:w-[132px] sm:h-[132px] rounded-xl object-cover" 
        :src="getImageUrl(article.cover.url)" 
        :alt="article.cover.name" 
        :width="100" 
        :height="100"/>
      <div class="space-y-2 sm:space-y-3">
        <time class="text-body-secondary text-xs sm:text-sm" :datetime="article.date?.toString()">
          {{ formattedDate(article.locale, article.date) }}
        </time>
        <h2 class="font-bold text-lg md:text-xl text-heading">
          {{ article.title }}
        </h2>
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
