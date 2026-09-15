<script setup lang="ts">
import Button from "@codecavepro/brand/components/common/Button.vue";

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
</script>

<template>
  <nav :aria-labelledby="`${groupName}-label`" class="space-y-4">
    <p :id="`${groupName}-label`" class="text-body-secondary uppercase font-bold text-xs" >
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
