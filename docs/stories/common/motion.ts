import { onUnmounted } from 'vue';

/**
 * A decorator that forces `prefers-reduced-motion: reduce` for one story.
 *
 * A decorator rather than a play-function stub, because these components read
 * the environment in `onMounted` -- by the time `play` runs they have already
 * decided. A decorator's `setup` runs before its child's, which is the only
 * window there is.
 *
 * Shared between GlowButton and TypingEffect because they have the same
 * problem: the movement is GSAP driven from JavaScript, so a
 * `prefers-reduced-motion` block in a stylesheet cannot reach it and the guard
 * has to be in the component.
 */
export const reducedMotion = () => ({
  setup() {
    const real = window.matchMedia.bind(window);
    window.matchMedia = ((q: string) =>
      q.includes('prefers-reduced-motion')
        ? {
            matches: true, media: q, onchange: null,
            addEventListener() {}, removeEventListener() {},
            addListener() {}, removeListener() {}, dispatchEvent: () => false,
          }
        : real(q)) as typeof window.matchMedia;
    onUnmounted(() => { window.matchMedia = real; });
  },
  template: '<story />',
});
