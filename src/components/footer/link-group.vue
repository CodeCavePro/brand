<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";
import { useId } from "vue";

/* Declared here rather than imported from ./links.ts, which is this site's
 * footer content. TypeScript is structural, so every existing caller still
 * passes exactly what it passed before -- links.ts's own `Link` satisfies this
 * -- but the component no longer reaches out of itself for a two-field shape.
 * Same reasoning as ArticlePreview.vue's ArticleSummary. */
type LinkItem = {
  name: string
  href: string
}

defineProps<{
  groupName: string
  items: LinkItem[]
}>()

/* The heading's id, generated rather than built from groupName: a group name
 * is display text, and "Отзывы о нас" has spaces, which an id cannot hold, so
 * aria-labelledby named nothing. Astro gives each rendered Vue app its own
 * idPrefix, so two groups on one page never collide. */
const labelId = useId()
</script>

<template>
  <nav :aria-labelledby="labelId" class="space-y-4">
    <p :id="labelId" class="text-body-secondary uppercase font-bold text-xs" >
      {{ groupName }}
    </p>
    <ul class="space-y-3 xl:space-y-2 text-sm">
      <li v-for="(item, index) in items" :key="index">
        <Button
            :title="item.name"
            as="link"
            :href="item.href"
            variant="text"
        />
      </li>
    </ul>
  </nav>
</template>
