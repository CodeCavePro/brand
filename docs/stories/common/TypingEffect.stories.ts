import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';
import TypingEffect from '../../authored/common/effects/TypingEffect.vue';
import { reducedMotion } from './motion';

const meta = {
  title: 'Common/TypingEffect',
  component: TypingEffect,
  tags: ['autodocs'],
  args: { text1: 'We build software', text2: 'that outlives the pitch deck' },
} satisfies Meta<typeof TypingEffect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/** The text has to survive being split into characters and put back. */
export const KeepsItsText: Story = {
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading');
    await waitFor(async () => {
      await expect(heading.textContent?.replace(/\s+/g, ' ')).toContain('We build software');
      await expect(heading.textContent?.replace(/\s+/g, ' ')).toContain('outlives the pitch deck');
    });
  },
};

/**
 * The control for the story below.
 *
 * SplitText rewrites the heading into per-character elements and `gsap.from`
 * writes an inline opacity onto each one while the stagger runs. Asserting that
 * happens is what stops the reduced-motion test from passing vacuously -- if
 * the animation never started at all, both would go green and neither would
 * mean anything.
 */
export const AnimatesPerCharacter: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(canvasElement.querySelectorAll('[style*="opacity"]').length).toBeGreaterThan(0);
    });
  },
};

/**
 * FAILING ON PURPOSE. Nothing guards reduced motion.
 *
 * `splitAnimation` runs from `onMounted` and again on every text change, and it
 * is GSAP throughout -- so no stylesheet can switch it off. A reader who has
 * asked their operating system for less motion gets every character of the
 * headline staggered at them. WCAG 2.3.3, and the other half of
 * WEBSITE-REVIEW 2.1.
 *
 * The fix is the whole of `splitAnimation`, not the tween inside it: unsplit
 * text is the correct reduced-motion rendering, and it is also the markup a
 * screen reader wants, since SplitText shatters a sentence into per-character
 * elements.
 */
export const RespectsReducedMotion: Story = {
  decorators: [reducedMotion],
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading');
    await waitFor(async () => {
      await expect(heading.textContent).toContain('We build software');
    });
    await expect(canvasElement.querySelectorAll('[style*="opacity"]')).toHaveLength(0);
  },
};
