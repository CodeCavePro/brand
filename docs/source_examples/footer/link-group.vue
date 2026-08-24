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
  <div class="space-y-4">
    <p class="text-body-secondary uppercase font-bold text-xs">
      {{ groupName }}
    </p>
    <div class="space-y-3 xl:space-y-2 text-sm">
      <div :key="index" v-for="(item, index) in items">
        <Button
            :title="item.name"
            as="link"
            :href="item.href"
            variant="text"
        />
      </div>
    </div>
  </div>
</template>
