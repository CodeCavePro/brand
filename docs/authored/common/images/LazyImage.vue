<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

interface Props {
  src: string;
  alt?: string;
  threshold?: number;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  threshold:300,
});

const image = ref<HTMLImageElement | null>(null);

let observer: IntersectionObserver | null = null;

const loadImage = () => {
  if (!image.value) {
    return;
  }

  const src = image.value.dataset.src;

  if (!src) {
    return;
  }

  image.value.src = src;
  image.value.removeAttribute('data-src');

  observer?.disconnect();
};

onMounted(() => {
  if (!image.value) {
    return;
  }
  
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (entry?.isIntersecting) {
        loadImage();
      }
    },
    {
      rootMargin: `${props.threshold}px`,
    },
  );

  observer.observe(image.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <img
    ref="image"
    :data-src="src"
    :alt="alt"
    :width="width"
    :height="height"
  />
</template>