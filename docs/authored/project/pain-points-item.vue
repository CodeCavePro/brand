<script setup lang="ts">
import { Marked, type RendererObject } from "marked";
import LazyImage from "../common/images/LazyImage.vue"
import { sanitize } from "isomorphic-dompurify";

/* See ArticlePreview.vue: the fields read here, not the generated Strapi
 * `Feature`, which a caller may still pass unchanged. */
type PainPoint = {
  content: unknown
  image: { url: string; name: string }
}

const props = defineProps<{
  item: PainPoint
  /* Injected by the site; omit it when the URLs are already absolute. */
  resolveImage?: (url: string) => string
}>()

const imageUrl = (url: string) => props.resolveImage?.(url) ?? url

const marked = new Marked()
const renderer: RendererObject = {
  paragraph({ tokens }) {
    return `<p class="text-lg">${this.parser.parseInline(tokens)}</p>`;
  },
  list(token) {
    const body = token.items.map(item => `<li>${this.parser.parse(item.tokens)}</li>`).join('');
    
    const type = token.ordered ? 'ol' : 'ul';
    return `<${type} class="pt-2 pl-5 list-disc">${body}</${type}>`;
  }
}
marked.use({ renderer })
const contentString = (typeof props.item.content === 'string' ? props.item.content : '') || ''
const htmlContent = sanitize(marked.parse(contentString, { async: false }))
</script>

<template>
  <div class="mx-1 md:mx-0 p-6 w-56 h-full md:h-auto rounded-3xl bg-surface-secondary space-y-6">
    <LazyImage
        :src="imageUrl(item.image.url)"
        :alt="item.image.name"
        class="w-8 h-8"
    />
    <div
      v-html="htmlContent"
      class="text-body-secondary-lighter" 
    />
  </div>
</template>
