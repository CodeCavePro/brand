import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import GlowButton from '../../authored/common/GlowButton.vue';
import { reducedMotion } from './motion';

const meta = {
  title: 'Common/GlowButton',
  component: GlowButton,
  tags: ['autodocs'],
  args: { title: 'Book a call', href: '#contact' },
} satisfies Meta<typeof GlowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

/**
 * The control for the two motion stories below.
 *
 * It asserts the tracking actually runs, which is what stops the reduced-motion
 * test from passing vacuously: if `userEvent.hover` never delivered a usable
 * mousemove, both would go green and neither would mean anything.
 */
export const TracksThePointer: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    const edges = canvasElement.querySelectorAll<HTMLElement>('.edge-glow');
    await expect(edges).toHaveLength(2);
    for (const edge of edges) await expect(edge.style.opacity).toBe('');
    await userEvent.hover(link);
    // The handler writes an inline opacity onto both edges on every move.
    for (const edge of edges) await expect(edge.style.opacity).not.toBe('');
  },
};

/**
 * FAILING ON PURPOSE. Nothing guards reduced motion.
 *
 * The pointer tween is GSAP driven from `mousemove`, so it is invisible to any
 * CSS kill-switch -- a `prefers-reduced-motion` block in a stylesheet cannot
 * reach it. A reader who has asked their operating system for less motion gets
 * the full tracking glow. WCAG 2.3.3, and WEBSITE-REVIEW 2.1.
 *
 * The component already has the shape of the fix: `isTouchDevice` is resolved in
 * `onMounted` from `matchMedia('(pointer: coarse)')` and every handler returns
 * early when it is true. One more query, the same early return.
 */
export const RespectsReducedMotion: Story = {
  decorators: [reducedMotion],
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await userEvent.hover(link);
    for (const edge of canvasElement.querySelectorAll<HTMLElement>('.edge-glow')) {
      await expect(edge.style.opacity).toBe('');
    }
  },
};

/**
 * FAILING ON PURPOSE. `class` lands on two elements.
 *
 * The prop is interpolated into the wrapper `<div>` and again into the inner
 * `<a>`. Anything positional double-applies: `mx-auto` centres twice, a margin
 * is paid twice, and a width cap constrains the wrapper and then re-caps the
 * anchor inside it. There is no spelling of the prop that reaches only one of
 * them, so a caller cannot work around it.
 */
export const ClassLandsOnce: Story = {
  args: { class: 'mx-auto' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.mx-auto')).toHaveLength(1);
  },
};
